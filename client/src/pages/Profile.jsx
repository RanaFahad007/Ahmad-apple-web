import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { get, post, put, del, formatPKR, usePageTitle } from '../lib/api.js';
import { useAuthStore } from '../store/useStore.js';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({ label: 'Home', fullName: '', phone: '', city: '', address: '' });
  usePageTitle('My Account');

  useEffect(() => {
    if (!user) return;
    get('/auth/me').then((r) => { setProfile(r.data); setName(r.data.name); setPhone(r.data.phone || ''); }).catch(() => {});
    get('/orders/my').then((r) => setOrders(r.data || [])).catch(() => {});
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const saveProfile = async (e) => {
    e.preventDefault();
    try { const r = await put('/auth/profile', { name, phone }); setProfile(r.data); toast.success('Profile updated'); } catch (err) { toast.error(err.message); }
  };
  const saveAddress = async (e) => {
    e.preventDefault();
    try { const r = await post('/auth/addresses', address); setProfile((p) => ({ ...p, addresses: r.data })); toast.success('Address saved'); } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-8 py-6">
      <h1 className="text-3xl font-extrabold">My Account</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-3 p-5">
          <h2 className="font-bold">Edit profile</h2>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          <p className="text-sm text-[var(--muted)]">Email: {profile?.email}</p>
          <button className="btn">Save Profile</button>
        </form>
        <form onSubmit={saveAddress} className="card space-y-3 p-5">
          <h2 className="font-bold">Add saved address</h2>
          <input className="field" placeholder="Label (Home / Office)" value={address.label} onChange={(e) => setAddress({ ...address, label: e.target.value })} />
          <input className="field" placeholder="Full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} required />
          <input className="field" placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} required />
          <input className="field" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
          <textarea className="field" rows={2} placeholder="Address" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} required />
          <button className="btn">Save Address</button>
          <div className="space-y-2 pt-2">
            {(profile?.addresses || []).map((a) => (
              <div key={a._id} className="flex justify-between rounded-xl bg-[var(--card)] p-3 text-sm ">
                <span><b>{a.label}</b> — {a.fullName}, {a.city}, {a.address}</span>
                <button type="button" className="text-red-600" onClick={async () => { await del(`/auth/addresses/${a._id}`); setProfile((p) => ({ ...p, addresses: p.addresses.filter((x) => x._id !== a._id) })); }}>Remove</button>
              </div>
            ))}
          </div>
        </form>
      </div>

      <section>
        <h2 className="text-2xl font-bold">Order history &amp; tracking</h2>
        {orders.length === 0 && <p className="mt-2 text-sm text-[var(--muted)]">No orders yet. <Link to="/shop" className="text-accent">Shop now</Link></p>}
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="card p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold">{o.orderNumber}</p>
                <p className="text-sm text-[var(--muted)]">{new Date(o.createdAt).toLocaleDateString()} • {formatPKR(o.total)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {STATUSES.map((s) => (
                  <span key={s} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${o.status === s ? 'bg-accent text-white' : STATUSES.indexOf(s) < STATUSES.indexOf(o.status) ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-[var(--muted)]'}`}>{s}</span>
                ))}
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">Status: <b>{o.status}</b>{o.trackingNumber ? ` • Tracking: ${o.trackingNumber}` : ''} • Payment: {o.paymentMethod} ({o.paymentStatus})</p>
              <ul className="mt-2 list-disc pl-5 text-sm">{o.items.map((i, idx) => <li key={idx}>{i.name} × {i.quantity}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
