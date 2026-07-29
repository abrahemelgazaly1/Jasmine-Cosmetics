import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './config.js';

export async function connectDB(): Promise<void> {
  // Some networks refuse SRV DNS queries; use public resolvers for mongodb+srv URIs.
  if (env.mongoUri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
}
