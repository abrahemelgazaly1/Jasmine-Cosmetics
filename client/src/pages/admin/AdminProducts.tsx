import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Category, Product } from '../../types';
import { fileToBase64 } from '../../lib/image';
import { formatPrice } from '../../lib/constants';
import { TrashIcon, CloseIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';

interface ProductForm {
  name: string;
  price: number;
  description: string;
  howToUse: string;
  category: string;
  images: string[];
  isFeatured: boolean;
  isOffer: boolean;
  stock: number;
}

const emptyForm: ProductForm = {
  name: '',
  price: 0,
  description: '',
  howToUse: '',
  category: '',
  images: [],
  isFeatured: false,
  isOffer: false,
  stock: 100,
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () =>
      (await api.get<{ items: Product[] }>('/products', { params: { limit: 60 } })).data.items,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<{ items: Category[] }>('/categories')).data.items,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['featured'] });
      qc.invalidateQueries({ queryKey: ['offers'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function editProduct(p: Product) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description,
      howToUse: p.howToUse,
      category: typeof p.category === 'object' ? p.category._id : p.category,
      images: p.images,
      isFeatured: p.isFeatured,
      isOffer: p.isOffer,
      stock: p.stock,
    });
    setShowForm(true);
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const base64s = await Promise.all(Array.from(files).map((f) => fileToBase64(f)));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...base64s].slice(0, 5) }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-ink">Products</h2>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="btn-primary py-2"
        >
          {showForm ? 'Close' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="mb-8 space-y-4 rounded-2xl border border-pink-light p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
            <input
              required
              type="number"
              placeholder="Price (EGP)"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="input"
            />
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              <option value="">Select Category</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="input"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input min-h-20"
          />
          <textarea
            placeholder="How to Use"
            value={form.howToUse}
            onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
            className="input min-h-20"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-ink/70">
              Images (first = main, second = hover)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="text-sm"
            />
            {form.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative h-20 w-20">
                    <img src={img} alt="" className="h-full w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })
                      }
                      className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-pink-deep text-white"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="h-4 w-4 accent-pink-accent"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={form.isOffer}
                onChange={(e) => setForm({ ...form, isOffer: e.target.checked })}
                className="h-4 w-4 accent-pink-accent"
              />
              Offer
            </label>
          </div>

          <button type="submit" disabled={saveMutation.isPending} className="btn-primary disabled:opacity-60">
            {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-pink-light">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-light text-ink/80">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p._id} className="border-t border-pink-light">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-xs">
                    {p.isFeatured && <span className="mr-1 rounded bg-pink-light px-2 py-0.5 text-pink-deep">Featured</span>}
                    {p.isOffer && <span className="rounded bg-pink-light px-2 py-0.5 text-pink-deep">Offer</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editProduct(p)} className="text-pink-deep hover:underline">
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(p._id)}
                        className="text-ink/40 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
