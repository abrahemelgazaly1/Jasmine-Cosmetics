import { Schema, model, InferSchemaType } from 'mongoose';

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

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
