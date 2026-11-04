import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first (see server/.env.example).');
    process.exit(1);
  }
  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.role = 'admin';
    existing.password = password;
    await existing.save();
    console.log(`Admin updated: ${email}`);
  } else {
    await User.create({ name: 'Admin', email: email.toLowerCase(), password, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('seed:admin failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
