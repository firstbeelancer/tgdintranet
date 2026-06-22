import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select({
      user_id: schema.mascotVotes.userId,
      option_id: schema.mascotVotes.optionId,
    }).from(schema.mascotVotes);
    res.json(rows);
  } catch (err) { next(err); }
});

const upsertSchema = z.object({
  user_id: z.string().uuid(),
  option_id: z.string(),
});

router.post('/', async (req, res, next) => {
  try {
    const body = upsertSchema.parse(req.body);
    if (body.user_id !== req.user!.sub) {
      return res.status(403).json({ error: 'forbidden', message: 'Can only vote as yourself' });
    }
    const values = { userId: body.user_id, optionId: body.option_id };
    const existing = await db.select().from(schema.mascotVotes).where(eq(schema.mascotVotes.userId, body.user_id)).limit(1);
    if (existing.length > 0) {
      const [updated] = await db.update(schema.mascotVotes)
        .set({ optionId: body.option_id, updatedAt: new Date() } as any)
        .where(eq(schema.mascotVotes.userId, body.user_id))
        .returning();
      return res.json([updated]);
    }
    const [created] = await db.insert(schema.mascotVotes).values(values as any).returning();
    res.json([created]);
  } catch (err) { next(err); }
});

const optionsRouter = Router();
optionsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select().from(schema.mascotOptions);
    if (rows.length === 0) {
      await db.insert(schema.mascotOptions).values([
        { id: 'ant', name: 'Муравей', imageUrl: '/mascots/ant.png', description: 'Трудолюбивый и командный' },
        { id: 'octopus', name: 'Осьминог', imageUrl: '/mascots/octopus.png', description: 'Адаптивный и многозадачный' },
        { id: 'orca', name: 'Косатка', imageUrl: '/mascots/orca.png', description: 'Мощный и решительный' },
        { id: 'owl', name: 'Сова', imageUrl: '/mascots/owl.png', description: 'Мудрый и внимательный' },
      ] as any);
      const seeded = await db.select().from(schema.mascotOptions);
      return res.json(seeded);
    }
    res.json(rows);
  } catch (err) { next(err); }
});

export { router as default, optionsRouter };
