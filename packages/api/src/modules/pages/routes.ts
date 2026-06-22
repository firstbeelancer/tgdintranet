import { Router } from 'express';
import { eq, asc } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { canViewContent } from '../../lib/rbac.js';
import { HttpError } from '../../middleware/error.js';

const router = Router();

router.use(requireAuth);

// GET /api/v1/pages — список страниц базы знаний
router.get('/', async (req, res, next) => {
  try {
    const userRole = req.user!.role;
    const rows = await db
      .select({
        id: schema.knowledgePages.id,
        slug: schema.knowledgePages.slug,
        title: schema.knowledgePages.title,
        summary: schema.knowledgePages.summary,
        category: schema.knowledgePages.category,
        visibleTo: schema.knowledgePages.visibleTo,
        updatedAt: schema.knowledgePages.updatedAt,
      })
      .from(schema.knowledgePages)
      .orderBy(asc(schema.knowledgePages.category), asc(schema.knowledgePages.title));
    const visible = rows.filter((p) => canViewContent(userRole, p.visibleTo));
    res.json(visible);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/pages/:slug — одна страница
router.get('/:slug', async (req, res, next) => {
  try {
    const userRole = req.user!.role;
    const rows = await db
      .select()
      .from(schema.knowledgePages)
      .where(eq(schema.knowledgePages.slug, req.params.slug))
      .limit(1);
    if (rows.length === 0) throw new HttpError(404, 'not_found', 'Page not found');
    const page = rows[0];
    if (!canViewContent(userRole, page.visibleTo)) {
      throw new HttpError(403, 'forbidden', 'No access to this page');
    }
    res.json(page);
  } catch (err) {
    next(err);
  }
});

export default router;
