import express from 'express';
import cors from 'cors';
import { env } from './config.js';
import { connectDB } from './db.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '15mb' })); // base64 images

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(env.port, () => console.log(`Server running on http://localhost:${env.port}`));
  })
  .catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
  });
