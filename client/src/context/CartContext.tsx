import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { SHIPPING_FEE, effectivePrice } from '../lib/constants';

// A cart line is uniquely identified by product id + selected color.
export function lineId(productId: string, color?: string): string {
  return `${productId}::${color ?? ''}`;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  addItem: (product: Product, qty?: number, color?: string) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'jc_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product: Product, qty = 1, color?: string) {
    setItems((prev) => {
      const id = lineId(product._id, color);
      const existing = prev.find((i) => lineId(i.product._id, i.color) === id);
      if (existing) {
        return prev.map((i) =>
          lineId(i.product._id, i.color) === id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { product, qty, color }];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => lineId(i.product._id, i.color) !== id));
  }

  function setQty(id: string, qty: number) {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (lineId(i.product._id, i.color) === id ? { ...i, qty } : i))
    );
  }

  function clear() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + effectivePrice(i.product) * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  const value = useMemo(
    () => ({ items, count, subtotal, shipping, total, addItem, removeItem, setQty, clear }),
    [items, count, subtotal, shipping, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
