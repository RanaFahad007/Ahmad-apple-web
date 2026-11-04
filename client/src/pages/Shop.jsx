import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { get, usePageTitle } from '../lib/api.js';
import { Empty, ProductCard, Skeleton } from '../components/ui.jsx';

function Filters({ value, onChange, categories }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="font-semibold">Category</p>
        <select className="field mt-2" value={value.categorySlug || ''} onChange={(e) => onChange({ categorySlug: e.target.value || undefined })}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <p className="font-semibold">Condition</p>
        <select className="field mt-2" value={value.condition || ''} onChange={(e) => onChange({ condition: e.target.value || undefined })}>
          <option value="">Any condition</option>
          <option>New</option><option>Used</option><option>Open Box</option>
        </select>
      </div>
      <div>
        <p className="font-semibold">Price range (Rs)</p>
        <div className="mt-2 flex gap-2">
          <input className="field" type="number" placeholder="Min" value={value.minPrice || ''} onChange={(e) => onChange({ minPrice: e.target.value || undefined })} />
          <input className="field" type="number" placeholder="Max" value={value.maxPrice || ''} onChange={(e) => onChange({ maxPrice: e.target.value || undefined })} />
        </div>
      </div>
      <div>
        <p className="font-semibold">Sort</p>
        <select className="field mt-2" value={value.sort || 'newest'} onChange={(e) => onChange({ sort: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}

export default function Shop() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  usePageTitle(slug ? slug : 'Shop');

  const query = Object.fromEntries(searchParams.entries());
  const filters = { ...query, ...(slug ? { categorySlug: slug } : {}) };

  useEffect(() => { get('/categories').then((r) => setCategories(r.data || [])).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    get('/products', { ...filters, page: query.page || 1, limit: 12 })
      .then((r) => { setProducts(r.data || []); setPagination(r.pagination); setLoading(false); })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, slug]);

  const update = (patch) => {
    const next = { ...query, ...patch };
    Object.keys(next).forEach((k) => next[k] === undefined && delete next[k]);
    delete next.page;
    setSearchParams(next);
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold capitalize">{slug ? slug.replace('-', ' ') : 'Shop All'}</h1>
        <button className="btn-outline !px-4 !py-2 lg:hidden" onClick={() => setDrawer(true)}>Filters</button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><div className="card sticky top-32 p-5"><Filters value={filters} onChange={update} categories={categories} /></div></aside>
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>
          ) : products.length === 0 ? (
            <Empty title="No products found" text="Try removing a filter or searching for something else." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {pagination && pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button key={i} onClick={() => setSearchParams({ ...query, page: String(i + 1) })} className={`rounded-full border px-4 py-2 text-sm ${pagination.page === i + 1 ? 'bg-accent text-white' : ''}`}>{i + 1}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex justify-between"><p className="font-bold">Filters</p><button onClick={() => setDrawer(false)}>✕</button></div>
            <Filters value={filters} onChange={(p) => { update(p); }} categories={categories} />
            <button className="btn mt-5 w-full" onClick={() => setDrawer(false)}>Show results</button>
          </div>
        </div>
      )}
    </div>
  );
}
