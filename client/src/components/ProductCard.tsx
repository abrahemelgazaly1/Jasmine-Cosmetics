import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPrice, effectivePrice } from '../lib/constants';
import { CartIcon, HeartIcon } from './icons';
import { useWishlist } from '../context/WishlistContext';

interface Props {
  product: Product;
  showActions?: boolean;
  onQuickOrder?: (product: Product) => void;
}

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23FCE7EF"/></svg>'
  );

export default function ProductCard({ product, showActions = false, onQuickOrder }: Props) {
  const [hover, setHover] = useState(false);
  const { has, toggle } = useWishlist();

  const primary = product.images[0] || PLACEHOLDER;
  const secondary = product.images[1] || primary;
  const wished = has(product._id);
  const onOffer = product.isOffer && product.offerPrice != null;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Corner labels */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1">
        {onOffer && (
          <span className="rounded-full bg-pink-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Offers
          </span>
        )}
        {product.isSoldOut && (
          <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Sold out
          </span>
        )}
      </div>

      {showActions && !product.isSoldOut && (
        <div
          className={`absolute right-3 top-3 z-10 flex flex-col gap-2 transition-opacity duration-200 ${
            hover ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={() => onQuickOrder?.(product)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-pink-deep shadow-card hover:bg-pink-accent hover:text-white"
            aria-label="Quick order"
          >
            <CartIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => toggle(product)}
            className={`grid h-9 w-9 place-items-center rounded-full shadow-card hover:bg-pink-accent hover:text-white ${
              wished ? 'bg-pink-accent text-white' : 'bg-white text-pink-deep'
            }`}
            aria-label="Add to wishlist"
          >
            <HeartIcon className="h-5 w-5" filled={wished} />
          </button>
        </div>
      )}

      <Link to={`/products/${product._id}/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-pink-light">
          <img
            src={primary}
            alt={product.name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              hover ? 'opacity-0' : 'opacity-100'
            } ${product.isSoldOut ? 'grayscale' : ''}`}
            loading="lazy"
          />
          <img
            src={secondary}
            alt={product.name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              hover ? 'opacity-100' : 'opacity-0'
            } ${product.isSoldOut ? 'grayscale' : ''}`}
            loading="lazy"
          />
        </div>
        <div className="mt-3 text-center">
          <h3 className="font-serif text-base text-ink">{product.name}</h3>
          {onOffer ? (
            <p className="mt-1 text-sm font-semibold text-pink-deep">
              <span className="mr-2 text-ink/40 line-through">{formatPrice(product.price)}</span>
              {formatPrice(product.offerPrice as number)}
            </p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-pink-deep">
              {formatPrice(effectivePrice(product))}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
