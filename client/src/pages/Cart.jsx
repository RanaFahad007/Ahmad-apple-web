import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/useStore.js';
import { get, post, formatPKR, imgFallback, usePageTitle, getOptimizedUrl } from '../lib/api.js';
import { Empty } from '../components/ui.jsx';

export default function Cart() {
  const { items, updateQty, remove, total } = useCartStore();
  const [coupon, setCoupon] = useState(() => sessionStorage.getItem('aa-coupon') || '');
  const [discount, setDiscount] = useState(0);
  const [settings, setSettings] = useState({});
  usePageTitle('Bag');

  useEffect(() => { get('/settings').then((r) => setSettings(r.data || {})).catch(() => {}); }, []);

  const subtotal = total();
  const delivery = items.length === 0 ? 0 : (subtotal - discount >= (settings.freeDeliveryThreshold || 50000) ? 0 : (settings.deliveryCharge ?? 300));
  const grandTotal = subtotal - discount + delivery;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await post('/coupons/validate', { code: coupon });
      const c = res.data;
      setDiscount(c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value);
      sessionStorage.setItem('aa-coupon', coupon);
      toast.success(`Coupon ${c.code} applied`);
    } catch (err) { toast.error(err.message); }
  };

  if (!items.length) return <div className="py-10"><Empty title="Your bag is empty" text="Add an iPhone, MacBook or accessory to get started." /></div>;
  return (
    <div className="py-6">
      <h1 className="text-3xl font-extrabold">Bag</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((i) => {
            const variant = [i.storage, i.color, i.condition].filter(Boolean).join(', ');
            return (
              <div key={i.key} className="card flex gap-4 p-4">
                <Link to={`/product/${i.slug}`} className="shrink-0 rounded-[16px] bg-[var(--card2)] p-2">
                  <img src={getOptimizedUrl(i.image, 150)} onError={imgFallback} alt={i.name} loading="lazy" width={96} height={96} className="h-24 w-24 rounded-[12px] object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${i.slug}`} className="font-semibold hover:text-[#007aff]">{i.name}</Link>
                  {variant && <p className="text-sm text-[var(--muted)]">{variant}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--card2)] text-lg" onClick={() => updateQty(i.key, i.quantity - 1)} aria-label="Decrease quantity">−</button>
                    <span className="w-6 text-center font-bold">{i.quantity}</span>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--card2)] text-lg" onClick={() => updateQty(i.key, i.quantity + 1)} aria-label="Increase quantity">+</button>
                    <button className="ml-2 text-sm text-red-500" onClick={() => remove(i.key)}>Remove</button>
                  </div>
                </div>
                <p className="shrink-0 font-bold">{formatPKR(i.price * i.quantity)}</p>
              </div>
            );
          })}
        </div>
        <aside className="space-y-3">
          <div className="card flex gap-2 p-3">
            <input className="field !border-0 !bg-[var(--card2)]" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <button type="button" className="btn !px-5 shrink-0" onClick={applyCoupon}>Apply</button>
          </div>
          <div className="card p-5">
            <div className="flex justify-between text-sm text-[var(--muted)]"><span>Subtotal</span><span className="text-[var(--text)]">{formatPKR(subtotal)}</span></div>
            {discount > 0 && <div className="mt-2 flex justify-between text-sm text-[var(--muted)]"><span>Discount</span><span className="text-green-500">− {formatPKR(discount)}</span></div>}
            <div className="mt-2 flex justify-between text-sm text-[var(--muted)]"><span>Delivery</span><span className="text-[var(--text)]">{delivery === 0 ? 'FREE' : formatPKR(delivery)}</span></div>
            <div className="mt-3 flex justify-between border-t border-[var(--border)] pt-3 font-bold"><span>Total</span><span>{formatPKR(grandTotal)}</span></div>
          </div>
          <Link to="/checkout" className="btn w-full !py-4 !text-base">Checkout</Link>
          <Link to="/shop" className="btn-outline w-full">Continue Shopping</Link>
        </aside>
      </div>
    </div>
  );
}
