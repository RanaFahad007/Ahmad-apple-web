export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { apple: 'var(--card)', accent: 'var(--accent)', ink: 'var(--text)', card: 'var(--card)', card2: 'var(--card2)', muted: 'var(--muted)' },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'] },
    },
  },
  plugins: [],
};
