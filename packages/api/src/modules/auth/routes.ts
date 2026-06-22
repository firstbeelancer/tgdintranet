import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { verifyPassword } from '../../lib/password.js';
import { signAccessToken } from '../../lib/jwt.js';
import { requireAuth } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, body.email.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      throw new HttpError(401, 'invalid_credentials', 'Invalid email or password');
    }
    const u = user[0];
    if (!u.isActive) {
      throw new HttpError(403, 'user_disabled', 'User account is disabled');
    }
    const ok = await verifyPassword(u.passwordHash, body.password);
    if (!ok) {
      throw new HttpError(401, 'invalid_credentials', 'Invalid email or password');
    }

    const token = signAccessToken({
      sub: u.id,
      email: u.email,
      role: u.role,
      name: u.displayName,
    });

    res.json({
      token,
      user: {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        position: u.position,
        department: u.department,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'unauthorized', 'No user');
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, req.user.sub))
      .limit(1);
    if (user.length === 0) {
      throw new HttpError(404, 'user_not_found', 'User not found');
    }
    const u = user[0];
    res.json({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      position: u.position,
      department: u.department,
      phone: u.phone,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
