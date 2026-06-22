import express from 'express';
import cors from 'cors';
import { getEnv } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './modules/auth/routes.js';
import usersRoutes from './modules/users/routes.js';
import announcementsRoutes from './modules/announcements/routes.js';
import servicesRoutes from './modules/services/routes.js';
import employeesRoutes from './modules/employees/routes.js';
import formsRoutes from './modules/forms/routes.js';
import pagesRoutes from './modules/pages/routes.js';

const env = getEnv();
const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

// Health
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'tgdintranet-api',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/announcements', announcementsRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/forms', formsRoutes);
app.use('/api/v1/pages', pagesRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'tgdintranet-api',
    docs: '/api/v1/health',
    auth: '/api/v1/auth/login',
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`🚀 tgdintranet-api listening on port ${env.PORT} (${env.NODE_ENV})`);
});
