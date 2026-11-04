import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPKR, imgFallback } from '../lib/api.js';
import { ACCENTS, applyTheme, getAccent, getTheme } from '../lib/theme.js';
import { useWishlistStore } from '../store/useStore.js';

export function Stars({ value = 0 }) {
  return (
    <span className="text-amber-500" aria-label={`Rated ${value} out of 5`}>
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
    </span>
  );
}

export function Skeleton({ className = 'h-64' }) {
  return <div className={`animate-pulse rounded-3xl bg-neutral-100 dark:bg-neutral-800 ${className}`} />;
}

export function Empty({ title, text }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{text}</p>
    </div>
  );
}

export function ProductCard({ product }) {
  const { ids, toggle } = useWishlistStore();
  const wished = ids.includes(product._id);
  const price = product.salePrice > 0 ? product.salePrice : product.price;
  return (
    <article className="card group overflow-hidden transition hover:shadow-lg">
      <Link to={`/product/${product.slug}`} className="block bg-[var(--card2)] p-3">
        <img
          src={product.images?.[0] || ''}
          onError={imgFallback}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full rounded-[16px] object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${product.slug}`} className="font-semibold leading-snug hover:text-accent">
            {product.name}
          </Link>
          <button
            onClick={() => toggle(product._id)}
            aria-label="Toggle wishlist"
            className={`shrink-0 rounded-full px-2.5 py-1 text-sm ${wished ? 'text-red-500' : 'text-[var(--text)]'}`}
          >
            {wished ? '♥' : '♡'}
          </button>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-bold">{formatPKR(price)}</span>
          {product.salePrice > 0 && <span className="text-sm text-[var(--muted)] line-through">{formatPKR(product.price)}</span>}
        </div>
        <p className={`mt-1 text-xs font-medium ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {product.stock > 0 ? 'In stock' : 'Out of stock'}
        </p>
      </div>
    </article>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl p-10 text-center">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-neutral-500">Please refresh the page or go back home.</p>
          <Link to="/" className="btn mt-4">Go home</Link>
        </div>
      );
    }
    return this.props.children;
  }
}

export function useDarkMode() {
  // Real dark/light toggle, shared by the storefront and the admin panel
  // through localStorage (see src/lib/theme.js).
  const [theme, setThemeState] = useState(getTheme);
  const [accent, setAccentState] = useState(getAccent);
  useEffect(() => { applyTheme(theme, accent); }, [theme, accent]);
  const toggleDark = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  const setAccent = (v) => setAccentState(v);
  return [theme === 'dark', toggleDark, theme, accent, setAccent];
}

// Backwards-compatible alias used by Layout/AdminLayout.
export const useTheme = useDarkMode;

export function ThemeControls({ compact = false }) {
  const [dark, toggleDark, theme, accent, setAccent] = useDarkMode();
  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleDark} className="rounded-full border border-[var(--border)] px-3 py-2" aria-label="Toggle dark / light mode" title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
        {dark ? '☀️' : '🌙'}
      </button>
      {!compact && (
        <span className="flex items-center gap-1" title="Accent colour">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              onClick={() => setAccent(a.value)}
              aria-label={`${a.name} accent`}
              title={a.name}
              className={`h-6 w-6 rounded-full ${accent === a.value ? 'ring-2 ring-offset-2 ring-[var(--accent)]' : ''}`}
              style={{ background: a.value }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
