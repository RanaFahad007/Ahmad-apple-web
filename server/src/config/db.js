import mongoose from 'mongoose';

function resolveMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  return null;
}

// Cache the connection promise globally so it is reused across warm
// serverless invocations (a module-level variable can be re-created when a
// function instance is recycled; globalThis survives that).
if (!globalThis.__appleAhmadMongo) globalThis.__appleAhmadMongo = { cached: null };

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  const cached = globalThis.__appleAhmadMongo.cached;
  if (cached) return cached;
  const uri = resolveMongoUri();
  if (!uri) {
    throw new Error(
      'No database URI configured. Set MONGO_URI or MONGODB_URI in server/.env (see server/.env.example).'
    );
  }
  mongoose.set('strictQuery', true);
  globalThis.__appleAhmadMongo.cached = mongoose.connect(uri).catch((err) => { globalThis.__appleAhmadMongo.cached = null; throw err; });
  await globalThis.__appleAhmadMongo.cached;
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
