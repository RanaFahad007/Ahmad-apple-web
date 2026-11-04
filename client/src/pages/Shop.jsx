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
  const [showSearch, setShowSearch] = useState(false);
  // query must be defined before it is read: the old order initialised
  // searchInput from query before query existed, which threw
  // "Cannot access 'query' before initialization" on every Shop render.
  const query = Object.fromEntries(searchParams.entries());
  const [searchInput, setSearchInput] = useState(query.search || '');
  usePageTitle(slug ? slug : 'Shop');

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

  const toggleFilter = (patch) => {
    const next = { ...query };
    Object.keys(patch).forEach((k) => {
      if (next[k] === patch[k]) delete next[k]; else next[k] = patch[k];
    });
    delete next.page;
    setSearchParams(next);
  };

  const categoryName = categories.find((c) => c.slug === slug)?.name || (slug ? slug.replace('-', ' ') : 'Shop All');

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold capitalize">{categoryName}</h1>
        <button className="rounded-full bg-[var(--card)] px-3 py-2 text-lg" aria-label="Search" onClick={() => setShowSearch(!showSearch)}>🔍</button>
      </div>
      {showSearch && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); update({ search: searchInput || undefined }); }}
        >
          <input className="field" placeholder="Search products" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <button className="btn !px-5" type="submit">Search</button>
        </form>
      )}
      {/* Pills — Filter is white (selected look), Sort / storage / condition are dark until active */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button className="pill-active shrink-0" onClick={() => setDrawer(true)}>Filter</button>
        <label className="pill shrink-0">
          <span className="mr-1">Sort</span>
          <select
            className="bg-transparent text-sm font-semibold outline-none [&>option]:text-black"
            value={filters.sort || 'newest'}
            onChange={(e) => update({ sort: e.target.value })}
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </label>
        <button className={filters.storage === '256GB' ? 'pill-active shrink-0' : 'pill shrink-0'} onClick={() => toggleFilter({ storage: '256GB' })}>256GB</button>
        <button className={filters.condition === 'New' ? 'pill-active shrink-0' : 'pill shrink-0'} onClick={() => toggleFilter({ condition: 'New' })}>New</button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><div className="card sticky top-32 p-5"><Filters value={filters} onChange={update} categories={categories} /></div></aside>
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>
          ) : products.length === 0 ? (
            <Empty title="No products found" text="Try removing a filter or searching for something else." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
        <div className="fixed inset-0 z-50 bg-[var(--bg)]/40 lg:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-[var(--card)] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex justify-between"><p className="font-bold">Filters</p><button onClick={() => setDrawer(false)}>✕</button></div>
            <Filters value={filters} onChange={(p) => { update(p); }} categories={categories} />
            <button className="btn mt-5 w-full" onClick={() => setDrawer(false)}>Show results</button>
          </div>
        </div>
      )}
    </div>
  );
}
