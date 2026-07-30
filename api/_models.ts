import mongoose, { Schema, InferSchemaType, Types } from 'mongoose';

/* ------------------------------- Category ------------------------------- */
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, default: '' }, // base64 data URL
  },
  { timestamps: true }
);

/* --------------------------------- User --------------------------------- */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    savedInfo: {
      fullName: String,
      email: String,
      governorate: String,
      address: String,
      phone1: String,
      phone2: String,
    },
  },
  { timestamps: true }
);

/* -------------------------------- Product ------------------------------- */
const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    howToUse: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, default: null },
    images: { type: [String], default: [] }, // base64 data URLs; [0] primary, [1] hover
    colors: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isFeatured: { type: Boolean, default: false },
    isOffer: { type: Boolean, default: false },
    isSoldOut: { type: Boolean, default: false },
    stock: { type: Number, default: 100, min: 0 },
  },
  { timestamps: true }
);
productSchema.index({ name: 'text' });

/* --------------------------------- Order -------------------------------- */
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    color: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    items: { type: [orderItemSchema], required: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      governorate: { type: String, required: true },
      address: { type: String, required: true },
      phone1: { type: String, required: true },
      phone2: { type: String, default: '' },
    },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    promoCode: { type: String, default: '' },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

/* ------------------------------- PromoCode ------------------------------ */
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

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export type UserDoc = InferSchemaType<typeof userSchema>;
export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: Types.ObjectId };
export type OrderDoc = InferSchemaType<typeof orderSchema>;
export type PromoCodeDoc = InferSchemaType<typeof promoCodeSchema> & { _id: Types.ObjectId };

// Guard against model re-compilation on warm serverless invocations.
export const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const PromoCode =
  mongoose.models.PromoCode || mongoose.model('PromoCode', promoCodeSchema);
