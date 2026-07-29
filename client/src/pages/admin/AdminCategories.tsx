import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Category } from '../../types';
import { fileToBase64 } from '../../lib/image';
import { TrashIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';

export default function AdminCategories() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<{ items: Category[] }>('/categories')).data.items,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) await api.put(`/categories/${editingId}`, { name, image });
      else await api.post('/categories', { name, image });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setImage('');
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl text-ink">Categories</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border border-pink-light p-6"
      >
        <div className="flex-1">
          <label className="mb-1 block text-sm text-ink/70">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink/70">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) setImage(await fileToBase64(file));
            }}
            className="text-sm"
          />
        </div>
        {image && <img src={image} alt="" className="h-14 w-14 rounded-lg object-cover" />}
        <button type="submit" disabled={saveMutation.isPending} className="btn-primary py-2.5 disabled:opacity-60">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories?.map((c) => (
            <div key={c._id} className="rounded-2xl border border-pink-light p-3 text-center">
              <img src={c.image} alt={c.name} className="aspect-square w-full rounded-xl object-cover" />
              <p className="mt-2 font-medium text-ink">{c.name}</p>
              <div className="mt-2 flex justify-center gap-3 text-sm">
                <button
                  onClick={() => {
                    setEditingId(c._id);
                    setName(c.name);
                    setImage(c.image);
                  }}
                  className="text-pink-deep hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(c._id)}
                  className="text-ink/40 hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
