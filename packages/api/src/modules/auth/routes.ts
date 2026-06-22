import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { verifyPassword } from '../../lib/password.js';
import { signAccessToken } from '../../lib/jwt.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await db.select().from(schema.users).where(eq(schema.users.email, body.email.toLowerCase())).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password' });
    }
    const u = user[0];
    if (!u.isActive) {
      return res.status(403).json({ error: 'user_disabled', message: 'User account is disabled' });
    }
    const ok = await verifyPassword(u.passwordHash, body.password);
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password' });
    }
    const token = signAccessToken({ sub: u.id, email: u.email, role: u.role, name: u.displayName });
    res.json({
      token,
      user: {
        id: u.id, email: u.email, displayName: u.displayName, role: u.role,
        position: u.position, department: u.department,
      },
    });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    const u = await db.select().from(schema.users).where(eq(schema.users.id, req.user.sub)).limit(1);
    if (u.length === 0) return res.status(404).json({ error: 'user_not_found' });
    res.json({
      id: u[0].id, email: u[0].email, displayName: u[0].displayName, role: u[0].role,
      position: u[0].position, department: u[0].department, phone: u[0].phone,
    });
  } catch (err) { next(err); }
});

export default router;
