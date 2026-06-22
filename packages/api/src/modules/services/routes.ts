import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { canViewContent } from '../../lib/rbac.js';
import { HttpError } from '../../middleware/error.js';

const router = Router();

router.use(requireAuth);

// GET /api/v1/services — список сервисов, видимых роли пользователя
router.get('/', async (req, res, next) => {
  try {
    const userRole = req.user!.role;
    const rows = await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.isActive, true))
      .orderBy(schema.services.displayOrder);

    const visible = rows.filter((s) => canViewContent(userRole, s.visibleTo));
    res.json(visible);
  } catch (err) {
    next(err);
  }
});

const upsertSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url(),
  category: z.enum(['marketing', 'hr', 'development', 'documents', 'communication', 'analytics', 'other']).default('other'),
  iconName: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  visibleTo: z.enum(['admin', 'marketer', 'user']).default('user'),
});

// POST /api/v1/services — только admin или marketer
router.post('/', requireRole('marketer'), async (req, res, next) => {
  try {
    const body = upsertSchema.parse(req.body);
    const [created] = await db.insert(schema.services).values(body).returning();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await db
      .delete(schema.services)
      .where(eq(schema.services.id, req.params.id))
      .returning({ id: schema.services.id });
    if (result.length === 0) throw new HttpError(404, 'not_found', 'Service not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
