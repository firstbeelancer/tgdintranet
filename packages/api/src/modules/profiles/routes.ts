import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/v1/profiles?user_id=eq.X
router.get('/', async (req, res, next) => {
  try {
    const userId = (req.query.user_id as string | undefined)?.replace(/^eq\./, '') ||
                   (req.query['user_id'] as string | undefined);
    if (userId) {
      const rows = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId));
      res.json(rows);
    } else {
      const rows = await db.select().from(schema.profiles);
      res.json(rows);
    }
  } catch (err) { next(err); }
});

const upsertSchema = z.object({
  user_id: z.string().uuid(),
  display_name: z.string().optional(),
  email: z.string().optional(),
  avatar_url: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  birthday: z.string().optional(),
});

// POST /api/v1/profiles  — upsert by user_id
router.post('/', async (req, res, next) => {
  try {
    const body = upsertSchema.parse(req.body);
    const values = {
      userId: body.user_id,
      displayName: body.display_name,
      email: body.email,
      avatarUrl: body.avatar_url,
      position: body.position,
      department: body.department,
      phone: body.phone,
      birthday: body.birthday,
    };
    const existing = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, body.user_id)).limit(1);
    if (existing.length > 0) {
      const [updated] = await db.update(schema.profiles)
        .set({ ...values, updatedAt: new Date() } as any)
        .where(eq(schema.profiles.userId, body.user_id))
        .returning();
      return res.json([updated]);
    }
    const [created] = await db.insert(schema.profiles).values(values as any).returning();
    res.json([created]);
  } catch (err) { next(err); }
});

export default router;
