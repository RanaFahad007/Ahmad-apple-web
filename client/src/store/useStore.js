import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'apple-ahmad-auth' }
  )
);

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      add: (product, opts = {}) =>
        set((s) => {
          const key = `${product._id}-${opts.color || ''}-${opts.storage || ''}-${opts.condition || ''}`;
          const found = s.items.find((i) => i.key === key);
          if (found) {
            return { items: s.items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + (opts.quantity || 1) } : i)) };
          }
          return {
            items: [
              ...s.items,
              {
                key,
                product: product._id,
                name: product.name,
                slug: product.slug,
                image: product.images?.[0] || '',
                price: product.salePrice > 0 ? product.salePrice : product.price,
                quantity: opts.quantity || 1,
                color: opts.color || '',
                storage: opts.storage || '',
                condition: opts.condition || 'New',
              },
            ],
          };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      updateQty: (key, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, quantity: qty } : i)),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'apple-ahmad-cart' }
  )
);

export const useWishlistStore = create(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
    }),
    { name: 'apple-ahmad-wishlist' }
  )
);
