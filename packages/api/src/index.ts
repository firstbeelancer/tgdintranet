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
import profilesRoutes from './modules/profiles/routes.js';
import userRolesRoutes from './modules/userRoles/routes.js';
import partnerCertificatesRoutes from './modules/partnerCertificates/routes.js';
import successCasesRoutes from './modules/successCases/routes.js';
import mascotModule, { optionsRouter } from './modules/mascotVotes/routes.js';
import createUserEdgeFn from './modules/functions/create-user.js';
import storageRoutes from './modules/storage/routes.js';

const env = getEnv();
const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));

// Health
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tgdintranet-api', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// API v1 — REST
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/announcements', announcementsRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/forms', formsRoutes);
app.use('/api/v1/pages', pagesRoutes);
app.use('/api/v1/profiles', profilesRoutes);
app.use('/api/v1/user_roles', userRolesRoutes);
app.use('/api/v1/partner_certificates', partnerCertificatesRoutes);
app.use('/api/v1/success_cases', successCasesRoutes);
app.use('/api/v1/mascot_votes', mascotModule);
app.use('/api/v1/mascot_options', optionsRouter);

// Edge function replacement (Supabase-style)
app.use('/api/functions', createUserEdgeFn);

// Storage replacement (Supabase-style)
app.use('/api/storage', storageRoutes);

app.get('/', (_req, res) => {
  res.json({ service: 'tgdintranet-api', health: '/api/v1/health' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`🚀 tgdintranet-api listening on port ${env.PORT} (${env.NODE_ENV})`);
});
