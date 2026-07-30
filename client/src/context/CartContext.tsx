import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product, AppliedPromo } from '../types';
import { shippingFor, effectivePrice } from '../lib/constants';

// A cart line is uniquely identified by product id + selected color.
export function lineId(productId: string, color?: string): string {
  return `${productId}::${color ?? ''}`;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  promo: AppliedPromo | null;
  governorate: string;
  addItem: (product: Product, qty?: number, color?: string) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  applyPromo: (promo: AppliedPromo) => void;
  removePromo: () => void;
  setGovernorate: (governorate: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'jc_cart';
const PROMO_KEY = 'jc_promo';
const GOV_KEY = 'jc_governorate';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  });

  const [promo, setPromo] = useState<AppliedPromo | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(PROMO_KEY) ?? 'null');
    } catch {
      return null;
    }
  });

  const [governorate, setGovernorateState] = useState<string>(
    () => localStorage.getItem(GOV_KEY) ?? ''
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (promo) localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
    else localStorage.removeItem(PROMO_KEY);
  }, [promo]);

  useEffect(() => {
    if (governorate) localStorage.setItem(GOV_KEY, governorate);
    else localStorage.removeItem(GOV_KEY);
  }, [governorate]);

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

  function applyPromo(next: AppliedPromo) {
    setPromo(next);
  }

  function removePromo() {
    setPromo(null);
  }

  function setGovernorate(next: string) {
    setGovernorateState(next);
  }

  function clear() {
    setItems([]);
    setPromo(null);
  }

  const subtotal = items.reduce((sum, i) => sum + effectivePrice(i.product) * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const shipping = items.length > 0 ? shippingFor(governorate) : 0;
  const discount = promo ? Math.round((subtotal * promo.discountPercent) / 100) : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      shipping,
      discount,
      total,
      promo,
      governorate,
      addItem,
      removeItem,
      setQty,
      applyPromo,
      removePromo,
      setGovernorate,
      clear,
    }),
    [items, count, subtotal, shipping, discount, total, promo, governorate]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
