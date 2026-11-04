import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { get, post, put, del, formatPKR, imageUrl } from '../lib/api.js';
import ImageUploader from './ImageUploader.jsx';

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = () => { setLoading(true); setError(''); get('/admin/products', { search, limit: 50 }).then((r) => setProducts(r.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false)); };
  // Debounce typing: the old code fired one API call per keystroke, and each
  // cold serverless call is slow, so typing felt frozen.
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Products</h1>
        <Link to="/admin-ahmad/products/new" className="btn">+ Add Product</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="field !w-auto flex-1" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {selected.length > 0 && (
          <button className="btn-outline !text-red-600" onClick={async () => { await post('/admin/products/bulk-delete', { ids: selected }); setSelected([]); load(); toast.success('Deleted'); }}>Delete selected ({selected.length})</button>
        )}
      </div>
      {loading && <p>Loading products…</p>}
      {error && <p className="text-red-500">Failed to load products: {error} <button className="btn-outline !py-1" onClick={load}>Retry</button></p>}
      <div className="hidden overflow-x-auto rounded-3xl border md:block">
        <table className="w-full text-sm">
          <thead><tr className="bg-[var(--card)] text-left "><th className="p-3"></th><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Active</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3"><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggle(p._id)} /></td>
                <td className="p-3 font-semibold">{p.name}<p className="text-xs font-normal text-[var(--muted)]">{p.category?.name || ''}</p></td>
                <td className="p-3">{formatPKR(p.salePrice > 0 ? p.salePrice : p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.isActive ? 'Yes' : 'No'}</td>
                <td className="p-3 space-x-2">
                  <Link to={`/admin-ahmad/products/${p._id}`} className="text-accent">Edit</Link>
                  <button className="text-accent" onClick={async () => { await post(`/admin/products/${p._id}/duplicate`, {}); load(); toast.success('Duplicated'); }}>Duplicate</button>
                  <button className="text-red-600" onClick={async () => { if (confirm('Delete this product?')) { await del(`/admin/products/${p._id}`); load(); } }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {products.map((p) => (
          <div key={p._id} className="card p-4">
            <p className="font-bold">{p.name}</p>
            <p className="text-sm text-[var(--muted)]">{formatPKR(p.salePrice > 0 ? p.salePrice : p.price)} • Stock {p.stock} • {p.isActive ? 'Active' : 'Hidden'}</p>
            <div className="mt-2 space-x-3 text-sm">
              <Link to={`/admin-ahmad/products/${p._id}`} className="text-accent">Edit</Link>
              <button className="text-accent" onClick={async () => { await post(`/admin/products/${p._id}/duplicate`, {}); load(); }}>Duplicate</button>
              <button className="text-red-600" onClick={async () => { if (confirm('Delete?')) { await del(`/admin/products/${p._id}`); load(); } }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EMPTY_FORM = { name: '', slug: '', brandName: 'Apple', category: '', price: '', salePrice: '', stock: '', sku: '', description: '', images: [], isFeatured: false, isActive: true };

export function ProductForm({ id }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { get('/categories').then((r) => setCategories(r.data || [])).catch(() => {}); }, []);
  useEffect(() => {
    if (!id || id === 'new') return;
    // Single-product fetch (new server route) instead of downloading 100 products to find one.
    get(`/admin/products/${id}`).then((r) => {
      const p = r.data;
      if (p) setForm({ ...EMPTY_FORM, ...p, category: p.category?._id || p.category || '', images: (p.images || []).map((img) => ({ url: imageUrl(img), publicId: img?.publicId || '' })), price: String(p.price), salePrice: String(p.salePrice || ''), stock: String(p.stock) });
    }).catch((e) => toast.error(e.message));
  }, [id]);


  const submit = async (e) => {
    e.preventDefault();
    try {
      // Images were already uploaded straight to Cloudinary by
      // <ImageUploader /> — this save sends only URLs/publicIds as JSON,
      // so it can never hit Vercel's 4.5MB payload limit.
      const payload = {
        ...form,
        price: Number(form.price),
        salePrice: Number(form.salePrice || 0),
        stock: Number(form.stock || 0),
        images: form.images,
      };
      if (id && id !== 'new') await put(`/admin/products/${id}`, payload);
      else await post('/admin/products', payload);
      toast.success('Product saved');
      navigate('/admin-ahmad/products');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <form onSubmit={submit} className="card max-w-3xl space-y-3 p-5">
      <h1 className="text-2xl font-bold">{id && id !== 'new' ? 'Edit Product' : 'Add Product'}</h1>
      <input className="field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input className="field" placeholder="Slug (leave blank to auto-generate)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
        <option value="">Select category</option>
        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input className="field" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input className="field" type="number" placeholder="Sale price (0 = none)" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
        <input className="field" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
        <input className="field" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
      </div>
      <textarea className="field" rows={4} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div>
        <p className="font-semibold">Images</p>
        <p className="text-xs text-[var(--muted)]">Tap 📷, pick from gallery/camera (even 3–5MB phone photos — they are compressed and uploaded straight to Cloudinary). Drag or use ↑ / ↓ to reorder; the first image is the main image.</p>
        <div className="mt-2">
          <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} folder="products" deleteOnRemove onBusyChange={setUploading} buttonLabel="📷 Add product images" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active / visible on site</label>
      <button className="btn" disabled={uploading}>{uploading ? "Uploading images…" : "Save Product"}</button>
    </form>
  );
}
