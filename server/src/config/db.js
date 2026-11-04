import mongoose from 'mongoose';

function resolveMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  return null;
}

// Cache the connection promise across warm serverless invocations.
// The old code called mongoose.connect() on every request, which on a new
// lambda plus Atlas SRV/TLS handshake is the main reason admin pages felt
// slow after a few seconds idle.
let cached = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (cached) return cached;
  const uri = resolveMongoUri();
  if (!uri) {
    throw new Error(
      'No database URI configured. Set MONGO_URI or MONGODB_URI in server/.env (see server/.env.example).'
    );
  }
  mongoose.set('strictQuery', true);
  cached = mongoose.connect(uri).catch((err) => { cached = null; throw err; });
  await cached;
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
