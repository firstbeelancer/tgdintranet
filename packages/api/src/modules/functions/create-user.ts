import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { hashPassword } from '../../lib/password.js';
import { requireRole } from '../../middleware/auth.js';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(1),
  role: z.enum(['admin', 'marketer', 'user']).default('user'),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  birthday: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  children: z.array(z.object({
    birthday: z.string(),
    gender: z.enum(['male', 'female']),
    name: z.string().optional(),
  })).default([]),
});

// POST /api/functions/v1/create-user
router.post('/v1/create-user', requireRole('admin'), async (req, res, next) => {
  try {
    const body = createUserSchema.parse(req.body);
    const email = body.email.toLowerCase();
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const passwordHash = await hashPassword(body.password);
    const [newUser] = await db.insert(schema.users).values({
      email,
      passwordHash,
      displayName: body.display_name,
      role: body.role,
      position: body.position ?? null,
      department: body.department ?? null,
      phone: body.phone ?? null,
      birthday: body.birthday ?? null,
    }).returning();

    // Create profile
    await db.insert(schema.profiles).values({
      userId: newUser.id,
      displayName: body.display_name,
      email,
      position: body.position ?? null,
      department: body.department ?? null,
      phone: body.phone ?? null,
      birthday: body.birthday ?? null,
    }).onConflictDoNothing();

    // Insert user_role row
    await db.insert(schema.userRoles).values({
      userId: newUser.id,
      role: body.role,
    });

    // Insert children (link to employee if exists)
    if (body.children.length > 0) {
      const employee = await db.select().from(schema.employees).where(eq(schema.employees.userId, newUser.id)).limit(1);
      if (employee.length > 0) {
        await db.insert(schema.employeeChildren).values(
          body.children.map((c) => ({
            employeeId: employee[0].id,
            name: c.name ?? null,
            birthday: c.birthday,
            gender: c.gender,
          })),
        );
      }
    }

    res.json({ success: true, user_id: newUser.id });
  } catch (err) { next(err); }
});

export default router;
