import { Router } from 'express';
import { z } from 'zod';
import { desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { roleAtLeast } from '../../lib/rbac.js';
import { HttpError } from '../../middleware/error.js';

const router = Router();

router.use(requireAuth);

// GET /api/v1/announcements — список объявлений, видимых текущей ролью
router.get('/', async (req, res, next) => {
  try {
    const userRole = req.user!.role;
    const rows = await db
      .select({
        id: schema.announcements.id,
        title: schema.announcements.title,
        body: schema.announcements.body,
        audience: schema.announcements.audience,
        isPinned: schema.announcements.isPinned,
        publishedAt: schema.announcements.publishedAt,
      })
      .from(schema.announcements)
      .orderBy(desc(schema.announcements.isPinned), desc(schema.announcements.publishedAt));

    const visible = rows.filter((r) => roleAtLeast(userRole, r.audience));
    res.json(visible);
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  audience: z.enum(['admin', 'marketer', 'user']).default('user'),
  isPinned: z.boolean().default(false),
});

// POST /api/v1/announcements — только admin или marketer
router.post('/', requireRole('marketer'), async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const [created] = await db
      .insert(schema.announcements)
      .values({
        title: body.title,
        body: body.body,
        audience: body.audience,
        isPinned: body.isPinned,
        createdBy: req.user!.sub,
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await db
      .delete(schema.announcements)
      .where(eq(schema.announcements.id, req.params.id))
      .returning({ id: schema.announcements.id });
    if (result.length === 0) throw new HttpError(404, 'not_found', 'Announcement not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
