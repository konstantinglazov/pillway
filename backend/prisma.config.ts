import { defineConfig } from 'prisma/config';
import 'dotenv/config';

/**
 * Prisma 7 configuration — used by the CLI for migrations and db push.
 * DATABASE_URL format: postgresql://user:password@host:5432/dbname
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env['DATABASE_URL'] as string,
  },
});
