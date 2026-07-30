import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { PromoCode } from '../../types';
import { TrashIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';
import { swal, toast } from '../../lib/swal';

interface AxiosishError {
  response?: { data?: { message?: string } };
}

function messageFrom(err: unknown, fallback: string): string {
  return (err as AxiosishError)?.response?.data?.message ?? fallback;
}

export default function AdminPromoCodes() {
  const qc = useQueryClient();
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [maxUse, setMaxUse] = useState('');
  const [validDays, setValidDays] = useState('');

  const { data: promos, isLoading } = useQuery({
    queryKey: ['promocodes'],
    queryFn: async () => (await api.get<{ items: PromoCode[] }>('/promocodes')).data.items,
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post('/promocodes', {
        code: code.trim(),
        discountPercent: Number(discountPercent),
        maxUse: Number(maxUse),
        validDays: Number(validDays),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promocodes'] });
      setCode('');
      setDiscountPercent('');
      setMaxUse('');
      setValidDays('');
      toast('Promo code generated');
    },
    onError: (err) => {
      swal.fire({ icon: 'error', title: 'Could not generate', text: messageFrom(err, 'Please try again.') });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/promocodes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promocodes'] }),
  });

  async function confirmDelete(id: string, name: string) {
    const res = await swal.fire({
      icon: 'warning',
      title: 'Delete promo code?',
      text: `"${name}" will be permanently removed.`,
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });
    if (res.isConfirmed) deleteMutation.mutate(id);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl text-ink">Promo Codes</h2>

      <form
        onSubmit={submit}
        className="mb-8 grid gap-4 rounded-2xl border border-pink-light p-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <label className="mb-1 block text-sm text-ink/70">Promo Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. WELCOME10"
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink/70">Discount (%)</label>
          <input
            required
            type="number"
            min={1}
            max={100}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            placeholder="e.g. 4"
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink/70">Max Uses</label>
          <input
            required
            type="number"
            min={1}
            value={maxUse}
            onChange={(e) => setMaxUse(e.target.value)}
            placeholder="e.g. 10"
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink/70">Valid For (days)</label>
          <input
            required
            type="number"
            min={1}
            value={validDays}
            onChange={(e) => setValidDays(e.target.value)}
            placeholder="e.g. 3"
            className="input w-full"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary py-2.5 disabled:opacity-60"
          >
            {createMutation.isPending ? 'Generating...' : 'Generate Promo Code'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <Spinner />
      ) : promos && promos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((p) => {
            const expired = new Date(p.expiresAt).getTime() < Date.now();
            const usedUp = p.usedCount >= p.maxUse;
            const active = !expired && !usedUp;
            return (
              <div key={p._id} className="rounded-2xl border border-pink-light p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-lg font-semibold tracking-wide text-pink-deep">
                      {p.code}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {expired ? 'Expired' : usedUp ? 'Used up' : 'Active'}
                    </span>
                  </div>
                  <button
                    onClick={() => confirmDelete(p._id, p.code)}
                    className="text-ink/40 hover:text-red-500"
                    aria-label="Delete promo code"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <dl className="mt-4 space-y-2 text-sm text-ink/70">
                  <div className="flex justify-between">
                    <dt>Discount</dt>
                    <dd className="font-medium text-ink">{p.discountPercent}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Used</dt>
                    <dd className="font-medium text-ink">
                      {p.usedCount} / {p.maxUse}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Created</dt>
                    <dd className="font-medium text-ink">{formatDate(p.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Expires</dt>
                    <dd className="font-medium text-ink">{formatDate(p.expiresAt)}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-ink/50">No promo codes yet. Generate your first one above.</p>
      )}
    </div>
  );
}
