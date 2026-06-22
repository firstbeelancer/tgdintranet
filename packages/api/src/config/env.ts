import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform((v) => parseInt(v, 10)),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().min(64, 'ENCRYPTION_KEY must be 64 hex characters'),
  DOMAIN: z.string().default('localhost'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@intranet.local'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('Admin2026!Demo'),
  SEED_MARKETER_EMAIL: z.string().email().default('marketer@intranet.local'),
  SEED_MARKETER_PASSWORD: z.string().min(8).default('Marketer2026!Demo'),
  SEED_USER_EMAIL: z.string().email().default('user@intranet.local'),
  SEED_USER_PASSWORD: z.string().min(8).default('User2026!Demo'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}
