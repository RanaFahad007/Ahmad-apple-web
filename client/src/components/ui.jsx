import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPKR, imgFallback } from '../lib/api.js';
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
      <Link to={`/product/${product.slug}`} className="block bg-apple">
        <img
          src={product.images?.[0] || ''}
          onError={imgFallback}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
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
            className={`shrink-0 rounded-full border px-2.5 py-1 text-sm ${wished ? 'border-red-200 bg-red-50 text-red-600' : ''}`}
          >
            {wished ? '♥' : '♡'}
          </button>
        </div>
        <div className="mt-1 text-sm text-neutral-500">
          <Stars value={product.rating} /> <span>({product.numReviews || 0})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatPKR(price)}</span>
          {product.salePrice > 0 && <span className="text-sm text-neutral-400 line-through">{formatPKR(product.price)}</span>}
        </div>
        <p className={`mt-1 text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
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
  const [dark, setDark] = useState(() => localStorage.getItem('aa-theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('aa-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}
