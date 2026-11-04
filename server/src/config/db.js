import mongoose from 'mongoose';

function resolveMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  return null;
}

export async function connectDB() {
  const uri = resolveMongoUri();
  if (!uri) {
    throw new Error(
      'No database URI configured. Set MONGO_URI or MONGODB_URI in server/.env (see server/.env.example).'
    );
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
