import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { hashPassword } from '../../lib/password.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

// GET /api/v1/users — список всех пользователей
router.get('/', async (_req, res, next) => {
  try {
    const rows = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        displayName: schema.users.displayName,
        role: schema.users.role,
        position: schema.users.position,
        department: schema.users.department,
        isActive: schema.users.isActive,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .orderBy(schema.users.createdAt);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
  role: z.enum(['admin', 'marketer', 'user']).default('user'),
  position: z.string().optional(),
  department: z.string().optional(),
});

// POST /api/v1/users — создать пользователя
router.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, body.email.toLowerCase()))
      .limit(1);
    if (existing.length > 0) {
      throw new HttpError(409, 'email_exists', 'User with this email already exists');
    }
    const passwordHash = await hashPassword(body.password);
    const [created] = await db
      .insert(schema.users)
      .values({
        email: body.email.toLowerCase(),
        passwordHash,
        displayName: body.displayName,
        role: body.role,
        position: body.position,
        department: body.department,
      })
      .returning();
    res.status(201).json({
      id: created.id,
      email: created.email,
      displayName: created.displayName,
      role: created.role,
      position: created.position,
      department: created.department,
      isActive: created.isActive,
    });
  } catch (err) {
    next(err);
  }
});

const patchSchema = z.object({
  displayName: z.string().min(1).optional(),
  role: z.enum(['admin', 'marketer', 'user']).optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/v1/users/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const body = patchSchema.parse(req.body);
    const [updated] = await db
      .update(schema.users)
      .set(body)
      .where(eq(schema.users.id, req.params.id))
      .returning();
    if (!updated) throw new HttpError(404, 'user_not_found', 'User not found');
    res.json({
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      role: updated.role,
      position: updated.position,
      department: updated.department,
      isActive: updated.isActive,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
