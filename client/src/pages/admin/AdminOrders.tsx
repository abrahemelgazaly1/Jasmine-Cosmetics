import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Order } from '../../types';
import { formatPrice } from '../../lib/constants';
import { swal, toast } from '../../lib/swal';
import Spinner from '../../components/Spinner';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const qc = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get<{ items: Order[] }>('/orders')).data.items,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast('Order status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/orders/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  async function handleDelete(id: string) {
    const res = await swal.fire({
      title: 'Delete this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });
    if (res.isConfirmed) {
      await deleteMutation.mutateAsync(id);
      toast('Order deleted');
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl text-ink">Orders</h2>
      {orders && orders.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {orders.map((o) => (
            <div key={o._id} className="rounded-2xl border border-pink-light p-5">
              {/* Date & time */}
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">#{o._id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleString()}</p>
              </div>

              {/* Items */}
              <div className="mt-4 space-y-3">
                {o.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{it.name}</p>
                      <p className="text-xs text-ink/60">
                        {formatPrice(it.price)} &middot; Qty {it.qty}
                        {it.color ? ` \u00b7 ${it.color}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-pink-deep">
                      {formatPrice(it.price * it.qty)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Personal information */}
              <div className="mt-4 rounded-xl bg-pink-light/60 p-4 text-sm">
                <p className="mb-1 font-medium text-ink">Personal Information</p>
                <p className="text-ink/70">Name: {o.customer.fullName}</p>
                <p className="text-ink/70">Governorate: {o.customer.governorate}</p>
                <p className="text-ink/70">Address: {o.customer.address}</p>
                <p className="text-ink/70">Email: {o.customer.email}</p>
                <p className="text-ink/70">Phone 1: {o.customer.phone1}</p>
                {o.customer.phone2 ? <p className="text-ink/70">Phone 2: {o.customer.phone2}</p> : null}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-1 border-t border-pink-light pt-3 text-sm">
                <div className="flex justify-between text-ink/70">
                  <span>Products</span>
                  <span>{formatPrice(o.subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink/70">
                  <span>Shipping / Delivery</span>
                  <span>{formatPrice(o.shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatPrice(o.total)}</span>
                </div>
              </div>

              {/* Status + delete */}
              <div className="mt-4 space-y-2">
                <select
                  value={o.status}
                  onChange={(e) => statusMutation.mutate({ id: o._id, status: e.target.value })}
                  className="input capitalize"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(o._id)}
                  className="w-full rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ink/50">No orders yet.</p>
      )}
    </div>
  );
}
