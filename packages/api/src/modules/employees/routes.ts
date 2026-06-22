import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/v1/employees — все сотрудники
router.get('/', async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.isActive, true))
      .orderBy(schema.employees.department, schema.employees.fullName);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/employees/:id/children — дети сотрудника
router.get('/:id/children', async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(schema.employeeChildren)
      .where(eq(schema.employeeChildren.employeeId, req.params.id));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
