import { Router } from 'express';
import { z } from 'zod';
import { Category } from './_models';
import { auth, requireAdmin, slugify } from './_middleware';

const router = Router();

router.get('/', async (_req, res) => {
  const items = await Category.find().sort({ name: 1 });
  res.json({ items });
});

router.get('/:slug', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.json({ category });
});

const categorySchema = z.object({
  name: z.string().min(1),
  image: z.string().optional().default(''),
});

router.post('/', auth, requireAdmin, async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }
  const category = await Category.create({ ...parsed.data, slug: slugify(parsed.data.name) });
  res.status(201).json({ category });
});

router.put('/:id', auth, requireAdmin, async (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }
  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) update.slug = slugify(parsed.data.name);
  const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.json({ category });
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.json({ message: 'Deleted' });
});

export default router;
