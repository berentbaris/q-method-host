import { Router } from 'express'
import crypto from 'crypto'
import { queryOne, query, execute } from '../db.js'

const router = Router()

// ---- Helpers ----

// Generate an 8-character alphanumeric study code
function generateCode() {
  // Use uppercase letters + digits, avoiding ambiguous chars (0/O, 1/I/L)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(8)
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

// Ensure the generated code doesn't already exist
async function uniqueCode() {
  let code
  let attempts = 0
  do {
    code = generateCode()
    attempts++
    if (attempts > 100) throw new Error('Failed to generate unique study code')
    const existing = await queryOne('SELECT 1 FROM studies WHERE id = ?', [code])
    if (!existing) return code
  } while (true)
}

// ---- POST /api/studies — Create a new study ----

router.post('/', async (req, res) => {
  try {
    const { title, description, statements, pyramidConfig, organizerEmails } = req.body

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (!Array.isArray(statements) || statements.length < 3) {
      return res.status(400).json({ error: 'At least 3 statements are required' })
    }
    if (!Array.isArray(pyramidConfig) || pyramidConfig.length === 0) {
      return res.status(400).json({ error: 'Pyramid configuration is required' })
    }
    // Validate each column entry
    for (const col of pyramidConfig) {
      if (typeof col.score !== 'number' || !Number.isFinite(col.score)) {
        return res.status(400).json({ error: 'Each pyramid column must have a numeric score' })
      }
      if (!Number.isInteger(col.slots) || col.slots < 1) {
        return res.status(400).json({ error: 'Each pyramid column must have at least 1 slot' })
      }
    }
    if (!Array.isArray(organizerEmails) || organizerEmails.filter(Boolean).length === 0) {
      return res.status(400).json({ error: 'At least one organizer email is required' })
    }

    // Validate that total pyramid slots match statement count
    const totalSlots = pyramidConfig.reduce((sum, col) => sum + col.slots, 0)
    if (totalSlots !== statements.length) {
      return res.status(400).json({
        error: `Pyramid has ${totalSlots} slots but there are ${statements.length} statements — these must match`,
      })
    }

    const code = await uniqueCode()

    await execute(
      `INSERT INTO studies (id, title, description, statements, pyramid_config, organizer_emails)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        code,
        title.trim(),
        (description || '').trim(),
        JSON.stringify(statements),
        JSON.stringify(pyramidConfig),
        JSON.stringify(organizerEmails.filter(Boolean)),
      ]
    )

    res.status(201).json({
      code,
      title: title.trim(),
      message: `Study created. Share this code with participants: ${code}`,
    })
  } catch (err) {
    console.error('POST /api/studies error:', err)
    res.status(500).json({ error: 'Failed to create study' })
  }
})

// ---- GET /api/studies/:code — Fetch study details (for participants) ----

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params

    const row = await queryOne('SELECT * FROM studies WHERE id = ?', [code.toUpperCase()])

    if (!row) {
      return res.status(404).json({ error: 'Study not found. Please check the code and try again.' })
    }

    // SQLite stores JSON as TEXT — parse on read
    res.json({
      code: row.id,
      title: row.title,
      description: row.description,
      statements: JSON.parse(row.statements),
      pyramidConfig: JSON.parse(row.pyramid_config),
      createdAt: row.created_at,
    })
  } catch (err) {
    console.error('GET /api/studies/:code error:', err)
    res.status(500).json({ error: 'Failed to fetch study' })
  }
})

// ---- GET /api/studies/:code/results — Fetch all responses (for organizers) ----

router.get('/:code/results', async (req, res) => {
  try {
    const { code } = req.params

    const study = await queryOne('SELECT * FROM studies WHERE id = ?', [code.toUpperCase()])
    if (!study) {
      return res.status(404).json({ error: 'Study not found' })
    }

    const responses = await query(
      'SELECT * FROM responses WHERE study_id = ? ORDER BY submitted_at ASC',
      [code.toUpperCase()]
    )

    res.json({
      study: {
        code: study.id,
        title: study.title,
        description: study.description,
        statements: JSON.parse(study.statements),
        pyramidConfig: JSON.parse(study.pyramid_config),
      },
      responses: responses.map(r => ({
        id: r.id,
        participantName: r.participant_name || 'Anonymous',
        sortResult: JSON.parse(r.sort_result),
        explanations: JSON.parse(r.explanations),
        submittedAt: r.submitted_at,
      })),
      totalResponses: responses.length,
    })
  } catch (err) {
    console.error('GET /api/studies/:code/results error:', err)
    res.status(500).json({ error: 'Failed to fetch results' })
  }
})

export default router
