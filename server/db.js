import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'data', 'qmethod.db')

// Ensure the data directory exists
import { mkdirSync } from 'fs'
mkdirSync(join(__dirname, 'data'), { recursive: true })

const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ---- Schema ----

db.exec(`
  CREATE TABLE IF NOT EXISTS studies (
    id           TEXT PRIMARY KEY,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    statements   TEXT NOT NULL,
    pyramid_config TEXT NOT NULL,
    organizer_emails TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS responses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id     TEXT NOT NULL REFERENCES studies(id),
    sort_result  TEXT NOT NULL,
    explanations TEXT NOT NULL DEFAULT '{}',
    submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_responses_study ON responses(study_id);
`)

export default db
