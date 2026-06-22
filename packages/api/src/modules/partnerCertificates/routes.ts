import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  vendorName: z.string().min(1),
  legalEntity: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  partnerStatus: z.string().nullable().optional(),
  issuedDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  filePath: z.string().nullable().optional(),
  discount: z.string().nullable().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select().from(schema.partnerCertificates).orderBy(schema.partnerCertificates.vendorName);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const [created] = await db.insert(schema.partnerCertificates).values({
      vendorName: body.vendorName,
      legalEntity: body.legalEntity ?? null,
      tags: body.tags,
      partnerStatus: body.partnerStatus ?? null,
      issuedDate: body.issuedDate ?? null,
      expiryDate: body.expiryDate ?? null,
      filePath: body.filePath ?? null,
      discount: body.discount ?? null,
      createdBy: req.user!.sub,
    } as any).returning();
    res.json([created]);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    await db.delete(schema.partnerCertificates).where(eq(schema.partnerCertificates.id, req.params.id));
    res.json([]);
  } catch (err) { next(err); }
});

const updateSchema = createSchema.partial();
router.patch('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const body = updateSchema.parse(req.body);
    const [updated] = await db.update(schema.partnerCertificates)
      .set({ ...body, updatedAt: new Date() } as any)
      .where(eq(schema.partnerCertificates.id, req.params.id))
      .returning();
    res.json([updated]);
  } catch (err) { next(err); }
});

export default router;
