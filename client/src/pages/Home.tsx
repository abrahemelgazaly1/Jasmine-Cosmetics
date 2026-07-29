import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import QuickOrderPanel from '../components/QuickOrderPanel';
import Spinner from '../components/Spinner';
import { InstagramIcon } from '../components/icons';
import { useDocumentTitle } from '../lib/seo';

const HERO_IMG = '/heronew.png';
const HERO_MOBILE_IMG = '/heronew.png';

const INSTA_IMAGES = [
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
];

function FeaturedCarousel({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  // Duplicate the list so the marquee can loop seamlessly.
  const loop = [...products, ...products];

  return (
    <div className="group relative overflow-hidden">
      <div className="flex w-max animate-marquee gap-4 sm:gap-6 group-hover:[animation-play-state:paused]">
        {loop.map((p, i) => (
          <div key={`${p._id}-${i}`} className="w-[200px] shrink-0 sm:w-[230px] lg:w-[260px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  useDocumentTitle();
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);

  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: async () => (await api.get<{ items: Product[] }>('/products/featured')).data.items,
  });

  const { data: offers } = useQuery({
    queryKey: ['offers', 8],
    queryFn: async () =>
      (await api.get<{ items: Product[] }>('/products/offers', { params: { limit: 8 } })).data.items,
  });

  const staticCategories = [
    {
      name: 'Lip Gloss',
      slug: 'lip-gloss',
      image: '/lipglows.jpeg',
    },
    {
      name: 'Brows',
      slug: 'brows',
      image: '/eyebrow.jpeg',
    },
    {
      name: 'Liquid Blush',
      slug: 'liquid-blush',
      image:
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative -mt-16 overflow-hidden">
        {/* Mobile: image as background with buttons only */}
        <div className="relative lg:hidden">
          <img src={HERO_MOBILE_IMG} alt="Jasmine Cosmetics" className="h-[78vh] min-h-[520px] w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-3 px-5 pb-10">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full border border-pink-accent bg-pink-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-pink-accent"
            >
              Shop Now
            </Link>
            <a
              href="#categories"
              className="inline-flex items-center justify-center rounded-full border border-pink-accent bg-white px-6 py-3 text-sm font-medium text-pink-accent transition-colors hover:bg-pink-accent hover:text-white"
            >
              Explore Collection
            </a>
          </div>
        </div>

        {/* Desktop: one bordered card wrapping text (left) + image (right) */}
        <div className="hidden lg:block">
          <div className="mx-auto max-w-7xl px-8 pb-16 pt-28">
            <div className="grid min-h-[600px] grid-cols-2 items-center gap-12 rounded-3xl border border-pink-light bg-white p-12 shadow-card">
              <div>
                <p className="mb-4 inline-block rounded-full bg-pink-soft px-3 py-1 text-xs font-medium text-pink-deep">
                  New shades just dropped
                </p>
                <h1 className="font-serif text-6xl font-semibold leading-tight text-pink-accent">
                  Jasmine Cosmetics
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/85">
                  Soft, chic beauty for every shade of you. Non-sticky lip glosses, easy brow products,
                  lightweight liquid blush, and nourishing lip care.
                </p>
                <div className="mt-9 flex items-center gap-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center rounded-full border border-pink-accent bg-pink-accent px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-pink-accent"
                  >
                    Shop Now
                  </Link>
                  <a
                    href="#categories"
                    className="inline-flex items-center justify-center rounded-full border border-pink-accent bg-white px-8 py-3.5 text-sm font-medium text-pink-accent transition-colors hover:bg-pink-accent hover:text-white"
                  >
                    Explore Collection
                  </a>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl">
                <img src={HERO_IMG} alt="Jasmine Cosmetics hero" className="h-[480px] w-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-x py-20">
        <h2 className="section-title mb-10 text-center">Featured Products</h2>
        {loadingFeatured ? <Spinner /> : <FeaturedCarousel products={featured ?? []} />}
      </section>

      {/* Categories */}
      <section id="categories" className="py-20">
        <div className="container-x">
          <h2 className="section-title mb-10 text-center">Shop by Category</h2>
          <div className="mx-auto grid max-w-xl grid-cols-1 gap-6">
            {staticCategories.map((c) => (
              <Link key={c.slug} to={`/category/${c.slug}`} className="group text-center">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-pink-soft">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-serif text-lg text-ink">{c.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offers */}
      {offers && offers.length > 0 && (
        <section className="container-x py-20">
          <h2 className="section-title mb-10 text-center">Offers</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {offers.map((p) => (
              <div key={p._id} className="mx-auto w-full max-w-[230px] lg:max-w-[260px]">
                <ProductCard product={p} showActions onQuickOrder={setQuickProduct} />
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/offers" className="btn-outline px-8">
              More Offers
            </Link>
          </div>
        </section>
      )}

      {/* Newsletter / brand story */}
      <section className="border-y border-black/10 py-20">
        <div className="container-x max-w-3xl text-center">
          <h2 className="font-serif text-4xl font-semibold text-ink">About Jasmine</h2>
          <p className="mt-6 text-lg leading-relaxed text-ink/70">
            Jasmine Cosmetics is a modern beauty brand created to celebrate every shade, every mood,
            and every version of you.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            We design products that enhance your natural beauty with a soft, chic touch.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            From glossy lips to perfectly defined brows and radiant liquid blush, our collections are
            made for both everyday simplicity and special moments.
          </p>
          <h3 className="mt-8 font-serif text-2xl font-semibold text-ink">What We Do</h3>
          <ul className="mt-4 space-y-3 text-left text-base leading-relaxed text-ink/70">
            <li>• Smooth, non-sticky lip glosses in flattering shades</li>
            <li>• Easy-to-use brow products for natural definition</li>
            <li>• Lightweight liquid blush for a fresh, blendable glow</li>
            <li>• Nourishing lip care for soft, healthy lips</li>
          </ul>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Every product is carefully crafted to give you confidence and comfort.
          </p>
        </div>
      </section>

      {/* Instagram */}
      <section className="container-x py-20">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <InstagramIcon className="h-8 w-8 text-pink-accent" />
          <h2 className="section-title">Follow @jasmine___eg</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-6">
          {INSTA_IMAGES.map((src, i) => (
            <a
              key={i}
              href="https://www.instagram.com/jasmine___eg/#"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={src}
                alt="Instagram post"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 grid place-items-center bg-pink-accent/0 opacity-0 transition group-hover:bg-pink-accent/90 group-hover:opacity-100">
                <InstagramIcon className="h-7 w-7 text-white" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <QuickOrderPanel product={quickProduct} onClose={() => setQuickProduct(null)} />
    </div>
  );
}
