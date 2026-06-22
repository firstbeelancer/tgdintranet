import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type JwtPayload } from '../lib/jwt.js';
import { roleAtLeast } from '../lib/rbac.js';
import type { UserRole } from '../db/schema.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'No token provided' });
  }
  const token = auth.slice('Bearer '.length);
  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired token' });
  }
  req.user = payload;
  next();
}

export function requireRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
    }
    if (!roleAtLeast(req.user.role, minRole)) {
      return res.status(403).json({
        error: 'forbidden',
        message: `Requires role at least: ${minRole}`,
      });
    }
    next();
  };
}
