import { Link } from 'react-router-dom';
import { useCart, lineId } from '../context/CartContext';
import { formatPrice, effectivePrice, findColorOption } from '../lib/constants';
import QuantityStepper from '../components/QuantityStepper';
import { TrashIcon } from '../components/icons';
import type { Category } from '../types';
import { useDocumentTitle } from '../lib/seo';

export default function Cart() {
  useDocumentTitle('Your Cart');
  const { items, subtotal, shipping, total, setQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="section-title mb-4">Your Cart</h1>
        <p className="text-ink/50">Your cart is empty.</p>
        <Link to="/products" className="btn-primary mt-6">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="section-title mb-8">Cart</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, qty, color }) => {
            const category = product.category as Category;
            const id = lineId(product._id, color);
            const swatch = color ? findColorOption(color) : undefined;
            return (
              <div
                key={id}
                className="flex gap-4 rounded-2xl border border-pink-light p-4"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-24 w-24 shrink-0 rounded-xl object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg text-ink">{product.name}</h3>
                      {typeof category === 'object' && (
                        <p className="text-xs uppercase tracking-wide text-pink-accent">
                          {category.name}
                        </p>
                      )}
                      {color && (
                        <p className="mt-1 flex items-center gap-2 text-xs text-ink/70">
                          <span
                            className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                            style={{ background: swatch?.hex ?? '#ddd' }}
                          />
                          {color}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(id)}
                      className="text-ink/40 hover:text-pink-deep"
                      aria-label="Remove"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper value={qty} onChange={(v) => setQty(id, v)} />
                    <p className="font-semibold text-pink-deep">
                      {formatPrice(effectivePrice(product) * qty)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-pink-light bg-pink-light p-6">
          <h2 className="mb-4 font-serif text-xl text-ink">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping / Delivery</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <hr className="border-pink-soft" />
            <div className="flex justify-between text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary mt-6 w-full">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
