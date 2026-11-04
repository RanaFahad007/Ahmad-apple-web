import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useStore.js';
import { formatPKR, imgFallback, usePageTitle } from '../lib/api.js';
import { Empty } from '../components/ui.jsx';

export default function Cart() {
  const { items, updateQty, remove, total } = useCartStore();
  usePageTitle('Cart');
  if (!items.length) return <div className="py-10"><Empty title="Your cart is empty" text="Add an iPhone, MacBook or accessory to get started." /></div>;
  return (
    <div className="grid gap-6 py-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.key} className="card flex gap-4 p-4">
            <Link to={`/product/${i.slug}`}><img src={i.image} onError={imgFallback} alt={i.name} className="h-24 w-24 rounded-2xl object-cover" /></Link>
            <div className="flex-1">
              <Link to={`/product/${i.slug}`} className="font-semibold hover:text-accent">{i.name}</Link>
              <p className="text-sm text-neutral-500">{i.color} {i.storage} • {i.condition}</p>
              <p className="mt-1 font-bold">{formatPKR(i.price)}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded-full border">
                  <button className="px-3 py-1" onClick={() => updateQty(i.key, i.quantity - 1)}>−</button>
                  <span className="w-8 text-center">{i.quantity}</span>
                  <button className="px-3 py-1" onClick={() => updateQty(i.key, i.quantity + 1)}>+</button>
                </div>
                <button className="text-sm text-red-600" onClick={() => remove(i.key)}>Remove</button>
              </div>
            </div>
            <p className="font-bold">{formatPKR(i.price * i.quantity)}</p>
          </div>
        ))}
      </div>
      <aside className="card h-fit p-5">
        <h2 className="text-lg font-bold">Order Summary</h2>
        <div className="mt-3 flex justify-between text-sm"><span>Subtotal</span><span>{formatPKR(total())}</span></div>
        <p className="mt-2 text-xs text-neutral-400">Delivery charges are calculated at checkout. Free delivery over Rs 50,000.</p>
        <Link to="/checkout" className="btn mt-5 w-full">Proceed to Checkout</Link>
        <Link to="/shop" className="btn-outline mt-2 w-full">Continue Shopping</Link>
      </aside>
    </div>
  );
}
