import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Category, Product } from '../../types';
import { fileToBase64 } from '../../lib/image';
import { PRODUCT_COLORS } from '../../lib/constants';
import { swal, toast } from '../../lib/swal';
import { CloseIcon } from '../../components/icons';

interface Props {
  editing: Product | null;
  onDone: () => void;
}

interface ProductForm {
  name: string;
  price: number;
  description: string;
  howToUse: string;
  category: string;
  colors: string[];
  images: string[];
}

const emptyForm: ProductForm = {
  name: '',
  price: 0,
  description: '',
  howToUse: '',
  category: '',
  colors: [],
  images: [],
};

export default function AdminAddProduct({ editing, onDone }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<{ items: Category[] }>('/categories')).data.items,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        price: editing.price,
        description: editing.description,
        howToUse: editing.howToUse,
        category: typeof editing.category === 'object' ? editing.category._id : editing.category,
        colors: editing.colors ?? [],
        images: editing.images ?? [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing]);

  // Palette available for the currently selected category.
  const palette = useMemo(() => {
    const cat = categories?.find((c) => c._id === form.category);
    return cat ? PRODUCT_COLORS[cat.slug] ?? [] : [];
  }, [categories, form.category]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form };
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['featured'] });
      qc.invalidateQueries({ queryKey: ['offers'] });
      toast(editing ? 'Product updated successfully' : 'Product added successfully');
      setForm(emptyForm);
      onDone();
    },
    onError: () => {
      swal.fire({ title: 'Something went wrong', icon: 'error' });
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      const base64s = await Promise.all(Array.from(files).map((f) => fileToBase64(f)));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...base64s].slice(0, 15) }));
      toast('Images uploaded successfully');
    } catch {
      swal.fire({ title: 'Could not read the images', icon: 'error' });
    }
  }

  function toggleColor(name: string) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(name)
        ? prev.colors.filter((c) => c !== name)
        : [...prev.colors, name],
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return swal.fire({ title: 'Product name is required', icon: 'info' });
    if (form.price <= 0) return swal.fire({ title: 'Enter a valid price', icon: 'info' });
    if (!form.category) return swal.fire({ title: 'Please choose a category', icon: 'info' });
    if (form.images.length === 0) return swal.fire({ title: 'Please upload at least one image', icon: 'info' });
    saveMutation.mutate();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 font-serif text-2xl text-ink">
        {editing ? 'Edit Product' : 'Add to Product'}
      </h2>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-pink-light p-6">
        {/* 1. Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">Product Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Product name"
            className="input"
          />
        </div>

        {/* 2. Price */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">Price (EGP)</label>
          <input
            type="number"
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            placeholder="Price"
            className="input"
          />
        </div>

        {/* 3. Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="input min-h-24"
          />
        </div>

        {/* 4. Category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value, colors: [] })}
            className="input"
          >
            <option value="">Select Category</option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* How to use (shown only after a category is chosen) */}
        {form.category && (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">How to use?</label>
            <textarea
              value={form.howToUse}
              onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
              placeholder="Usage instructions shown on the product details page"
              className="input min-h-24"
            />
          </div>
        )}

        {/* Colors (only for Lip Gloss / Liquid Blush) */}
        {palette.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-ink/70">Colours</label>
            <div className="flex flex-wrap gap-2">
              {palette.map((c) => {
                const selected = form.colors.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => toggleColor(c.name)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      selected
                        ? 'border-pink-accent bg-pink-light text-pink-deep'
                        : 'border-pink-soft text-ink/70 hover:border-pink-accent'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full ring-1 ring-black/10"
                      style={{ background: c.hex }}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink/70">
            Product Images (up to 15)
          </label>
          <label className="btn-outline cursor-pointer py-2">
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </label>
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

        <button type="submit" disabled={saveMutation.isPending} className="btn-primary w-full disabled:opacity-60">
          {saveMutation.isPending
            ? 'Saving...'
            : editing
              ? 'Save Edits'
              : 'Add to Product'}
        </button>
      </form>
    </div>
  );
}
