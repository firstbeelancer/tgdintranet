import { Router } from 'express';
import { desc } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { roleAtLeast } from '../../lib/rbac.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userRole = req.user!.role;
    const rows = await db.select().from(schema.announcements).orderBy(desc(schema.announcements.isPinned), desc(schema.announcements.publishedAt));
    // We don't have audience column in announcements, return all for now
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
