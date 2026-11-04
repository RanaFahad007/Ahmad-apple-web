import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, formatPKR } from '../lib/api.js';

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const load = () => { setError(''); get('/admin/dashboard').then((r) => setD(r.data)).catch((e) => setError(e.message)); };
  useEffect(load, []);
  if (error) return <div className="space-y-3 p-4"><p className="text-red-500">Dashboard failed to load: {error}</p><button className="btn" onClick={load}>Retry</button></div>;
  if (!d) return <p>Loading dashboard…</p>;
  const cards = [
    ['Total Sales', formatPKR(d.totalSales)],
    ['Orders Today', d.ordersToday],
    ['Pending Orders', d.pendingOrders],
    ['Total Products', d.totalProducts],
    ['Total Customers', d.totalCustomers],
  ];
  const maxRev = Math.max(1, ...(d.revenueByDay || []).map((x) => x.revenue));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-4"><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-1 text-xl font-extrabold">{value}</p></div>
        ))}
      </div>
      <div className="card p-5">
        <h2 className="font-bold">Revenue — last 14 days</h2>
        <div className="mt-4 flex h-40 items-end gap-1">
          {(d.revenueByDay || []).map((x) => (
            <div key={x._id} className="flex-1" title={`${x._id}: ${formatPKR(x.revenue)}`}>
              <div className="rounded-t bg-accent" style={{ height: `${Math.max(4, (x.revenue / maxRev) * 140)}px` }} />
              <p className="mt-1 truncate text-[10px] text-[var(--muted)]">{x._id.slice(5)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-bold">Low stock alerts</h2>
          {(d.lowStock || []).length === 0 && <p className="mt-2 text-sm text-[var(--muted)]">No low-stock products.</p>}
          <ul className="mt-2 space-y-1 text-sm">{(d.lowStock || []).map((p) => <li key={p._id}>{p.name} — <b>{p.stock} left</b></li>)}</ul>
        </div>
        <div className="card p-5">
          <h2 className="font-bold">Top-selling products</h2>
          <ul className="mt-2 space-y-1 text-sm">{(d.topProducts || []).map((p) => <li key={p._id}>{p.name} — <b>{p.soldCount} sold</b></li>)}</ul>
        </div>
      </div>
      <div className="card p-5">
        <h2 className="font-bold">Recent orders</h2>
        <div className="mt-3 space-y-2">
          {(d.recentOrders || []).map((o) => (
            <Link key={o._id} to="/admin-ahmad/orders" className="flex justify-between rounded-xl bg-[var(--card)] px-3 py-2 text-sm ">
              <span>{o.orderNumber} — {o.customerName}</span><span>{o.status} • {formatPKR(o.total)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
