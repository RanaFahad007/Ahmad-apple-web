import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { get, post } from '../lib/api.js';
import { useAuthStore, useCartStore, useWishlistStore } from '../store/useStore.js';
import { ThemeControls } from './ui.jsx';

function SearchBox({ mobile = false }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setItems([]); return; }
    timer.current = setTimeout(async () => {
      try { const res = await get('/products/suggestions', { q }); setItems(res.data || []); } catch { setItems([]); }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);
  return (
    <div className="relative w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { navigate(`/shop?search=${encodeURIComponent(q)}`); setItems([]); } }}
        placeholder="Search products"
        className="field !rounded-full !py-2.5"
        aria-label="Search products"
      />
      {items.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
          {items.map((p) => (
            <Link key={p._id} to={`/product/${p.slug}`} onClick={() => setItems([])} className="block px-4 py-3 text-sm hover:bg-[var(--card2)]">
              {p.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.count());
  const wishCount = useWishlistStore((s) => s.ids.length);
  const navigate = useNavigate();

  useEffect(() => {
    get('/categories').then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await post('/auth/logout', {}); } catch {}
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
          <button className="rounded-full border border-[var(--border)] px-3 py-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
          <Link to="/" className="text-lg font-extrabold tracking-tight sm:text-xl">
            <span className="md:hidden">Ahmed Phones &amp; Accessories</span>
            <span className="hidden md:inline">🍎 Apple <span className="text-accent">Ahmad</span></span>
          </Link>
          <div className="hidden flex-1 md:block"><SearchBox /></div>
          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeControls compact />
            <Link to="/wishlist" className="relative rounded-full border border-[var(--border)] px-3 py-2">♡{wishCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">{wishCount}</span>}</Link>
            <Link to="/cart" className="relative rounded-full border border-[var(--border)] px-3 py-2">🛒{cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] text-white">{cartCount}</span>}</Link>
            {user ? (
              <>
                <Link to="/profile" className="hidden rounded-full border border-[var(--border)] px-3 py-2 sm:block">{user.name.split(' ')[0]}</Link>
                <button onClick={handleLogout} className="rounded-full border border-[var(--border)] px-3 py-2">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn !px-4 !py-2">Login</Link>
            )}
          </nav>
        </div>
        <div className="border-t border-[var(--border)] px-4 py-2 md:hidden"><SearchBox mobile /></div>
        <nav className="mx-auto hidden max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 text-sm font-medium lg:flex">
          <NavLink to="/" className="hover:text-accent">Home</NavLink>
          <NavLink to="/shop" className="hover:text-accent">Shop All</NavLink>
          {categories.map((c) => (
            <NavLink key={c._id} to={`/category/${c.slug}`} className="whitespace-nowrap hover:text-accent">{c.name}</NavLink>
          ))}
          <NavLink to="/about" className="hover:text-accent">About</NavLink>
          <NavLink to="/contact" className="hover:text-accent">Contact</NavLink>
          <NavLink to="/faq" className="hover:text-accent">FAQ</NavLink>
        </nav>
        {open && (
          <nav className="space-y-1 border-t px-4 py-3 text-sm font-medium lg:hidden">
            <Link to="/" onClick={() => setOpen(false)} className="block py-2">Home</Link>
            <Link to="/shop" onClick={() => setOpen(false)} className="block py-2">Shop All</Link>
            {categories.map((c) => (
              <Link key={c._id} to={`/category/${c.slug}`} onClick={() => setOpen(false)} className="block py-2">{c.name}</Link>
            ))}
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="block py-2">Contact</Link>
            <Link to="/faq" onClick={() => setOpen(false)} className="block py-2">FAQ</Link>
            <Link to="/profile" onClick={() => setOpen(false)} className="block py-2">My Account</Link>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 md:pb-10"><Outlet /></main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-extrabold">🍎 Apple Ahmad</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Genuine Apple products, honest prices, Cash on Delivery across Pakistan.</p>
            <div className="mt-3"><p className="text-xs font-semibold text-[var(--muted)]">Appearance &amp; accent colour</p><div className="mt-2"><ThemeControls /></div></div>
          </div>
          <div>
            <p className="font-semibold">Shop</p>
            <div className="mt-2 space-y-1 text-sm text-[var(--muted)]">
              {categories.map((c) => (<Link key={c._id} to={`/category/${c.slug}`} className="block hover:text-accent">{c.name}</Link>))}
            </div>
          </div>
          <div>
            <p className="font-semibold">Help</p>
            <div className="mt-2 space-y-1 text-sm text-[var(--muted)]">
              <Link to="/faq" className="block hover:text-accent">FAQ</Link>
              <Link to="/returns" className="block hover:text-accent">Return &amp; Warranty Policy</Link>
              <Link to="/privacy" className="block hover:text-accent">Privacy Policy</Link>
              <Link to="/contact" className="block hover:text-accent">Contact Us</Link>
            </div>
          </div>
          <div>
            <p className="font-semibold">Account</p>
            <div className="mt-2 space-y-1 text-sm text-[var(--muted)]">
              <Link to="/login" className="block hover:text-accent">Login</Link>
              <Link to="/register" className="block hover:text-accent">Register</Link>
              <Link to="/profile" className="block hover:text-accent">My Orders</Link>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-[var(--muted)]">© {new Date().getFullYear()} Apple Ahmad. Not affiliated with Apple Inc.</p>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-[var(--border)] bg-[var(--bg)] py-2 text-xs font-medium md:hidden">
        {[
          ['/', '🏠', 'Home'],
          ['/shop', '🔍', 'Search'],
          ['/wishlist', '♡', 'Wishlist'],
          ['/cart', '🛍', 'Bag'],
          ['/profile', '👤', 'Profile'],
        ].map(([to, icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center px-3 py-1 ${isActive ? 'text-[#007aff]' : 'text-[var(--muted)]'}`}>
            <span className="text-lg leading-none">{icon}</span><span className="mt-1">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
