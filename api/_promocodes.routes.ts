import { Router } from 'express';
import { z } from 'zod';
import { PromoCode } from './_models';
import { auth, requireAdmin } from './_middleware';

const router = Router();

// Shared validity check used by both the public validate route and order creation.
export function promoStatus(promo: {
  expiresAt: Date;
  usedCount: number;
  maxUse: number;
}): { valid: true } | { valid: false; message: string } {
  if (new Date(promo.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: 'This promo code has expired.' };
  }
  if (promo.usedCount >= promo.maxUse) {
    return {
      valid: false,
      message: 'This promo code has reached its usage limit. Please wait for a new one.',
    };
  }
  return { valid: true };
}

// GET /api/promocodes  (admin) — list all promo codes
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

// POST /api/promocodes  (admin) — generate a new promo code
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

// DELETE /api/promocodes/:id  (admin)
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

// POST /api/promocodes/validate  (public) — check a code before applying it
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
