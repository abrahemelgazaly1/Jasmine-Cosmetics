import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import QuickOrderPanel from '../components/QuickOrderPanel';
import Spinner from '../components/Spinner';
import { useDocumentTitle } from '../lib/seo';

export default function Offers() {
  useDocumentTitle('Offers & Deals');
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['offers', 'all'],
    queryFn: async () =>
      (await api.get<{ items: Product[] }>('/products/offers', { params: { limit: 60 } })).data.items,
  });

  return (
    <div className="container-x py-12">
      <h1 className="section-title mb-8 text-center">Offers</h1>
      {isLoading ? (
        <Spinner />
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {data.map((p) => (
            <ProductCard key={p._id} product={p} showActions onQuickOrder={setQuickProduct} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-ink/50">No offers available right now.</p>
      )}
      <QuickOrderPanel product={quickProduct} onClose={() => setQuickProduct(null)} />
    </div>
  );
}
