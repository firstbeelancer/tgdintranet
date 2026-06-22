import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';
import { roleAtLeast } from '../lib/rbac.js';
import type { UserRole } from '../db/schema.js';

const env = getEnv();

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};

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
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    if (!decoded || typeof decoded !== 'object') {
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid token' });
    }
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired token' });
  }
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
