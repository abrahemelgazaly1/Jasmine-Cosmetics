import mongoose from 'mongoose';
import { env } from './_config';

// Cache the connection promise across warm serverless invocations.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  if (!env.mongoUri) {
    return Promise.reject(new Error('MONGO_URI environment variable is not set'));
  }
  if (!connection) {
    mongoose.set('strictQuery', true);
    // Don't cache a rejected connection, so the next request can retry.
    connection = mongoose.connect(env.mongoUri).catch((err) => {
      connection = null;
      throw err;
    });
  }
  return connection;
}
