import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET must be set in production. See server/.env.example.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Using a development-only fallback. Set it in server/.env.');
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
}

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
