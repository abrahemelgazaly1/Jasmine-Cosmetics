import { Schema, model, InferSchemaType, Types } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    howToUse: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, default: null }, // when set with isOffer, this is the discounted price
    images: { type: [String], default: [] }, // base64 data URLs; [0] primary, [1] hover
    colors: { type: [String], default: [] }, // color names for Lip Gloss / Liquid Blush
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isFeatured: { type: Boolean, default: false },
    isOffer: { type: Boolean, default: false },
    isSoldOut: { type: Boolean, default: false },
    stock: { type: Number, default: 100, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text' });

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: Types.ObjectId };
export const Product = model('Product', productSchema);
