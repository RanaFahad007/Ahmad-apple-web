import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { runSeed } from './seedData.js';

connectDB()
  .then(() => runSeed())
  .then((r) => {
    console.log('Seed complete:', r);
    return mongoose.disconnect();
  })
  .catch(async (err) => {
    console.error('Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
