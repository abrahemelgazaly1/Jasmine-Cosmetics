import { Router } from 'express';
import { z } from 'zod';
import { PromoCode, promoStatus } from '../models/PromoCode.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, requireAdmin, async (_req, res) => {
  const items = await PromoCode.find().sort({ createdAt: -1 });
  res.json({ items });
});

const createSchema = z.object({
  code: z.string().min(1).transform((s) => s.trim().toUpperCase()),
  discountPercent: z.number().min(1).max(100),
  maxUse: z.number().int().min(1),
  validDays: z.number().int().min(1),
});

router.post('/', auth, requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }
  const { code, discountPercent, maxUse, validDays } = parsed.data;

  const exists = await PromoCode.findOne({ code });
  if (exists) {
    res.status(409).json({ message: 'A promo code with this name already exists.' });
    return;
  }

  const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);
  const promo = await PromoCode.create({ code, discountPercent, maxUse, expiresAt });
  res.status(201).json({ promo });
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const promo = await PromoCode.findByIdAndDelete(req.params.id);
  if (!promo) {
    res.status(404).json({ message: 'Promo code not found' });
    return;
  }
  res.json({ message: 'Deleted' });
});

const validateSchema = z.object({
  code: z.string().min(1).transform((s) => s.trim().toUpperCase()),
});

router.post('/validate', async (req, res) => {
  const parsed = validateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Please enter a promo code.' });
    return;
  }
  const promo = await PromoCode.findOne({ code: parsed.data.code });
  if (!promo) {
    res.status(404).json({ message: 'This promo code is not valid.' });
    return;
  }
  const status = promoStatus(promo);
  if (!status.valid) {
    res.status(400).json({ message: status.message });
    return;
  }
  res.json({
    valid: true,
    code: promo.code,
    discountPercent: promo.discountPercent,
  });
});

export default router;
