import { Schema, model, InferSchemaType } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, default: '' }, // base64 data URL
  },
  { timestamps: true }
);

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = model('Category', categorySchema);
