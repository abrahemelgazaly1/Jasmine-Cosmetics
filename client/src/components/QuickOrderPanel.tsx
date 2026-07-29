import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { formatPrice, findColorOption } from '../lib/constants';
import { useCart } from '../context/CartContext';
import { CloseIcon, ChevronDown } from './icons';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function QuickOrderPanel({ product, onClose }: Props) {
  const { addItem } = useCart();
  const [descOpen, setDescOpen] = useState(false);
  const [color, setColor] = useState('');
  const open = Boolean(product);
  const onOffer = product?.isOffer && product.offerPrice != null;
  const colors = product?.colors ?? [];

  useEffect(() => {
    setColor(product?.colors?.length ? product.colors[0] : '');
    setDescOpen(false);
  }, [product]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {product && (
          <>
            <div className="flex items-center justify-between border-b border-pink-light px-6 py-4">
              <h3 className="font-serif text-lg text-ink">Quick Order</h3>
              <button onClick={onClose} aria-label="Close" className="text-ink/60 hover:text-pink-deep">
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="overflow-hidden rounded-2xl bg-pink-light">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <h4 className="mt-4 font-serif text-xl text-ink">{product.name}</h4>
              {onOffer ? (
                <p className="mt-1 text-lg font-semibold text-pink-deep">
                  <span className="mr-2 text-base text-ink/40 line-through">
                    {formatPrice(product.price)}
                  </span>
                  {formatPrice(product.offerPrice as number)}
                </p>
              ) : (
                <p className="mt-1 text-lg font-semibold text-pink-deep">
                  {formatPrice(product.price)}
                </p>
              )}

              {/* Colours */}
              {colors.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-ink/70">
                    Colours{color ? `: ${color}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((name) => {
                      const opt = findColorOption(name);
                      const selected = color === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setColor(name)}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                            selected
                              ? 'border-pink-accent bg-pink-light text-pink-deep'
                              : 'border-pink-soft text-ink/70 hover:border-pink-accent'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full ring-1 ring-black/10"
                            style={{ background: opt?.hex ?? '#ddd' }}
                          />
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => setDescOpen((v) => !v)}
                className="mt-5 flex w-full items-center justify-between border-y border-pink-light py-3 text-sm font-medium text-ink"
              >
                Description
                <ChevronDown className={`h-5 w-5 transition-transform ${descOpen ? 'rotate-180' : ''}`} />
              </button>
              {descOpen && (
                <p className="py-3 text-sm leading-relaxed text-ink/70">{product.description}</p>
              )}
            </div>

            <div className="flex gap-2 border-t border-pink-light px-6 py-4">
              <button
                onClick={() => {
                  if (product.isSoldOut) return;
                  addItem(product, 1, color || undefined);
                  onClose();
                }}
                disabled={product.isSoldOut}
                className="btn-primary basis-[70%] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {product.isSoldOut ? 'Sold Out' : 'Add to Cart'}
              </button>
              <button onClick={onClose} className="btn-outline basis-[25%]">
                Cancel
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
