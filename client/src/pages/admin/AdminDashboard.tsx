import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';
import AdminAddProduct from './AdminAddProduct';
import AdminManageProducts from './AdminManageProducts';
import AdminOrders from './AdminOrders';

type Tab = 'add' | 'manage' | 'orders';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('add');
  const [editing, setEditing] = useState<Product | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'add', label: 'Add Product' },
    { key: 'manage', label: 'Manage Products' },
    { key: 'orders', label: 'Orders' },
  ];

  function startEdit(p: Product) {
    setEditing(p);
    setTab('add');
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
          <button onClick={logout} className="btn-outline py-2 text-sm">
            Logout
          </button>
        </div>
        {/* Tabs */}
        <div className="container-x flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
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
      </main>
    </div>
  );
}
