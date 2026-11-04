import React, { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { get, post } from '../lib/api.js';
import { useAuthStore } from '../store/useStore.js';

// The admin section is intentionally NOT linked from the public site.
// Access is by URL only, and every admin API route is also protected server-side.
export function AdminGuard({ children }) {
  const user = useAuthStore((s) => s.user);
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    get('/auth/me')
      .then((r) => setOk(r.data?.role === 'admin'))
      .catch(() => setOk(false))
      .finally(() => setChecked(true));
  }, []);
  if (!checked) return <p className="p-10 text-center">Checking admin access…</p>;
  if (!ok) {
    // Non-admins and logged-out users do not get an admin page: home (or login for guests).
    return <Navigate to={user ? '/' : '/admin-ahmad/login'} replace />;
  }
  return children;
}

const LINKS = [
  ['/admin-ahmad', 'Dashboard'],
  ['/admin-ahmad/products', 'Products'],
  ['/admin-ahmad/categories', 'Categories & Brands'],
  ['/admin-ahmad/orders', 'Orders'],
  ['/admin-ahmad/customers', 'Customers'],
  ['/admin-ahmad/reviews', 'Reviews'],
  ['/admin-ahmad/coupons', 'Coupons'],
  ['/admin-ahmad/banners', 'Banners'],
  ['/admin-ahmad/messages', 'Messages'],
  ['/admin-ahmad/settings', 'Settings'],
];

export function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useLocation();
  const [redirectTo] = useState('/admin-ahmad');
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await post('/auth/admin-login', form);
      setAuth(res.data.user, res.data.token);
      window.location.href = redirectTo;
    } catch (err) { setError(err.message); }
  };
  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Admin Login</h1>
      <p className="mt-1 text-sm text-[#98989a]">Admin access only. This page is not linked from the public site.</p>
      <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <input className="field" type="email" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn w-full">Login as Admin</button>
      </form>
    </div>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <aside className={`shrink-0 border-r bg-[#1c1c1e] transition-all dark:bg-neutral-950 ${collapsed ? 'w-14' : 'w-56'} max-lg:fixed max-lg:z-50 max-lg:h-full ${collapsed ? 'max-lg:-translate-x-full' : ''}`}>
          <div className="flex items-center justify-between p-4">
            {!collapsed && <p className="font-extrabold">Admin</p>}
            <button className="rounded-full border px-2 py-1" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? '→' : '←'}</button>
          </div>
          <nav className="space-y-1 px-2 pb-4">
            {LINKS.map(([to, label]) => (
              <Link key={to} to={to} className={`block rounded-xl px-3 py-2 text-sm ${location.pathname === to ? 'bg-accent text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                {collapsed ? label[0] : label}
              </Link>
            ))}
            <button
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={async () => { try { await post('/auth/logout', {}); } catch {} logout(); window.location.href = '/'; }}
            >
              {collapsed ? '↪' : 'Logout'}
            </button>
          </nav>
        </aside>
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-3 p-4 lg:hidden">
            <button className="rounded-full border px-3 py-2" onClick={() => setCollapsed(!collapsed)}>☰ Menu</button>
            <p className="font-bold">Admin Panel</p>
          </div>
          <div className="p-4 sm:p-6"><Outlet /></div>
        </div>
      </div>
    </AdminGuard>
  );
}
