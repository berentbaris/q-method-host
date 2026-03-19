/*
  Database module for Q-Method platform.

  Uses SQLite via `better-sqlite3` — a single file stored at ./data/qmethod.db.
  The data directory is created automatically on startup.
  On Render, mount a persistent disk at /opt/render/project/src/server/data
  so the database survives deploys.
*/

import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DB_PATH
  ? dirname(process.env.DB_PATH)
  : join(__dirname, 'data')
const DB_FILE = process.env.DB_PATH || join(DATA_DIR, 'qmethod.db')

// Ensure data directory exists
mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(DB_FILE)

// Performance tuning
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ---- Schema initialisation ----

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS studies (
    id               TEXT PRIMARY KEY,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    statements       TEXT NOT NULL,
    pyramid_config   TEXT NOT NULL,
    organizer_emails TEXT NOT NULL,
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS responses (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id         TEXT NOT NULL REFERENCES studies(id),
    participant_name TEXT NOT NULL DEFAULT 'Anonymous',
    sort_result      TEXT NOT NULL,
    explanations     TEXT NOT NULL DEFAULT '{}',
    submitted_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_responses_study ON responses(study_id);
`

// Run schema migration on startup — called from index.js before listening
export function initDatabase() {
  try {
    db.exec(SCHEMA_SQL)
    console.log('[db] Schema initialised (SQLite)')
    console.log(`[db] Database file: ${DB_FILE}`)
  } catch (err) {
    console.error('[db] Schema initialisation failed:', err.message)
    throw err
  }
}

// ---- Query helpers ----
// These mimic the async interface from the pg version so routes need minimal changes.

// Run a query, return all rows
export async function query(sql, params = []) {
  return db.prepare(sql).all(...params)
}

// Run a query, return first row or null
export async function queryOne(sql, params = []) {
  return db.prepare(sql).get(...params) || null
}

// Run an INSERT / UPDATE / DELETE — returns { rows, rowCount, lastInsertRowid }
export async function execute(sql, params = []) {
  const stmt = db.prepare(sql)
  const info = stmt.run(...params)
  return {
    rows: [{ id: info.lastInsertRowid }],
    rowCount: info.changes,
    lastInsertRowid: info.lastInsertRowid,
  }
}

// Graceful shutdown helper
export async function closePool() {
  db.close()
}

export default { initDatabase, query, queryOne, execute, closePool }
