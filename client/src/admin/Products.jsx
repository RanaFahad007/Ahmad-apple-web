import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { get, post, put, del, formatPKR } from '../lib/api.js';

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const load = () => get('/admin/products', { search, limit: 50 }).then((r) => setProducts(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, [search]);
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
      <div className="hidden overflow-x-auto rounded-3xl border md:block">
        <table className="w-full text-sm">
          <thead><tr className="bg-apple text-left dark:bg-neutral-800"><th className="p-3"></th><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Active</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3"><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggle(p._id)} /></td>
                <td className="p-3 font-semibold">{p.name}<p className="text-xs font-normal text-neutral-400">{p.category?.name || ''}</p></td>
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
            <p className="text-sm text-neutral-500">{formatPKR(p.salePrice > 0 ? p.salePrice : p.price)} • Stock {p.stock} • {p.isActive ? 'Active' : 'Hidden'}</p>
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

const EMPTY_FORM = { name: '', slug: '', brandName: 'Apple', category: '', price: '', salePrice: '', stock: '', sku: '', description: '', images: '', isFeatured: false, isActive: true };

export function ProductForm({ id }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  useEffect(() => { get('/categories').then((r) => setCategories(r.data || [])).catch(() => {}); }, []);
  useEffect(() => {
    if (!id || id === 'new') return;
    get('/admin/products', { limit: 100 }).then((r) => {
      const p = (r.data || []).find((x) => x._id === id);
      if (p) setForm({ ...EMPTY_FORM, ...p, category: p.category?._id || p.category || '', images: (p.images || []).join('\n'), price: String(p.price), salePrice: String(p.salePrice || ''), stock: String(p.stock) });
    });
  }, [id]);

  const onFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  };
  const moveImage = (idx, dir) => {
    const lines = form.images.split('\n').filter(Boolean);
    const next = [...lines];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setForm({ ...form, images: next.join('\n') });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      let uploaded = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        const res = await post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploaded = res.data || [];
      }
      const payload = {
        ...form,
        price: Number(form.price),
        salePrice: Number(form.salePrice || 0),
        stock: Number(form.stock || 0),
        images: [...form.images.split('\n').filter(Boolean), ...uploaded],
      };
      if (id && id !== 'new') await put(`/admin/products/${id}`, payload);
      else await post('/admin/products', payload);
      toast.success('Product saved');
      window.location.href = '/admin-ahmad/products';
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
        <p className="text-xs text-neutral-400">Paste image URLs (one per line), and/or upload new images below. Use ↑ / ↓ to reorder URL images.</p>
        <textarea className="field mt-2" rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
        <div className="mt-2 flex flex-wrap gap-2">
          {form.images.split('\n').filter(Boolean).map((src, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-apple px-2 py-1 text-xs dark:bg-neutral-800">
              {i + 1}. {src.slice(0, 30)}…
              <button type="button" onClick={() => moveImage(i, -1)}>↑</button>
              <button type="button" onClick={() => moveImage(i, 1)}>↓</button>
            </span>
          ))}
        </div>
        <input className="mt-3 w-full text-sm" type="file" accept="image/*" multiple onChange={onFiles} />
        <div className="mt-2 flex flex-wrap gap-2">{previews.map((src, i) => <img key={i} src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />)}</div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active / visible on site</label>
      <button className="btn">Save Product</button>
    </form>
  );
}
