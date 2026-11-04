import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { get, imgFallback, usePageTitle } from '../lib/api.js';
import { ProductCard, Skeleton } from '../components/ui.jsx';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [best, setBest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  usePageTitle('Home');

  useEffect(() => {
    Promise.all([
      get('/banners').catch(() => ({ data: [] })),
      get('/products', { limit: 8, sort: 'newest' }).catch(() => ({ data: [] })),
      get('/products', { limit: 8, sort: 'popular' }).catch(() => ({ data: [] })),
      get('/categories').catch(() => ({ data: [] })),
    ]).then(([b, f, be, c]) => {
      setBanners(b.data || []);
      setFeatured(f.data || []);
      setBest(be.data || []);
      setCategories(c.data || []);
      setLoading(false);
    });
  }, []);

  const hero = banners[0];
  return (
    <div className="space-y-12 py-6">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] bg-apple dark:bg-neutral-900">
        <div className="grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-accent">New arrivals are here</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">{hero?.title || 'iPhone 15 Pro Max'}</h1>
            <p className="mt-3 text-neutral-500">{hero?.subtitle || 'Titanium. So strong. So light. So Pro. Genuine Apple products with warranty support.'}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={hero?.ctaLink || '/category/iphone'} className="btn">{hero?.ctaText || 'Shop iPhone'}</Link>
              <Link to="/shop" className="btn-outline">Shop All Products</Link>
            </div>
          </div>
          {hero?.image && <img src={hero.image} onError={imgFallback} alt={hero.title} className="aspect-[4/3] w-full rounded-3xl object-cover" />}
        </div>
      </motion.section>

      <section>
        <h2 className="text-2xl font-bold">Shop by category</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c._id} to={`/category/${c.slug}`} className="card overflow-hidden text-center transition hover:shadow-lg">
              <img src={c.image} onError={imgFallback} alt={c.name} loading="lazy" className="aspect-square w-full object-cover" />
              <p className="p-3 font-semibold">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between"><h2 className="text-2xl font-bold">New Arrivals</h2><Link to="/shop?sort=newest" className="text-sm font-semibold text-accent">View all →</Link></div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />) : featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between"><h2 className="text-2xl font-bold">Best Sellers</h2><Link to="/shop?sort=popular" className="text-sm font-semibold text-accent">View all →</Link></div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />) : best.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['✓ Genuine Products', 'Every device is checked and genuine, with warranty support.'],
          ['🚚 Fast Delivery', 'Nationwide delivery with Cash on Delivery available.'],
          ['💬 WhatsApp Support', 'Real help before and after you buy — ask us anything.'],
          ['↩️ Easy Returns', '7-day return policy on eligible items. See our policy page.'],
        ].map(([title, text]) => (
          <div key={title} className="card p-5">
            <p className="font-bold">{title}</p>
            <p className="mt-1 text-sm text-neutral-500">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
