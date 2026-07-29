import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from './_config';

export interface AuthPayload {
  id: string;
  role: 'customer' | 'admin';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function auth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  try {
    req.user = jwt.verify(header.slice(7), env.jwtSecret) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), env.jwtSecret) as AuthPayload;
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const message = err instanceof Error ? err.message : 'Server error';
  console.error(err);
  res.status(500).json({ message });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
