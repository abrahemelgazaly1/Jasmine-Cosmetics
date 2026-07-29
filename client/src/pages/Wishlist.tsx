import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import QuickOrderPanel from '../components/QuickOrderPanel';
import { useWishlist } from '../context/WishlistContext';
import { useDocumentTitle } from '../lib/seo';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const { items } = useWishlist();
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);

  return (
    <div className="container-x py-12">
      <h1 className="section-title mb-8 text-center">Wishlist</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink/50">Your wishlist is empty.</p>
          <Link to="/products" className="btn-primary mt-6">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} showActions onQuickOrder={setQuickProduct} />
          ))}
        </div>
      )}
      <QuickOrderPanel product={quickProduct} onClose={() => setQuickProduct(null)} />
    </div>
  );
}
