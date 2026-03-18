import { Router } from 'express'
import db from '../db.js'
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

router.post('/:code/responses', (req, res) => {
  // Rate limit check
  const ip = req.ip || req.connection?.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' })
  }

  try {
    const { code } = req.params
    const { sortResult, explanations } = req.body

    // Verify the study exists
    const study = db.prepare('SELECT * FROM studies WHERE id = ?').get(code.toUpperCase())
    if (!study) {
      return res.status(404).json({ error: 'Study not found' })
    }

    // Validate sortResult — should be an object mapping statement IDs to scores
    if (!sortResult || typeof sortResult !== 'object') {
      return res.status(400).json({ error: 'sortResult is required and must be an object' })
    }

    const statements = JSON.parse(study.statements)
    const pyramidConfig = JSON.parse(study.pyramid_config)

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

    const insert = db.prepare(`
      INSERT INTO responses (study_id, sort_result, explanations)
      VALUES (?, ?, ?)
    `)

    const result = insert.run(
      code.toUpperCase(),
      JSON.stringify(sortResult),
      JSON.stringify(sanitizedExplanations),
    )

    // Count how many responses this study now has (for the email subject)
    const responseCount = db.prepare(
      'SELECT COUNT(*) as count FROM responses WHERE study_id = ?'
    ).get(code.toUpperCase()).count

    // Send email to organizers (non-blocking — don't fail the request if email fails)
    sendResultsEmail(study, {
      sort_result: JSON.stringify(sortResult),
      explanations: JSON.stringify(sanitizedExplanations),
      submitted_at: new Date().toISOString(),
    }, responseCount).catch(err => {
      console.error('[email] Error sending results email:', err.message)
    })

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Response recorded successfully. Thank you!',
    })
  } catch (err) {
    console.error('POST /api/studies/:code/responses error:', err)
    res.status(500).json({ error: 'Failed to save response' })
  }
})

export default router
