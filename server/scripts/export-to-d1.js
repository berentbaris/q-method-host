import 'dotenv/config'
import Database from 'better-sqlite3'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const serverDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(process.env.DB_PATH || resolve(serverDir, 'data/qmethod.db'))
const outputPath = resolve(process.argv[2] || resolve(serverDir, 'data/d1-import.sql'))

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

function value(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return sqlString(value)
}

const db = new Database(sourcePath, { readonly: true, fileMustExist: true })
try {
  const studies = db.prepare('SELECT id, title, description, statements, pyramid_config, organizer_emails, created_at FROM studies ORDER BY id').all()
  const responses = db.prepare('SELECT id, study_id, participant_name, sort_result, explanations, submitted_at FROM responses ORDER BY id').all()
  const statements = [
    '-- Polia Q-Method SQLite to Cloudflare D1 data import.',
    '-- Apply only after migrations/0001_initial.sql has been applied to the target D1 database.',
    '-- The file contains study participant data and organizer email addresses; store and delete it securely.',
    `-- Source rows: ${studies.length} studies, ${responses.length} responses.`,
  ]

  for (const study of studies) {
    const columns = ['id', 'title', 'description', 'statements', 'pyramid_config', 'organizer_emails', 'created_at']
    const values = columns.map((column) => value(study[column])).join(', ')
    statements.push(`INSERT INTO studies (${columns.join(', ')}) VALUES (${values}) ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, statements=excluded.statements, pyramid_config=excluded.pyramid_config, organizer_emails=excluded.organizer_emails, created_at=excluded.created_at;`)
  }

  for (const response of responses) {
    const columns = ['id', 'study_id', 'participant_name', 'sort_result', 'explanations', 'submitted_at']
    const values = columns.map((column) => value(response[column])).join(', ')
    statements.push(`INSERT INTO responses (${columns.join(', ')}) VALUES (${values}) ON CONFLICT(id) DO UPDATE SET study_id=excluded.study_id, participant_name=excluded.participant_name, sort_result=excluded.sort_result, explanations=excluded.explanations, submitted_at=excluded.submitted_at;`)
  }

  statements.push(`-- Verify after import: SELECT COUNT(*) FROM studies; SELECT COUNT(*) FROM responses;`)
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${statements.join('\n')}\n`, { encoding: 'utf8', flag: 'wx' })
  console.log(`Exported ${studies.length} studies and ${responses.length} responses.`)
  console.log(`Import file created at: ${outputPath}`)
  console.log('Treat this SQL file as confidential research data and remove it securely after the import is verified.')
} finally {
  db.close()
}
