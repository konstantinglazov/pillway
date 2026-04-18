import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Singleton PrismaClient using the @prisma/adapter-pg driver adapter.
 *
 * Prisma 7 removed built-in connection handling — the caller owns the
 * connection pool and passes it via an adapter.  A single Pool instance is
 * shared for the lifetime of the process so connections are reused.
 *
 * DATABASE_URL may be the pooled (PgBouncer) URL — the adapter works with
 * both pooled and direct connections at runtime.
 */

declare global {
  // Survives ts-node-dev hot-reloads in development.
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env['NODE_ENV'] === 'production' ? ['error'] : ['query', 'warn', 'error'],
  });
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  global.__prisma = prisma;
}
