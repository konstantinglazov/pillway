import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Singleton PrismaClient for PostgreSQL (Supabase).
 * Prisma 7 uses the "client" engine type for PostgreSQL, which requires a
 * driver adapter. DATABASE_URL is read from the environment.
 * The singleton pattern prevents multiple connection pools during
 * ts-node-dev hot reloads in development.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
  return new PrismaClient({
    adapter,
    log: process.env['NODE_ENV'] === 'production' ? ['error'] : ['warn', 'error'],
  });
}

export const prisma: PrismaClient = global.__prisma ?? createClient();

if (process.env['NODE_ENV'] !== 'production') {
  global.__prisma = prisma;
}
