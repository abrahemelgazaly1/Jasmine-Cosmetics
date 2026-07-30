import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import type { Order, Product } from '../../types';
import { BellIcon } from '../../components/icons';
import AdminAddProduct from './AdminAddProduct';
import AdminManageProducts from './AdminManageProducts';
import AdminOrders from './AdminOrders';
import AdminPromoCodes from './AdminPromoCodes';

type Tab = 'add' | 'manage' | 'orders' | 'promocodes';

// Remembers, across reloads, how many orders the admin has already seen.
const ORDERS_SEEN_KEY = 'jc_admin_orders_seen_count';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('add');
  const [editing, setEditing] = useState<Product | null>(null);
  const [seenCount, setSeenCount] = useState(() => Number(localStorage.getItem(ORDERS_SEEN_KEY) ?? 0));

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get<{ items: Order[] }>('/orders')).data.items,
    refetchInterval: 15000,
  });
  const unseenOrders = Math.max(0, (orders?.length ?? 0) - seenCount);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'add', label: 'Add Product' },
    { key: 'manage', label: 'Manage Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'promocodes', label: 'Promo Codes' },
  ];

  function startEdit(p: Product) {
    setEditing(p);
    setTab('add');
  }

  // Opens the Orders tab and marks all current orders as seen, clearing the notification badge.
  function openOrders() {
    setEditing(null);
    setTab('orders');
    const total = orders?.length ?? 0;
    setSeenCount(total);
    localStorage.setItem(ORDERS_SEEN_KEY, String(total));
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin navbar */}
      <header className="border-b border-pink-light bg-white">
        <div className="container-x flex h-16 items-center justify-between">
          <div>
            <h1 className="font-serif text-xl text-pink-deep">Jasmine Admin</h1>
            <p className="text-xs text-ink/50">Welcome, {user?.name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={logout} className="btn-outline py-2 text-sm">
              Logout
            </button>
            <button
              onClick={openOrders}
              className="relative text-ink/70 hover:text-pink-deep"
              aria-label="Order notifications"
            >
              <BellIcon className="h-6 w-6" />
              {unseenOrders > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-pink-accent px-1 text-[10px] font-bold text-white">
                  {unseenOrders}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="container-x flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                if (t.key === 'orders') {
                  openOrders();
                  return;
                }
                if (t.key !== 'add') setEditing(null);
                setTab(t.key);
              }}
              className={`-mb-px whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition ${
                tab === t.key
                  ? 'border-pink-accent text-pink-deep'
                  : 'border-transparent text-ink/50 hover:text-pink-deep'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="container-x py-8">
        {tab === 'add' && (
          <AdminAddProduct
            editing={editing}
            onDone={() => {
              setEditing(null);
              setTab('manage');
            }}
          />
        )}
        {tab === 'manage' && <AdminManageProducts onEdit={startEdit} />}
        {tab === 'orders' && <AdminOrders />}
        {tab === 'promocodes' && <AdminPromoCodes />}
      </main>
    </div>
  );
}
