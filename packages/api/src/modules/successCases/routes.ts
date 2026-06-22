import { Router } from 'express';
import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  client: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select().from(schema.successCases).orderBy(desc(schema.successCases.createdAt));
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', requireRole('marketer'), async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const [created] = await db.insert(schema.successCases).values({
      ...body,
      createdBy: req.user!.sub,
    }).returning();
    res.json([created]);
  } catch (err) { next(err); }
});

export default router;
