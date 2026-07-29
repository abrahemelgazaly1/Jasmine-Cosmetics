import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Category, Product } from '../../types';
import { formatPrice } from '../../lib/constants';
import { swal, toast } from '../../lib/swal';
import Spinner from '../../components/Spinner';

interface Props {
  onEdit: (product: Product) => void;
}

export default function AdminManageProducts({ onEdit }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () =>
      (await api.get<{ items: Product[] }>('/products', { params: { limit: 60 } })).data.items,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<{ items: Category[] }>('/categories')).data.items,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-products'] });
    qc.invalidateQueries({ queryKey: ['featured'] });
    qc.invalidateQueries({ queryKey: ['offers'] });
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) =>
      api.put(`/products/${id}`, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: invalidate,
  });

  const filtered = useMemo(() => {
    return (products ?? []).filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const catId = typeof p.category === 'object' ? p.category._id : p.category;
      const matchCat = !categoryFilter || catId === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  async function handleDelete(p: Product) {
    const res = await swal.fire({
      title: 'Delete this product?',
      text: p.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });
    if (res.isConfirmed) {
      await deleteMutation.mutateAsync(p._id);
      toast('Product deleted');
    }
  }

  function handleSoldOut(p: Product) {
    updateMutation.mutate(
      { id: p._id, data: { isSoldOut: !p.isSoldOut } },
      { onSuccess: () => toast(p.isSoldOut ? 'Product is now available' : 'Product marked as sold out') }
    );
  }

  function handleBestSeller(p: Product) {
    updateMutation.mutate(
      { id: p._id, data: { isFeatured: !p.isFeatured } },
      {
        onSuccess: () =>
          toast(p.isFeatured ? 'Removed from Best Sellers' : 'Added to Best Sellers'),
      }
    );
  }

  async function handleOffer(p: Product) {
    if (p.isOffer) {
      await updateMutation.mutateAsync({ id: p._id, data: { isOffer: false, offerPrice: null } });
      toast('Offer removed');
      return;
    }
    const res = await swal.fire({
      title: 'Set offer price',
      input: 'number',
      inputLabel: `Original price: ${formatPrice(p.price)}`,
      inputPlaceholder: 'New price (EGP)',
      showCancelButton: true,
      confirmButtonText: 'Apply Offer',
      inputValidator: (v) => {
        const n = Number(v);
        if (!v || n <= 0) return 'Enter a valid price';
        if (n >= p.price) return 'Offer price must be lower than the original price';
        return null;
      },
    });
    if (res.isConfirmed) {
      await updateMutation.mutateAsync({
        id: p._id,
        data: { isOffer: true, offerPrice: Number(res.value) },
      });
      toast('Offer applied');
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl text-ink">Manage Products</h2>

      {/* Search + filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input sm:flex-1"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input sm:w-56"
        >
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink/50">No products found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="flex flex-col gap-4 rounded-2xl border border-pink-light p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-ink">{p.name}</h3>
                    {p.isOffer && (
                      <span className="rounded bg-pink-accent px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Offer
                      </span>
                    )}
                    {p.isSoldOut && (
                      <span className="rounded bg-ink px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Sold out
                      </span>
                    )}
                    {p.isFeatured && (
                      <span className="rounded bg-pink-deep px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Best Seller
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-pink-deep">
                    {p.isOffer && p.offerPrice != null ? (
                      <>
                        <span className="mr-2 text-ink/40 line-through">{formatPrice(p.price)}</span>
                        {formatPrice(p.offerPrice)}
                      </>
                    ) : (
                      formatPrice(p.price)
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:flex-wrap">
                <button
                  onClick={() => handleDelete(p)}
                  className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => onEdit(p)}
                  className="rounded-full border border-pink-soft px-4 py-2 text-sm font-medium text-pink-deep transition hover:bg-pink-light"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleSoldOut(p)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    p.isSoldOut
                      ? 'bg-ink text-white hover:bg-black'
                      : 'border border-ink/30 text-ink hover:bg-ink/5'
                  }`}
                >
                  {p.isSoldOut ? 'Available' : 'Sold out'}
                </button>
                <button
                  onClick={() => handleOffer(p)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    p.isOffer
                      ? 'bg-pink-accent text-white hover:bg-pink-deep'
                      : 'border border-pink-accent text-pink-deep hover:bg-pink-light'
                  }`}
                >
                  {p.isOffer ? 'Remove Offer' : 'Offers'}
                </button>
                <button
                  onClick={() => handleBestSeller(p)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    p.isFeatured
                      ? 'bg-pink-deep text-white hover:bg-pink-accent'
                      : 'border border-pink-deep text-pink-deep hover:bg-pink-light'
                  }`}
                >
                  {p.isFeatured ? 'Remove Best Seller' : 'Best Seller'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
