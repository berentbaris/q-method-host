CREATE TABLE IF NOT EXISTS studies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  statements TEXT NOT NULL,
  pyramid_config TEXT NOT NULL,
  organizer_emails TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  study_id TEXT NOT NULL REFERENCES studies(id),
  participant_name TEXT NOT NULL DEFAULT 'Anonymous',
  sort_result TEXT NOT NULL,
  explanations TEXT NOT NULL DEFAULT '{}',
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_responses_study ON responses(study_id);

CREATE TABLE IF NOT EXISTS submission_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
