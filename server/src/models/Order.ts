import { Schema, model, InferSchemaType } from 'mongoose';

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

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const Order = model('Order', orderSchema);
