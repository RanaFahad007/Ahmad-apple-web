import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { get, post, put, del, formatPKR, imgFallback } from '../lib/api.js';

function ListPage({ title, endpoint, fields, renderItem }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const load = () => get(endpoint).then((r) => setItems(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try { await post(endpoint, form); setForm({}); load(); toast.success('Saved'); } catch (err) { toast.error(err.message); }
  };
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <form onSubmit={submit} className="card flex flex-wrap gap-2 p-4">
        {fields.map((f) => (
          <input key={f.key} className="field !w-auto flex-1" type={f.type || 'text'} placeholder={f.label} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required={f.required} />
        ))}
        <button className="btn">Add</button>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item._id} className="card flex flex-wrap items-center justify-between gap-2 p-4">
            <span className="text-sm">{renderItem(item)}</span>
            <button className="text-sm text-red-600" onClick={async () => { if (confirm('Delete?')) { await del(`${endpoint}/${item._id}`); load(); } }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CategoriesBrands = () => {
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cat, setCat] = useState({ name: '', slug: '', image: '' });
  const [brand, setBrand] = useState({ name: '', slug: '', image: '' });
  const load = () => { get('/admin/categories').then((r) => setCats(r.data || [])); get('/admin/brands').then((r) => setBrands(r.data || [])); };
  useEffect(load, []);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Categories &amp; Brands</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-3 p-5">
          <h2 className="font-bold">Add Category</h2>
          <input className="field" placeholder="Name" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} />
          <input className="field" placeholder="Slug (optional)" value={cat.slug} onChange={(e) => setCat({ ...cat, slug: e.target.value })} />
          <input className="field" placeholder="Image URL" value={cat.image} onChange={(e) => setCat({ ...cat, image: e.target.value })} />
          <button className="btn" onClick={async () => { await post('/admin/categories', cat); setCat({ name: '', slug: '', image: '' }); load(); toast.success('Category saved'); }}>Save Category</button>
          <div className="space-y-1">{cats.map((c) => <div key={c._id} className="flex justify-between text-sm"><span>{c.name} ({c.slug})</span><button className="text-red-600" onClick={async () => { await del(`/admin/categories/${c._id}`); load(); }}>Delete</button></div>)}</div>
        </div>
        <div className="card space-y-3 p-5">
          <h2 className="font-bold">Add Brand</h2>
          <input className="field" placeholder="Name" value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} />
          <input className="field" placeholder="Slug (optional)" value={brand.slug} onChange={(e) => setBrand({ ...brand, slug: e.target.value })} />
          <input className="field" placeholder="Image URL" value={brand.image} onChange={(e) => setBrand({ ...brand, image: e.target.value })} />
          <button className="btn" onClick={async () => { await post('/admin/brands', brand); setBrand({ name: '', slug: '', image: '' }); load(); toast.success('Brand saved'); }}>Save Brand</button>
          <div className="space-y-1">{brands.map((b) => <div key={b._id} className="flex justify-between text-sm"><span>{b.name} ({b.slug})</span><button className="text-red-600" onClick={async () => { await del(`/admin/brands/${b._id}`); load(); }}>Delete</button></div>)}</div>
        </div>
      </div>
    </div>
  );
};

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = () => { setLoading(true); setError(''); get('/admin/orders', status ? { status } : {}).then((r) => setOrders(r.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(load, [status]);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Orders</h1>
      <select className="field !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((s) => <option key={s}>{s}</option>)}
      </select>
      {loading && <p>Loading orders…</p>}
      {error && <p className="text-red-500">Failed to load orders: {error} <button className="btn-outline !py-1" onClick={load}>Retry</button></p>}
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="card p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-bold">{o.orderNumber} — {o.customerName}</p>
              <p className="text-sm">{formatPKR(o.total)} • {o.paymentMethod} ({o.paymentStatus})</p>
            </div>
            <p className="text-sm text-[var(--muted)]">{o.shippingAddress?.city} • {o.shippingAddress?.phone}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <select className="field !w-auto !py-2" value={o.status} onChange={async (e) => { await put(`/admin/orders/${o._id}`, { status: e.target.value }); load(); }}>
                {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((s) => <option key={s}>{s}</option>)}
              </select>
              <button className="btn-outline !py-2" onClick={() => setSelected(selected?._id === o._id ? null : o)}>Details</button>
              <button className="btn-outline !py-2" onClick={() => window.print()}>Print Invoice</button>
            </div>
            {selected?._id === o._id && (
              <div className="mt-3 border-t pt-3 text-sm">
                <ul className="list-disc pl-5">{o.items.map((i, idx) => <li key={idx}>{i.name} × {i.quantity} — {formatPKR(i.price)}</li>)}</ul>
                {o.paymentScreenshot && <p className="mt-2">Payment screenshot: <a href={o.paymentScreenshot} target="_blank" rel="noreferrer" className="text-accent">View image</a></p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <input className="field !w-auto flex-1" placeholder="Tracking number" defaultValue={o.trackingNumber} onBlur={async (e) => { if (e.target.value !== o.trackingNumber) { await put(`/admin/orders/${o._id}`, { trackingNumber: e.target.value }); load(); } }} />
                  <button className="btn-outline !py-2" onClick={async () => { await put(`/admin/orders/${o._id}`, { paymentStatus: 'Paid' }); load(); toast.success('Marked paid'); }}>Mark Paid</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [detail, setDetail] = useState(null);
  const load = () => get('/admin/customers').then((r) => setCustomers(r.data || [])).catch(() => {});
  useEffect(load, []);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Customers</h1>
      <div className="space-y-2">
        {customers.map((c) => (
          <div key={c._id} className="card flex flex-wrap justify-between gap-2 p-4">
            <span className="text-sm"><b>{c.name}</b> — {c.email} {c.isBlocked ? '(Blocked)' : ''}</span>
            <span className="space-x-3 text-sm">
              <button className="text-accent" onClick={async () => { const r = await get(`/admin/customers/${c._id}`); setDetail(r.data); }}>View</button>
              <button className="text-red-600" onClick={async () => { await put(`/admin/customers/${c._id}/block`, {}); load(); }}>{c.isBlocked ? 'Unblock' : 'Block'}</button>
            </span>
          </div>
        ))}
      </div>
      {detail && (
        <div className="card p-5">
          <h2 className="font-bold">Customer detail — {detail.user.name}</h2>
          <p className="text-sm text-[var(--muted)]">{detail.user.email} • {detail.user.phone}</p>
          <p className="mt-2 font-semibold">Order history ({detail.orders.length})</p>
          <ul className="mt-1 list-disc pl-5 text-sm">{detail.orders.map((o) => <li key={o._id}>{o.orderNumber} — {o.status} — {formatPKR(o.total)}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const load = () => get('/admin/reviews').then((r) => setReviews(r.data || [])).catch(() => {});
  useEffect(load, []);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Reviews</h1>
      <div className="space-y-2">
        {reviews.map((r) => (
          <div key={r._id} className="card flex flex-wrap justify-between gap-2 p-4">
            <span className="text-sm"><b>{r.product?.name}</b> — {r.rating}★ by {r.userName} {r.isApproved ? '(Approved)' : '(Pending)'}<br />{r.comment}</span>
            <span className="space-x-3 text-sm">
              {!r.isApproved && <button className="text-accent" onClick={async () => { await put(`/admin/reviews/${r._id}/approve`, {}); load(); }}>Approve</button>}
              <button className="text-red-600" onClick={async () => { await del(`/admin/reviews/${r._id}`); load(); }}>Delete</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CouponsPage = () => (
  <ListPage title="Coupons" endpoint="/admin/coupons" fields={[
    { key: 'code', label: 'Code (e.g. SAVE10)', required: true },
    { key: 'type', label: 'percent or fixed' },
    { key: 'value', label: 'Value', type: 'number', required: true },
    { key: 'usageLimit', label: 'Usage limit (0 = unlimited)', type: 'number' },
  ]} renderItem={(c) => `${c.code} — ${c.type} ${c.value} • Used ${c.usedCount}/${c.usageLimit || '∞'}`} />
);

export const BannersPage = () => (
  <ListPage title="Banners / Hero Slider" endpoint="/admin/banners" fields={[
    { key: 'title', label: 'Title', required: true },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'image', label: 'Image URL' },
    { key: 'ctaText', label: 'Button text' },
    { key: 'ctaLink', label: 'Button link' },
  ]} renderItem={(b) => `${b.title} — ${b.ctaLink} ${b.isActive ? '' : '(Hidden)'}`} />
);

export function MessagesPage() {
  const [items, setItems] = useState([]);
  const load = () => get('/admin/messages').then((r) => setItems(r.data || [])).catch(() => {});
  useEffect(load, []);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Messages</h1>
      {items.map((m) => (
        <div key={m._id} className="card flex justify-between gap-2 p-4">
          <div className="text-sm"><p><b>{m.name}</b> — {m.email}</p><p className="font-semibold">{m.subject}</p><p>{m.message}</p></div>
          <button className="text-sm text-red-600" onClick={async () => { await del(`/admin/messages/${m._id}`); load(); }}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export function SettingsPage() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const load = () => { setLoading(true); setError(''); get('/settings').then((r) => setForm(r.data || {})).catch((e) => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const fields = ['storeName', 'logo', 'whatsappNumber', 'deliveryCharge', 'freeDeliveryThreshold', 'bankName', 'bankAccountTitle', 'bankAccountNumber', 'easypaisaNumber', 'jazzcashNumber', 'facebook', 'instagram', 'twitter', 'youtube', 'contactEmail', 'contactPhone', 'address'];
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Send only the editable fields, with numbers as numbers — never the
      // whole document (_id, __v, timestamps) back to the server.
      const payload = {};
      for (const f of fields) {
        if (form[f] === undefined) continue;
        payload[f] = (f === 'deliveryCharge' || f === 'freeDeliveryThreshold') ? Number(form[f]) : form[f];
      }
      const r = await put('/admin/settings', payload);
      setForm(r.data || payload);
      toast.success('Settings saved');
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };
  if (loading) return <p>Loading settings…</p>;
  if (error) return <div className="space-y-3"><p className="text-red-500">Settings failed to load: {error}</p><button className="btn" onClick={load}>Retry</button></div>;
  return (
    <form onSubmit={save} className="card max-w-2xl space-y-3 p-5">
      <h1 className="text-2xl font-bold">Store Settings</h1>
      <p className="text-sm text-[var(--muted)]">These values control the checkout: delivery charge and free-delivery limit set the order total, the WhatsApp number powers the “Order via WhatsApp” button, and the bank / Easypaisa / JazzCash numbers are shown to customers who choose those payment methods. Changing them needs no code change.</p>
      {fields.map((f) => (
        <label key={f} className="block text-sm font-medium capitalize">{f.replace(/([A-Z])/g, ' $1')}
          <input className="field mt-1" type={(f === 'deliveryCharge' || f === 'freeDeliveryThreshold') ? 'number' : 'text'} value={form[f] ?? ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
        </label>
      ))}
      <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
    </form>
  );
}
