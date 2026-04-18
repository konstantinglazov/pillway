import { defineConfig } from 'prisma/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

/**
 * Prisma 7 configuration file — used by the Prisma CLI for migrations and
 * `db push`.  The runtime PrismaClient gets its connection through the driver
 * adapter in src/config/prisma.ts.
 *
 * DIRECT_URL must be the non-pooled connection string (Session mode or direct).
 * Supabase's PgBouncer (transaction pooler) does not support the extended
 * query protocol that Prisma Migrate requires.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Required by `db push`, `db pull`, and introspection commands.
  datasource: {
    url: process.env['DIRECT_URL'] as string,
  },
  migrate: {
    async adapter() {
      const pool = new Pool({
        connectionString: process.env['DIRECT_URL'],
      });
      return new PrismaPg(pool);
    },
  },
});
