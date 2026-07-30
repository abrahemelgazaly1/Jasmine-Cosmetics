import { Router } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { PromoCode, promoStatus } from '../models/PromoCode.js';
import { auth, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { shippingFor } from '../config.js';

const router = Router();

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1),
        qty: z.number().int().min(1),
        color: z.string().optional().default(''),
      })
    )
    .min(1),
  promoCode: z.string().optional().default(''),
  customer: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    governorate: z.string().min(1),
    address: z.string().min(3),
    phone1: z.string().min(6),
    phone2: z.string().optional().default(''),
  }),
});

// Create order (guest or logged-in). Prices resolved server-side.
router.post('/', optionalAuth, async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }
  const { items, customer } = parsed.data;
  const promoInput = parsed.data.promoCode?.trim().toUpperCase() ?? '';

  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItems = [];
  let subtotal = 0;
  for (const item of items) {
    const p = productMap.get(item.product);
    if (!p) {
      res.status(400).json({ message: `Product ${item.product} not found` });
      return;
    }
    if (p.isSoldOut) {
      res.status(400).json({ message: `${p.name} is sold out` });
      return;
    }
    const unitPrice = p.isOffer && p.offerPrice != null ? p.offerPrice : p.price;
    subtotal += unitPrice * item.qty;
    orderItems.push({
      product: p._id,
      name: p.name,
      price: unitPrice,
      qty: item.qty,
      color: item.color ?? '',
      image: p.images?.[0] ?? '',
    });
  }

  // Apply a promo code discount when supplied and still valid.
  let discount = 0;
  let appliedCode = '';
  if (promoInput) {
    const promo = await PromoCode.findOne({ code: promoInput });
    if (!promo) {
      res.status(400).json({ message: 'This promo code is not valid.' });
      return;
    }
    const status = promoStatus(promo);
    if (!status.valid) {
      res.status(400).json({ message: status.message });
      return;
    }
    discount = Math.round((subtotal * promo.discountPercent) / 100);
    appliedCode = promo.code;
    promo.usedCount += 1;
    await promo.save();
  }

  const shipping = shippingFor(customer.governorate);
  const total = subtotal + shipping - discount;
  const order = await Order.create({
    user: req.user?.id ?? null,
    items: orderItems,
    customer,
    subtotal,
    shipping,
    discount,
    promoCode: appliedCode,
    total,
    paymentMethod: 'COD',
  });

  res.status(201).json({ order });
});

router.get('/mine', auth, async (req, res) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json({ items: orders });
});

router.get('/', auth, requireAdmin, async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ items: orders });
});

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

router.put('/:id/status', auth, requireAdmin, async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: parsed.data.status },
    { new: true }
  );
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.json({ order });
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.json({ message: 'Deleted' });
});

export default router;
