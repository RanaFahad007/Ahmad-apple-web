export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { apple: '#1c1c1e', accent: '#007aff', ink: '#000000', card: '#1c1c1e', card2: '#2c2c2e', muted: '#98989a' },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'] },
    },
  },
  plugins: [],
};
