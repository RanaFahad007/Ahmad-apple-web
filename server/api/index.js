import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Vercel serverless entry point. The connection is cached across warm invocations.
let connected = false;

export default async function handler(req, res) {
  try {
    if (!connected) {
      await connectDB();
      connected = true;
    }
    return app(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error', data: null });
  }
}
