import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/v1/user_roles?user_id=eq.X
router.get('/', async (req, res, next) => {
  try {
    const userId = (req.query.user_id as string | undefined)?.replace(/^eq\./, '');
    if (userId) {
      const rows = await db.select().from(schema.userRoles).where(eq(schema.userRoles.userId, userId));
      res.json(rows);
    } else {
      res.json([]);
    }
  } catch (err) { next(err); }
});

export default router;
