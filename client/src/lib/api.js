import axios from 'axios';

// In production on Vercel, set VITE_API_URL to the API deployment (e.g. https://apple-ahmad-website-api.vercel.app/api).
// In local dev the Vite proxy handles /api, so no env var is needed there.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true, timeout: 30000 });
// The auth token is also stored in zustand persist (apple-ahmad-auth).
// Send it as a Bearer header too: the httpOnly cookie alone is a third-party
// cookie between the website and API domains and browsers can drop it,
// which used to leave admin pages hanging on "Checking admin access…".
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('apple-ahmad-auth');
    const token = raw ? JSON.parse(raw)?.state?.token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const get = (url, params) => api.get(url, { params }).then((r) => r.data);
export const post = (url, data, config) => api.post(url, data, config).then((r) => r.data);
export const put = (url, data, config) => api.put(url, data, config).then((r) => r.data);
export const del = (url, data) => api.delete(url, data ? { data } : {}).then((r) => r.data);
export default api;

export const formatPKR = (n) =>
  `Rs ${Number(n || 0).toLocaleString('en-PK')}`;

export const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = 'https://placehold.co/900x900/f5f5f7/111111?text=Apple+Ahmad';
};

// An image may be a plain URL string (old data, pasted links) or a
// { url, publicId } object from Cloudinary direct upload.
export function imageUrl(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
}

export function publicIdOf(image) {
  if (!image || typeof image === 'string') return '';
  return image.publicId || '';
}

// Cloudinary delivery optimisation: insert f_auto,q_auto,w_{width} right
// after "/upload/" so the browser downloads a right-sized file instead of
// the full original. Non-Cloudinary URLs are returned unchanged.
export function getOptimizedUrl(url, width) {
  if (!url || !url.includes('/upload/')) return url || '';
  if (/\/upload\/f_auto/.test(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}

export function usePageTitle(title) {
  if (typeof document !== 'undefined') document.title = `${title} — Apple Ahmad`;
}
