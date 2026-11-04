import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

// One-time admin bootstrap endpoint. It only works when ADMIN_SETUP_TOKEN is
// set in the deployment environment and the caller sends the same token in
// x-admin-token. It is removed from the repository after the first successful
// use, and the token environment variable is then inert (endpoint gone).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed', data: null });
  }
  if (!process.env.ADMIN_SETUP_TOKEN || req.headers['x-admin-token'] !== process.env.ADMIN_SETUP_TOKEN) {
    return res.status(403).json({ success: false, message: 'Forbidden', data: null });
  }
  const { email, password } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Valid email and a password of at least 6 characters are required', data: null });
  }
  try {
    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.role = 'admin';
      existing.password = password;
      existing.isBlocked = false;
      await existing.save();
      return res.status(200).json({ success: true, message: 'Existing user promoted to admin', data: { email: existing.email, role: existing.role } });
    }
    const user = await User.create({ name: 'Admin', email: email.toLowerCase(), password, role: 'admin' });
    return res.status(201).json({ success: true, message: 'Admin created', data: { email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Admin setup failed', data: null });
  }
}
