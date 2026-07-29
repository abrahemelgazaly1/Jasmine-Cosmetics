import type { Request, Response, NextFunction } from 'express';

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
