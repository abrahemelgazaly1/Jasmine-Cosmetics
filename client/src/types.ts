export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  howToUse: string;
  price: number;
  offerPrice?: number | null;
  images: string[];
  colors: string[];
  category: Category | string;
  isFeatured: boolean;
  isOffer: boolean;
  isSoldOut: boolean;
  stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  savedInfo?: CustomerInfo | null;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  governorate: string;
  address: string;
  phone1: string;
  phone2?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  color?: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  qty: number;
  color?: string;
  image: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  customer: CustomerInfo;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
