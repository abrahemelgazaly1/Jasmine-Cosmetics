import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';
import { formatPrice } from '../lib/constants';
import Spinner from '../components/Spinner';
import { useDocumentTitle } from '../lib/seo';

export default function Account() {
  useDocumentTitle('My Account');
  const { user, logout } = useAuth();
  const location = useLocation() as { state?: { justOrdered?: boolean } };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get<{ items: Order[] }>('/orders/mine')).data.items,
    enabled: Boolean(user),
  });

  return (
    <div className="container-x py-12">
      {location.state?.justOrdered && (
        <div className="mb-8 rounded-2xl border border-pink-accent bg-pink-light p-5 text-center">
          <p className="font-serif text-xl text-pink-deep">Thank you for your order!</p>
          <p className="text-sm text-ink/70">
            Your order has been placed. You will pay on delivery (COD).
          </p>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">My Account</h1>
          {user && <p className="text-sm text-ink/60">{user.name} &middot; {user.email}</p>}
        </div>
        <button onClick={logout} className="btn-outline py-2">Logout</button>
      </div>

      <h2 className="mb-4 font-serif text-2xl text-ink">Order History</h2>
      {!user ? (
        <p className="text-ink/50">Please log in to view your orders.</p>
      ) : isLoading ? (
        <Spinner />
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="rounded-2xl border border-pink-light p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-ink/50">Order #{o._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-ink/40">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-pink-light px-3 py-1 text-xs font-medium capitalize text-pink-deep">
                  {o.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-ink/70">
                {o.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {it.name}
                      {it.color ? ` (${it.color})` : ''} x{it.qty}
                    </span>
                    <span>{formatPrice(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-pink-light pt-3 text-sm font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ink/50">You have no orders yet.</p>
      )}
    </div>
  );
}
