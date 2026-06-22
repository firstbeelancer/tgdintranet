import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { hashPassword } from '../../lib/password.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select({
      id: schema.users.id, email: schema.users.email, displayName: schema.users.displayName,
      role: schema.users.role, position: schema.users.position, department: schema.users.department,
      isActive: schema.users.isActive, createdAt: schema.users.createdAt,
    }).from(schema.users).orderBy(schema.users.createdAt);
    res.json(rows);
  } catch (err) { next(err); }
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
  role: z.enum(['admin', 'marketer', 'user']).default('user'),
  position: z.string().optional(),
  department: z.string().optional(),
});

router.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, body.email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'email_exists', message: 'Email already exists' });
    }
    const passwordHash = await hashPassword(body.password);
    const [created] = await db.insert(schema.users).values({
      email: body.email.toLowerCase(), passwordHash, displayName: body.displayName,
      role: body.role, position: body.position, department: body.department,
    }).returning();
    await db.insert(schema.profiles).values({
      userId: created.id, displayName: body.displayName, email: body.email.toLowerCase(),
    }).onConflictDoNothing();
    await db.insert(schema.userRoles).values({ userId: created.id, role: body.role });
    res.status(201).json({
      id: created.id, email: created.email, displayName: created.displayName, role: created.role,
      position: created.position, department: created.department, isActive: created.isActive,
    });
  } catch (err) { next(err); }
});

export default router;
