import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { get, post, formatPKR, imgFallback, usePageTitle } from '../lib/api.js';
import { useAuthStore, useCartStore } from '../store/useStore.js';
import { Empty, ProductCard, Stars } from '../components/ui.jsx';

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

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await post('/reviews', { product: product._id, rating, comment });
      toast.success('Review submitted for approval');
      setComment('');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-10 py-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl bg-apple" onClick={() => setZoom(!zoom)}>
            <img src={product.images?.[image] || ''} onError={imgFallback} alt={product.name} className={`w-full cursor-zoom-in object-cover transition ${zoom ? 'scale-150' : 'aspect-square'}`} />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {product.images?.map((src, i) => (
              <button key={i} onClick={() => setImage(i)} className={`shrink-0 overflow-hidden rounded-2xl border-2 ${image === i ? 'border-accent' : 'border-transparent'}`}>
                <img src={src} onError={imgFallback} alt="" className="h-20 w-20 object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-400">Tap the main image to zoom.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-accent">{product.category?.name || ''} • {product.brandName}</p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
          <div className="mt-2"><Stars value={product.rating} /> <span className="text-sm text-neutral-500">({product.numReviews} reviews)</span></div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatPKR(price)}</span>
            {product.salePrice > 0 && <span className="text-lg text-neutral-400 line-through">{formatPKR(product.price)}</span>}
          </div>
          <p className={`mt-2 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.stock > 0 ? `In stock — ${product.stock} available` : 'Out of stock'}</p>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">{product.description}</p>

          {colors.length > 0 && (
            <div className="mt-5"><p className="font-semibold">Colour</p><div className="mt-2 flex flex-wrap gap-2">{colors.map((c) => <button key={c} onClick={() => setColor(c)} className={`rounded-full border px-4 py-2 text-sm ${color === c ? 'border-accent bg-accent/10' : ''}`}>{c}</button>)}</div></div>
          )}
          {storages.length > 0 && (
            <div className="mt-4"><p className="font-semibold">Storage</p><div className="mt-2 flex flex-wrap gap-2">{storages.map((s) => <button key={s} onClick={() => setStorage(s)} className={`rounded-full border px-4 py-2 text-sm ${storage === s ? 'border-accent bg-accent/10' : ''}`}>{s}</button>)}</div></div>
          )}
          <div className="mt-4"><p className="font-semibold">Condition</p><div className="mt-2 flex flex-wrap gap-2">{['New', 'Used', 'Open Box'].map((c) => <button key={c} onClick={() => setCondition(c)} className={`rounded-full border px-4 py-2 text-sm ${condition === c ? 'border-accent bg-accent/10' : ''}`}>{c}</button>)}</div></div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border">
              <button className="px-4 py-3" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button className="px-4 py-3" onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}>+</button>
            </div>
            <button
              className="btn"
              disabled={product.stock <= 0}
              onClick={() => { add(product, { color, storage, condition, quantity: qty }); toast.success('Added to cart'); }}
            >
              Add to Cart
            </button>
            <Link to="/cart" className="btn-outline" onClick={() => { add(product, { color, storage, condition, quantity: qty }); }}>Buy Now</Link>
          </div>
          <p className="mt-3 text-sm text-neutral-500">SKU: {product.sku || '—'} • Free delivery over Rs 50,000 • Cash on Delivery available</p>
        </div>
      </div>

      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="card p-5">
          <h2 className="text-xl font-bold">Specifications</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k} className="border-t"><td className="py-2 pr-4 font-semibold text-neutral-500">{k}</td><td className="py-2">{v}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="card p-5">
        <h2 className="text-xl font-bold">Reviews</h2>
        {reviews.length === 0 && <p className="mt-2 text-sm text-neutral-500">No approved reviews yet.</p>}
        <div className="mt-3 space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="border-t pt-3"><Stars value={r.rating} /><p className="mt-1">{r.comment}</p><p className="text-xs text-neutral-400">by {r.userName}</p></div>
          ))}
        </div>
        {user ? (
          <form onSubmit={submitReview} className="mt-5 space-y-3 border-t pt-4">
            <p className="font-semibold">Write a review <span className="text-xs font-normal text-neutral-400">(only customers who purchased can review)</span></p>
            <select className="field" value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select>
            <textarea className="field" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the product?" required />
            <button className="btn">Submit Review</button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-neutral-500"><Link to="/login" className="font-semibold text-accent">Log in</Link> to write a review after purchase.</p>
        )}
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold">Related products</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
