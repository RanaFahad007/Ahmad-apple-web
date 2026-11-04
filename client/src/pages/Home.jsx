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
  const [selectedCat, setSelectedCat] = useState('');
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
      const iphone = (c.data || []).find((x) => x.slug === 'iphone' || x.name.toLowerCase() === 'iphone');
      setSelectedCat(iphone ? iphone.slug : (c.data || [])[0]?.slug || '');
      setLoading(false);
    });
  }, []);

  const hero = banners[0];
  const heroImage = hero?.image || featured[0]?.images?.[0] || '';
  const arrivals = selectedCat
    ? featured.filter((p) => p.category?.slug === selectedCat || p.category?.name?.toLowerCase() === selectedCat)
    : featured;
  const shownArrivals = arrivals.length ? arrivals : featured;

  return (
    <div className="space-y-8 py-6">
      {/* Hero — dark card, like the mockup: "New / iPhone 16 Pro / Titanium. Pro." */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[24px] bg-[var(--card)]">
        <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <p className="text-sm text-[var(--muted)]">New</p>
            <h1 className="mt-1 text-4xl font-extrabold leading-tight sm:text-5xl">{hero?.title || 'iPhone 16 Pro'}</h1>
            <p className="mt-2 text-[var(--muted)]">{hero?.subtitle || 'Titanium. Pro.'}</p>
            <div className="mt-6">
              <Link to={hero?.ctaLink || '/category/iphone'} className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-black">{hero?.ctaText || 'Shop now'}</Link>
            </div>
          </div>
          {heroImage && (
            <div className="rounded-[20px] bg-[var(--card2)] p-4">
              <img src={heroImage} onError={imgFallback} alt={hero?.title || 'Featured product'} className="aspect-[4/3] w-full rounded-[16px] object-cover" />
            </div>
          )}
        </div>
      </motion.section>

      {/* Category pills — selected pill is white, the rest dark grey */}
      <section>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCat(c.slug)}
              className={selectedCat === c.slug ? 'pill-active shrink-0' : 'pill shrink-0'}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between"><h2 className="text-2xl font-bold">New arrivals</h2><Link to="/shop?sort=newest" className="text-sm font-semibold text-[#007aff]">See all</Link></div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />) : shownArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between"><h2 className="text-2xl font-bold">Best Sellers</h2><Link to="/shop?sort=popular" className="text-sm font-semibold text-[#007aff]">See all</Link></div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
            <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
