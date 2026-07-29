import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Category, Product } from '../types';
import { formatPrice, findColorOption } from '../lib/constants';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import QuantityStepper from '../components/QuantityStepper';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { ChevronDown, HeartIcon } from '../components/icons';
import { useDocumentTitle } from '../lib/seo';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [descOpen, setDescOpen] = useState(false);
  const [color, setColor] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get<{ product: Product }>(`/products/${id}`)).data.product,
    enabled: Boolean(id),
  });

  const { data: similar } = useQuery({
    queryKey: ['similar', id],
    queryFn: async () => (await api.get<{ items: Product[] }>(`/products/${id}/similar`)).data.items,
    enabled: Boolean(id),
  });

  const categoryName = useMemo(() => {
    const c = product?.category as Category | undefined;
    return typeof c === 'object' ? c?.name : '';
  }, [product]);

  // Default to the first available colour.
  useEffect(() => {
    if (product?.colors?.length) setColor(product.colors[0]);
  }, [product]);

  useDocumentTitle(product?.name);

  if (isLoading) return <div className="container-x py-20"><Spinner /></div>;
  if (!product) return <div className="container-x py-20 text-center text-ink/50">Product not found.</div>;

  const images = product.images.length ? product.images : [''];
  const wished = has(product._id);
  const onOffer = product.isOffer && product.offerPrice != null;
  const colors = product.colors ?? [];

  return (
    <div className="container-x py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-ink/70">
        <Link to="/" className="hover:text-pink-deep">Home</Link>
        <span className="mx-2">&gt;</span>
        <Link to="/products" className="hover:text-pink-deep">Products</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images: manual slider + thumbnails in 2 rows */}
        <div className="mx-auto w-full min-w-0 max-w-sm lg:max-w-none">
          <div className="overflow-hidden rounded-3xl bg-pink-soft">
            <img
              src={images[activeImage]}
              alt={product.name}
              className="aspect-square w-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 grid-rows-2 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square overflow-hidden rounded-xl border-2 bg-pink-soft transition ${
                    activeImage === i ? 'border-pink-accent' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          {categoryName && (
            <p className="text-sm uppercase tracking-widest text-pink-accent">{categoryName}</p>
          )}
          <h1 className="mt-2 break-words font-serif text-3xl font-semibold text-ink sm:text-4xl">{product.name}</h1>
          {onOffer ? (
            <p className="mt-4 text-2xl font-semibold text-pink-deep">
              <span className="mr-3 text-xl text-ink/40 line-through">{formatPrice(product.price)}</span>
              {formatPrice(product.offerPrice as number)}
            </p>
          ) : (
            <p className="mt-4 text-2xl font-semibold text-pink-deep">{formatPrice(product.price)}</p>
          )}
          {product.isSoldOut && (
            <p className="mt-3 inline-block rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase text-white">
              Sold out
            </p>
          )}

          {/* Description dropdown */}
          <button
            onClick={() => setDescOpen((v) => !v)}
            className="mt-6 flex w-full items-center justify-between border-y border-pink-soft py-3 text-sm font-medium text-ink"
          >
            Description
            <ChevronDown className={`h-5 w-5 transition-transform ${descOpen ? 'rotate-180' : ''}`} />
          </button>
          {descOpen && (
            <p className="whitespace-pre-line break-words py-3 text-sm leading-relaxed text-ink/70">{product.description}</p>
          )}

          {/* Colours */}
          {colors.length > 0 && (
            <div className="mt-6">
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

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium text-ink/70">Quantity</span>
            <QuantityStepper value={qty} onChange={setQty} />
          </div>

          {/* Add to cart 70% / Wishlist 25% */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => addItem(product, qty, color || undefined)}
              disabled={product.isSoldOut}
              className="btn-primary basis-[70%] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {product.isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button
              onClick={() => toggle(product)}
              className={`btn-outline basis-[25%] gap-1 ${wished ? 'bg-pink-soft' : ''}`}
            >
              <HeartIcon className="h-5 w-5" filled={wished} />
            </button>
          </div>

          {/* Proceed to checkout full width */}
          <button
            onClick={() => {
              addItem(product, qty, color || undefined);
              navigate('/checkout');
            }}
            disabled={product.isSoldOut}
            className="btn-dark mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proceed to Checkout
          </button>

          {/* How to use */}
          <div className="mt-10">
            <h2 className="font-serif text-2xl text-ink">How to Use?</h2>
            <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-ink/70">
              {product.howToUse || 'Usage instructions will be added soon.'}
            </p>
          </div>
        </div>
      </div>

      {/* Similar products */}
      {similar && similar.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-8 text-center">Similar Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {similar.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
