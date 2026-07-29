import express from 'express';
import cors from 'cors';
import { connectDB } from './_db';
import { notFound, errorHandler } from './_middleware';
import authRoutes from './_auth.routes';
import productRoutes from './_products.routes';
import categoryRoutes from './_categories.routes';
import orderRoutes from './_orders.routes';
import userRoutes from './_users.routes';

// Single serverless function that handles every /api/* request on Vercel.
const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' })); // base64 images

// Ensure the database is connected before handling any route.
app.use((_req, res, next) => {
  connectDB()
    .then(() => next())
    .catch((err) => {
      console.error('Database connection failed', err);
      res.status(500).json({
        message: 'Database connection failed',
        detail: err instanceof Error ? err.message : String(err),
      });
    });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
