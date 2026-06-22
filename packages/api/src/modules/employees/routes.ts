import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/v1/employees — все активные сотрудники
router.get('/', async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.isActive, true))
      .orderBy(schema.employees.department, schema.employees.fullName);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/v1/employee_children — все дети сотрудников
// (UI вызывает supabase.from('employee_children').select('*').order('birthday')
// и использует user_id — это employee.user_id, не employee.id)
router.get('/children', async (_req, res, next) => {
  try {
    const rows = await db
      .select({
        id: schema.employeeChildren.id,
        name: schema.employeeChildren.name,
        birthday: schema.employeeChildren.birthday,
        gender: schema.employeeChildren.gender,
        user_id: schema.employeeChildren.employeeId, // map employee_id -> user_id for UI
        created_at: schema.employeeChildren.createdAt,
      })
      .from(schema.employeeChildren)
      .orderBy(schema.employeeChildren.birthday);
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
