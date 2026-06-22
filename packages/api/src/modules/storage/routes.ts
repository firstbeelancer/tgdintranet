import { Router } from 'express';

const router = Router();

// Supabase storage API mock
// UI вызывает supabase.storage.from('certificates').getPublicUrl(path) и т.п.
// В прототипе файлы не хранятся — UI покажет placeholder, в проде подключим S3.

router.get('/v1/object/:bucket/*path', (req, res) => {
  const path = (req.params as any).path || '';
  res.json({
    publicUrl: `/api/storage/v1/object/${req.params.bucket}/${path}`,
  });
});

router.post('/v1/object/:bucket/*path', (req, res) => {
  const path = (req.params as any).path || '';
  res.json({ Key: path });
});

router.delete('/v1/object/:bucket/*path', (_req, res) => {
  res.json([]);
});

export default router;
