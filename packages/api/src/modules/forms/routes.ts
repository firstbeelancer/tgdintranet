import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { canViewContent } from '../../lib/rbac.js';

const router = Router();

router.use(requireAuth);

// GET /api/v1/forms — список шаблонов, видимых роли пользователя
router.get('/', async (req, res, next) => {
  try {
    const userRole = req.user!.role;
    const rows = await db
      .select()
      .from(schema.forms)
      .where(eq(schema.forms.isActive, true))
      .orderBy(schema.forms.category, schema.forms.title);
    const visible = rows.filter((f) => canViewContent(userRole, f.visibleTo));
    res.json(visible);
  } catch (err) {
    next(err);
  }
});

export default router;
