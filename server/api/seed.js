import { connectDB } from '../src/config/db.js';
import { runSeed } from '../src/seed/seedData.js';

// One-time bootstrap endpoint. It only works when SEED_TOKEN is set in the
// deployment environment and the caller sends the same token in x-seed-token.
// It is removed from the repository after the first successful seed, and the
// token environment variable is then deleted from Vercel.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed', data: null });
  }
  if (!process.env.SEED_TOKEN || req.headers['x-seed-token'] !== process.env.SEED_TOKEN) {
    return res.status(403).json({ success: false, message: 'Forbidden', data: null });
  }
  try {
    await connectDB();
    const result = await runSeed();
    return res.status(200).json({ success: true, message: 'Seed complete', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Seed failed', data: null });
  }
}
