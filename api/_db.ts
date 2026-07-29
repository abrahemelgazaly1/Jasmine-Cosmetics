import mongoose from 'mongoose';
import { env } from './_config';

// Cache the connection promise across warm serverless invocations.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  if (!connection) {
    mongoose.set('strictQuery', true);
    connection = mongoose.connect(env.mongoUri);
  }
  return connection;
}
