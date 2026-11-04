import axios from 'axios';

// In production on Vercel, set VITE_API_URL to the API deployment (e.g. https://apple-ahmad-website-api.vercel.app/api).
// In local dev the Vite proxy handles /api, so no env var is needed there.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });
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
export const del = (url) => api.delete(url).then((r) => r.data);
export default api;

export const formatPKR = (n) =>
  `Rs ${Number(n || 0).toLocaleString('en-PK')}`;

export const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = 'https://placehold.co/900x900/f5f5f7/111111?text=Apple+Ahmad';
};

export function usePageTitle(title) {
  if (typeof document !== 'undefined') document.title = `${title} — Apple Ahmad`;
}
