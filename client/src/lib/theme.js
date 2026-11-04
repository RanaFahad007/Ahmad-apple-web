// Shared theme for the storefront AND the admin panel.
// Persisted in localStorage (same origin, so one choice applies to both).
// Accent is a CSS variable, so buttons, active nav items and links follow it.
export const ACCENTS = [
  { name: 'Blue', value: '#007aff' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#0d9488' },
];

export function getTheme() {
  try { return localStorage.getItem('aa-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
}
export function getAccent() {
  try {
    const v = localStorage.getItem('aa-accent');
    return ACCENTS.some((a) => a.value === v) ? v : '#007aff';
  } catch { return '#007aff'; }
}
export function applyTheme(theme = getTheme(), accent = getAccent()) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  root.style.setProperty('--accent', accent);
  try {
    localStorage.setItem('aa-theme', theme);
    localStorage.setItem('aa-accent', accent);
  } catch {}
}
