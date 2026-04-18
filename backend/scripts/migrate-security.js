#!/usr/bin/env node
/**
 * Runs supabase/migrations/002_rls_and_triggers.sql against the database.
 * Uses the DIRECT_URL from backend/.env (non-pooled connection required for DDL).
 *
 * Usage:  node scripts/migrate-security.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sql = fs.readFileSync(
  path.resolve(__dirname, '../../supabase/migrations/002_rls_and_triggers.sql'),
  'utf8'
);

const pool = new Pool({ connectionString: process.env.DIRECT_URL });

(async () => {
  const client = await pool.connect();
  try {
    console.log('Running 002_rls_and_triggers.sql …');
    await client.query(sql);
    console.log('✅  RLS policies and auth trigger applied successfully.');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
