import React, { useEffect, useState } from 'react';
import { get, usePageTitle } from '../lib/api.js';
import { useWishlistStore } from '../store/useStore.js';
import { Empty, ProductCard } from '../components/ui.jsx';

export default function Wishlist() {
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState([]);
  usePageTitle('Wishlist');
  useEffect(() => {
    if (!ids.length) { setProducts([]); return; }
    get('/products', { limit: 100 }).then((r) => setProducts((r.data || []).filter((p) => ids.includes(p._id)))).catch(() => {});
  }, [ids]);
  if (!products.length) return <div className="py-10"><Empty title="Wishlist is empty" text="Tap the heart on any product to save it here." /></div>;
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold">My Wishlist</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
    </div>
  );
}
