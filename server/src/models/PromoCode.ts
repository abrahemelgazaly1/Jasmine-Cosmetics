import { Schema, model, InferSchemaType } from 'mongoose';

const promoCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    maxUse: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export type PromoCodeDoc = InferSchemaType<typeof promoCodeSchema>;
export const PromoCode = model('PromoCode', promoCodeSchema);

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
