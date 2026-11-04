import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { get, post, formatPKR, usePageTitle } from '../lib/api.js';
import { useAuthStore, useCartStore } from '../store/useStore.js';

export default function Checkout() {
  const { items, total, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({ fullName: user?.name || '', phone: user?.phone || '', city: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [screenshot, setScreenshot] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  usePageTitle('Checkout');

  useEffect(() => {
    get('/settings').then((r) => setSettings(r.data || {})).catch(() => {});
    if (!user) { /* Guests can still check out; the order is saved without a user link. */ }
  }, [user]);

  if (!items.length) return <p className="py-10 text-center">Your cart is empty. <a href="/shop" className="text-accent">Shop now</a></p>;

  const subtotal = total();
  const delivery = subtotal - discount >= (settings.freeDeliveryThreshold || 50000) ? 0 : (settings.deliveryCharge ?? 300);
  const grandTotal = subtotal - discount + delivery;

  const applyCoupon = async () => {
    try {
      const res = await post('/coupons/validate', { code: coupon });
      const c = res.data;
      setDiscount(c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value);
      toast.success(`Coupon ${c.code} applied`);
    } catch (err) { toast.error(err.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (paymentMethod !== 'COD' && !screenshot) {
      toast.error('Please paste the payment screenshot URL (upload it in the admin upload flow, or send it on WhatsApp after ordering).');
      return;
    }
    try {
      const res = await post('/orders', {
        items: items.map((i) => ({ product: i.product, quantity: i.quantity, color: i.color, storage: i.storage, condition: i.condition })),
        shippingAddress: form,
        paymentMethod,
        paymentScreenshot: screenshot,
        couponCode: coupon,
      });
      const order = res.data;
      clear();
      navigate(`/order-success/${order._id}`, { state: { order } });
    } catch (err) { toast.error(err.message); }
  };

  const whatsappText = encodeURIComponent(`Hi Apple Ahmad! I want to order:\n${items.map((i) => `- ${i.name} x${i.quantity} (${formatPKR(i.price)})`).join('\n')}\nTotal: ${formatPKR(grandTotal)}`);
  const whatsappUrl = settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}?text=${whatsappText}` : null;

  return (
    <div className="grid gap-6 py-6 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="card space-y-4 p-5">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <input className="field" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input className="field" placeholder="Phone (e.g. 03xx-xxxxxxx)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input className="field" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <textarea className="field" rows={3} placeholder="Full delivery address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />

        <div>
          <p className="font-semibold">Payment method</p>
          <div className="mt-2 space-y-2">
            {['COD', 'Bank Transfer', 'Easypaisa', 'JazzCash'].map((m) => (
              <label key={m} className="flex items-center gap-2 rounded-xl border p-3 text-sm">
                <input type="radio" name="payment" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} /> {m === 'COD' ? 'Cash on Delivery' : m}
              </label>
            ))}
          </div>
        </div>

        {paymentMethod === 'Bank Transfer' && (
          <div className="rounded-2xl bg-apple p-4 text-sm dark:bg-neutral-800">
            <p className="font-semibold">Bank transfer details</p>
            <p>Bank: {settings.bankName || '—'} • Title: {settings.bankAccountTitle || '—'} • Account: {settings.bankAccountNumber || '—'}</p>
            <p className="mt-1 text-neutral-500">After transfer, paste the screenshot link below or send it on WhatsApp.</p>
          </div>
        )}
        {paymentMethod === 'Easypaisa' && <p className="text-sm">Easypaisa number: <b>{settings.easypaisaNumber || '—'}</b></p>}
        {paymentMethod === 'JazzCash' && <p className="text-sm">JazzCash number: <b>{settings.jazzcashNumber || '—'}</b></p>}
        {paymentMethod !== 'COD' && (
          <input className="field" placeholder="Payment screenshot URL (optional if sending on WhatsApp)" value={screenshot} onChange={(e) => setScreenshot(e.target.value)} />
        )}
        <button className="btn w-full">Place Order — {formatPKR(grandTotal)}</button>
        {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-outline w-full">Order via WhatsApp instead</a>}
      </form>

      <aside className="card h-fit p-5">
        <h2 className="font-bold">Order Summary</h2>
        <div className="mt-3 space-y-2 text-sm">
          {items.map((i) => <div key={i.key} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{formatPKR(i.price * i.quantity)}</span></div>)}
          <div className="flex justify-between border-t pt-2"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>− {formatPKR(discount)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? 'FREE' : formatPKR(delivery)}</span></div>
          <div className="flex justify-between font-bold"><span>Total</span><span>{formatPKR(grandTotal)}</span></div>
        </div>
        <div className="mt-4 flex gap-2">
          <input className="field" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          <button type="button" className="btn-outline !px-4" onClick={applyCoupon}>Apply</button>
        </div>
        <p className="mt-2 text-xs text-neutral-400">Try WELCOME10 for 10% off.</p>
      </aside>
    </div>
  );
}
