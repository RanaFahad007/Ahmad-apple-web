import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { get, post, formatPKR, imgFallback, usePageTitle, imageUrl, getOptimizedUrl } from '../lib/api.js';
import { useAuthStore, useCartStore, useWishlistStore } from '../store/useStore.js';
import { Empty, ProductCard, Stars } from '../components/ui.jsx';

function colorHex(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('black') || n.includes('midnight')) return '#1c1c1e';
  if (n.includes('white') || n.includes('starlight')) return '#f5f5f7';
  if (n.includes('blue') || n.includes('sierra') || n.includes('titanium blue')) return '#6b8cae';
  if (n.includes('gold') || n.includes('titanium') || n.includes('desert') || n.includes('beige') || n.includes('natural')) return '#d9c7a5';
  if (n.includes('grey') || n.includes('gray') || n.includes('silver')) return '#c7c7cc';
  if (n.includes('pink') || n.includes('rose')) return '#e8b4b8';
  if (n.includes('green')) return '#7ba17d';
  if (n.includes('red')) return '#c0392b';
  if (n.includes('purple') || n.includes('violet')) return '#9b8ec4';
  if (n.includes('yellow')) return '#e6c85a';
  if (n.includes('orange')) return '#e67e22';
  return '#8e8e93';
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [image, setImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [condition, setCondition] = useState('New');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { ids: wishedIds, toggle: toggleWish } = useWishlistStore();
  usePageTitle(data?.product?.name || 'Product');

  useEffect(() => {
    get(`/products/${slug}`).then((r) => {
      setData(r.data);
      const v = r.data.product.variants?.[0];
      if (v) { setColor(v.color); setStorage(v.storage); setCondition(v.condition); }
    }).catch(() => setData(null));
  }, [slug]);

  if (data === null) return <div className="py-10"><Empty title="Product not found" text="This product may have been removed or hidden." /></div>;
  if (!data) return <p className="py-10 text-center">Loading…</p>;

  const { product, related, reviews } = data;
  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
  const storages = [...new Set(product.variants.map((v) => v.storage).filter(Boolean))];
  const wished = wishedIds.includes(product._id);
  const addToBag = () => { add(product, { color, storage, condition, quantity: qty }); toast.success('Added to bag'); };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await post('/reviews', { product: product._id, rating, comment });
      toast.success('Review submitted for approval');
      setComment('');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-10 pb-24 pt-6 md:pb-6">
      {/* Back + wishlist, like the mockup */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} aria-label="Back" className="rounded-full bg-[var(--card)] px-4 py-2 text-lg">‹</button>
        <button onClick={() => { if (!user) { toast.error('Wishlist ke liye pehle login ya register karein'); navigate('/login', { state: { from: `/product/${product.slug}` } }); return; } toggleWish(product._id); }} aria-label="Toggle wishlist" className={`rounded-full bg-[var(--card)] px-4 py-2 text-lg ${wished ? 'text-red-500' : 'text-[var(--text)]'}`}>{wished ? '♥' : '♡'}</button>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-[24px] bg-[var(--card2)] p-4" onClick={() => setZoom(!zoom)}>
            <img src={getOptimizedUrl(imageUrl(product.images?.[image]), 1000)} onError={imgFallback} alt={product.name} width={1000} height={1000} className={`w-full cursor-zoom-in rounded-[16px] object-cover transition ${zoom ? 'scale-150' : 'aspect-square'}`} />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {product.images?.map((src, i) => (
              <button key={i} onClick={() => setImage(i)} className={`shrink-0 overflow-hidden rounded-2xl border-2 ${image === i ? 'border-[#007aff]' : 'border-transparent'}`}>
                <img src={getOptimizedUrl(imageUrl(src), 150)} onError={imgFallback} alt="" loading="lazy" width={150} height={150} className="h-20 w-20 object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">Tap the main image to zoom.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#007aff]">{product.category?.name || ''} • {product.brandName}</p>
          <div className="mt-1 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
            <span className="shrink-0 text-xl font-extrabold sm:text-2xl">{formatPKR(price)}</span>
          </div>
          <div className="mt-2"><Stars value={product.rating} /> <span className="text-sm text-[var(--muted)]">({product.numReviews} reviews)</span></div>
          {product.salePrice > 0 && <p className="mt-1 text-lg text-[var(--muted)] line-through">{formatPKR(product.price)}</p>}
          <p className={`mt-2 font-medium ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>{product.stock > 0 ? 'In stock' : 'Out of stock'}</p>
          <p className="mt-4 text-[#d1d1d6]">{product.description}</p>

          {colors.length > 0 && (
            <div className="mt-5"><p className="text-[var(--muted)]">Color{color ? ` — ${color}` : ''}</p><div className="mt-2 flex flex-wrap gap-3">{colors.map((c) => <button key={c} onClick={() => setColor(c)} aria-label={c} title={c} className={`h-10 w-10 rounded-full border border-[var(--border)] ${color === c ? 'ring-2 ring-[#007aff] ring-offset-2 ring-offset-black' : ''}`} style={{ backgroundColor: colorHex(c) }} />)}</div></div>
          )}
          {storages.length > 0 && (
            <div className="mt-4"><p className="text-[var(--muted)]">Storage</p><div className="mt-2 flex flex-wrap gap-2">{storages.map((s) => <button key={s} onClick={() => setStorage(s)} className={storage === s ? 'pill-active' : 'pill'}>{s}</button>)}</div></div>
          )}
          <div className="mt-4"><p className="text-[var(--muted)]">Condition</p><div className="mt-2 flex flex-wrap gap-2">{['New', 'Used', 'Open Box'].map((c) => <button key={c} onClick={() => setCondition(c)} className={condition === c ? 'pill-active' : 'pill'}>{c === 'Open Box' ? 'Open box' : c}</button>)}</div></div>

          <div className="mt-6 hidden flex-wrap items-center gap-3 md:flex">
            <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--card)]">
              <button className="px-4 py-3" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button className="px-4 py-3" onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}>+</button>
            </div>
            <button className="btn flex-1" disabled={product.stock <= 0} onClick={addToBag}>Add to bag</button>
            <Link to="/cart" className="btn-outline" onClick={() => { add(product, { color, storage, condition, quantity: qty }); }}>Buy Now</Link>
          </div>
          <p className="mt-3 hidden text-sm text-[var(--muted)] md:block">SKU: {product.sku || '—'} • Free delivery over Rs 50,000 • Cash on Delivery available</p>
        </div>
      </div>

      {/* Pinned Add to bag bar on mobile (above the bottom nav) */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-[var(--bg)]/90 p-4 md:hidden">
        <button className="btn w-full !py-4 !text-base" disabled={product.stock <= 0} onClick={addToBag}>Add to bag</button>
      </div>

      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="card p-5">
          <h2 className="text-xl font-bold">Specifications</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k} className="border-t"><td className="py-2 pr-4 font-semibold text-[var(--muted)]">{k}</td><td className="py-2">{v}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="card p-5">
        <h2 className="text-xl font-bold">Reviews</h2>
        {reviews.length === 0 && <p className="mt-2 text-sm text-[var(--muted)]">No approved reviews yet.</p>}
        <div className="mt-3 space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="border-t border-[var(--border)] pt-3"><Stars value={r.rating} /><p className="mt-1">{r.comment}</p><p className="text-xs text-[var(--muted)]">by {r.userName}</p></div>
          ))}
        </div>
        {user ? (
          <form onSubmit={submitReview} className="mt-5 space-y-3 border-t border-[var(--border)] pt-4">
            <p className="font-semibold">Write a review <span className="text-xs font-normal text-[var(--muted)]">(only customers who purchased can review)</span></p>
            <select className="field" value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select>
            <textarea className="field" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the product?" required />
            <button className="btn">Submit Review</button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]"><Link to="/login" className="font-semibold text-accent">Log in</Link> to write a review after purchase.</p>
        )}
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
