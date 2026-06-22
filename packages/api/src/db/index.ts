import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import { getEnv } from '../config/env.js';

const env = getEnv();

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  console.error('Unexpected pg pool error', err);
});

export const db = drizzle(pool, { schema });
export { schema };
