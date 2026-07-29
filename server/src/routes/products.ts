import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { auth, requireAdmin } from '../middleware/auth.js';
import { slugify } from '../middleware/error.js';

const router = Router();

// GET /api/products?search=&category=<slug>&sort=&offer=&featured=&page=&limit=
router.get('/', async (req, res) => {
  const { search, category, sort, offer, featured } = req.query as Record<string, string>;
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(60, Math.max(1, Number(req.query.limit ?? 24)));

  const filter: Record<string, unknown> = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (offer === 'true') filter.isOffer = true;
  if (featured === 'true') filter.isFeatured = true;

  if (category) {
    const { Category } = await import('../models/Category.js');
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
    else {
      res.json({ items: [], total: 0, page, pages: 0 });
      return;
    }
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    name_asc: { name: 1 },
  };
  const sortBy = sortMap[sort] ?? { createdAt: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.get('/featured', async (_req, res) => {
  const items = await Product.find({ isFeatured: true }).populate('category', 'name slug').limit(12);
  res.json({ items });
});

router.get('/offers', async (req, res) => {
  const limit = Math.min(60, Number(req.query.limit ?? 8));
  const items = await Product.find({ isOffer: true, offerPrice: { $ne: null } })
    .populate('category', 'name slug')
    .limit(limit);
  res.json({ items });
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.json({ product });
});

router.get('/:id/similar', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  const items = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .populate('category', 'name slug')
    .limit(4);
  res.json({ items });
});

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  howToUse: z.string().optional().default(''),
  price: z.number().min(0),
  offerPrice: z.number().min(0).nullable().optional(),
  images: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  category: z.string().min(1),
  isFeatured: z.boolean().optional().default(false),
  isOffer: z.boolean().optional().default(false),
  isSoldOut: z.boolean().optional().default(false),
  stock: z.number().min(0).optional().default(100),
});

router.post('/', auth, requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }
  const product = await Product.create({ ...parsed.data, slug: slugify(parsed.data.name) });
  res.status(201).json({ product });
});

router.put('/:id', auth, requireAdmin, async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }
  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) update.slug = slugify(parsed.data.name);
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.json({ product });
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.json({ message: 'Deleted' });
});

export default router;
