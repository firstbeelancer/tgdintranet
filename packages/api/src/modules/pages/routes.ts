import { Router } from 'express';
import { asc } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select().from(schema.knowledgePages).orderBy(asc(schema.knowledgePages.title));
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
