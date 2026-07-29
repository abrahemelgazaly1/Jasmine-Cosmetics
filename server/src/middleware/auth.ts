import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import type { Request, Response, NextFunction } from 'express';

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
