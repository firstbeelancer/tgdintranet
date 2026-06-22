import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';
import type { UserRole } from '../db/schema.js';

const env = getEnv();

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '12h' });
}
