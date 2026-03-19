/*
  Database module for Q-Method platform.

  Uses PostgreSQL via the `pg` library with connection pooling.
  Configure via environment variable:
    DATABASE_URL — full connection string, e.g.
      postgres://user:pass@host:5432/dbname

  The pool is configured for modest concurrency (suitable for free-tier
  hosted Postgres like Render, Supabase, or Neon).
*/

import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render's free Postgres requires SSL in production
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Log connection errors (but don't crash — queries will fail individually)
pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message)
})

// ---- Schema initialisation ----

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS studies (
    id               TEXT PRIMARY KEY,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    statements       JSONB NOT NULL,
    pyramid_config   JSONB NOT NULL,
    organizer_emails JSONB NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS responses (
    id           SERIAL PRIMARY KEY,
    study_id     TEXT NOT NULL REFERENCES studies(id),
    sort_result  JSONB NOT NULL,
    explanations JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_responses_study ON responses(study_id);
`

// Run schema migration on startup — called from index.js before listening
export async function initDatabase() {
  try {
    await pool.query(SCHEMA_SQL)
    console.log('[db] Schema initialised')
  } catch (err) {
    console.error('[db] Schema initialisation failed:', err.message)
    throw err
  }
}

// ---- Query helpers ----

// Run a parameterised query, return all rows
export async function query(text, params) {
  const result = await pool.query(text, params)
  return result.rows
}

// Run a parameterised query, return first row or null
export async function queryOne(text, params) {
  const result = await pool.query(text, params)
  return result.rows[0] || null
}

// Run an INSERT / UPDATE / DELETE and return rows (use with RETURNING)
export async function execute(text, params) {
  const result = await pool.query(text, params)
  return { rows: result.rows, rowCount: result.rowCount }
}

// Graceful shutdown helper
export async function closePool() {
  await pool.end()
}

export default { initDatabase, query, queryOne, execute, closePool }
