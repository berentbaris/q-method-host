import { Router } from 'express'
import { queryOne, query, execute } from '../db.js'
import { sendResultsEmail } from '../email.js'

const router = Router()

// Simple IP-based rate limiter for response submission (max 20 per hour per IP)
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 20

function checkRateLimit(ip) {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 })
    return true
  }
  record.count++
  return record.count <= RATE_LIMIT_MAX
}

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW) rateLimitMap.delete(ip)
  }
}, 10 * 60 * 1000)

// ---- POST /api/studies/:code/responses — Submit a participant's Q-sort ----

router.post('/:code/responses', async (req, res) => {
  // Rate limit check
  const ip = req.ip || req.connection?.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' })
  }

  try {
    const { code } = req.params
    const { sortResult, explanations } = req.body

    // Verify the study exists
    const study = await queryOne('SELECT * FROM studies WHERE id = $1', [code.toUpperCase()])
    if (!study) {
      return res.status(404).json({ error: 'Study not found' })
    }

    // Validate sortResult — should be an object mapping statement IDs to scores
    if (!sortResult || typeof sortResult !== 'object') {
      return res.status(400).json({ error: 'sortResult is required and must be an object' })
    }

    // With JSONB, pg returns parsed objects already
    const statements = study.statements
    const pyramidConfig = study.pyramid_config

    // Check that every statement has been placed
    const placedIds = Object.keys(sortResult)
    if (placedIds.length !== statements.length) {
      return res.status(400).json({
        error: `Expected ${statements.length} sorted statements, got ${placedIds.length}`,
      })
    }

    // Check that the score distribution matches the pyramid config
    const scoreCounts = {}
    for (const score of Object.values(sortResult)) {
      scoreCounts[score] = (scoreCounts[score] || 0) + 1
    }
    for (const col of pyramidConfig) {
      const actual = scoreCounts[col.score] || 0
      if (actual !== col.slots) {
        return res.status(400).json({
          error: `Score ${col.score} should have ${col.slots} statements, got ${actual}`,
        })
      }
    }

    // Sanitize explanations — truncate overly long values
    const MAX_EXPLANATION_LENGTH = 5000
    const sanitizedExplanations = {}
    if (explanations && typeof explanations === 'object') {
      for (const [key, value] of Object.entries(explanations)) {
        if (typeof value === 'string') {
          sanitizedExplanations[key] = value.slice(0, MAX_EXPLANATION_LENGTH)
        }
      }
    }

    // Insert and get the new row's ID
    const { rows: insertedRows } = await execute(
      `INSERT INTO responses (study_id, sort_result, explanations)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        code.toUpperCase(),
        JSON.stringify(sortResult),
        JSON.stringify(sanitizedExplanations),
      ]
    )

    // Count how many responses this study now has (for the email subject)
    const countRow = await queryOne(
      'SELECT COUNT(*) as count FROM responses WHERE study_id = $1',
      [code.toUpperCase()]
    )
    const responseCount = countRow ? parseInt(countRow.count, 10) : '?'

    // Send email to organizers (non-blocking — don't fail the request if email fails)
    // The email module now handles both parsed objects and JSON strings (JSONB-safe)
    sendResultsEmail(study, {
      sort_result: sortResult,
      explanations: sanitizedExplanations,
      submitted_at: new Date().toISOString(),
    }, responseCount).catch(err => {
      console.error('[email] Error sending results email:', err.message)
    })

    res.status(201).json({
      id: insertedRows[0].id,
      message: 'Response recorded successfully. Thank you!',
    })
  } catch (err) {
    console.error('POST /api/studies/:code/responses error:', err)
    res.status(500).json({ error: 'Failed to save response' })
  }
})

export default router
