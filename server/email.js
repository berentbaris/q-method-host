/*
  Email service for Q-Method platform.

  Uses Nodemailer to send formatted results to organizers.
  Configure via environment variables:
    SMTP_HOST     — e.g. smtp.gmail.com, smtp.resend.com
    SMTP_PORT     — e.g. 587 (TLS) or 465 (SSL)
    SMTP_USER     — your SMTP username or API key
    SMTP_PASS     — your SMTP password or API key
    SMTP_FROM     — sender address, e.g. "Q-Sort <noreply@yourdomain.com>"
    SMTP_SECURE   — "true" for port 465, omit or "false" for STARTTLS

  If SMTP_HOST is not set, emails are logged to console instead of sent.
  This lets the app run in "demo mode" without email config.
*/

import { createTransport } from 'nodemailer'

// Build transporter lazily (only when first email is sent)
let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter

  const host = process.env.SMTP_HOST
  if (!host) return null // No email config — will use console fallback

  _transporter = createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return _transporter
}

const FROM = process.env.SMTP_FROM || 'Q-Sort Platform <noreply@qsort.local>'

// Helper: safely parse JSON — handles both strings and already-parsed objects (for JSONB columns)
function safeParse(val) {
  if (typeof val === 'string') {
    try { return JSON.parse(val) } catch { return val }
  }
  return val
}

// ---- Format a single response into a readable email ----

function formatResultsEmail(study, response) {
  const statements = safeParse(study.statements)
  const pyramidConfig = safeParse(study.pyramid_config)
  const sortResult = safeParse(response.sort_result)
  const explanations = safeParse(response.explanations)

  // Build a lookup: statement id → text
  const stmtMap = {}
  for (const s of statements) {
    stmtMap[s.id] = s.text
  }

  // Group statements by score, sorted from most negative to most positive
  const scores = pyramidConfig.map(c => c.score).sort((a, b) => a - b)
  const byScore = {}
  for (const score of scores) byScore[score] = []
  for (const [stmtId, score] of Object.entries(sortResult)) {
    if (byScore[score]) {
      byScore[score].push(stmtMap[stmtId] || `[Statement ${stmtId}]`)
    }
  }

  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  // ---- Plain text version ----
  let text = `New Q-Sort Response\n`
  text += `Study: ${study.title}\n`
  text += `Study code: ${study.id}\n`
  text += `Submitted: ${response.submitted_at || new Date().toISOString()}\n`
  text += `${'─'.repeat(50)}\n\n`

  text += `SORTED RESULTS\n\n`
  for (const score of scores) {
    const label = score > 0 ? `+${score}` : `${score}`
    text += `  [${label}]\n`
    for (const stmt of byScore[score]) {
      text += `    • ${stmt}\n`
    }
    text += `\n`
  }

  if (explanations.negative || explanations.positive) {
    text += `${'─'.repeat(50)}\n`
    text += `PARTICIPANT EXPLANATIONS\n\n`
    if (explanations.negative) {
      text += `  Why I most disagreed (${minScore}):\n`
      text += `  "${explanations.negative}"\n\n`
    }
    if (explanations.positive) {
      text += `  Why I most agreed (+${maxScore}):\n`
      text += `  "${explanations.positive}"\n\n`
    }
  }

  // ---- HTML version ----
  let html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, 'Segoe UI', sans-serif; color: #2a2a2a; max-width: 640px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .meta { color: #777; font-size: 14px; margin-bottom: 24px; }
  .score-group { margin-bottom: 20px; }
  .score-label {
    display: inline-block;
    font-weight: 700; font-size: 14px;
    padding: 3px 10px; border-radius: 4px;
    margin-bottom: 6px;
  }
  .score-neg { background: #fde8e8; color: #b91c1c; }
  .score-zero { background: #f3f4f6; color: #555; }
  .score-pos { background: #dcfce7; color: #166534; }
  .stmt { font-size: 15px; line-height: 1.5; padding: 4px 0 4px 16px; border-left: 3px solid #e5e7eb; margin: 4px 0; }
  .extreme .stmt { border-left-color: #f59e0b; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 28px 0; }
  .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #444; text-transform: uppercase; letter-spacing: 0.5px; }
  .explanation { background: #fafafa; border-radius: 8px; padding: 16px; margin-bottom: 16px; font-style: italic; line-height: 1.6; }
  .explanation strong { font-style: normal; display: block; margin-bottom: 6px; color: #555; font-size: 13px; }
  .footer { margin-top: 32px; color: #999; font-size: 12px; }
</style>
</head>
<body>
  <h1>New Q-Sort Response</h1>
  <p class="meta">
    Study: <strong>${escapeHtml(study.title)}</strong> &nbsp;·&nbsp;
    Code: ${escapeHtml(study.id)} &nbsp;·&nbsp;
    ${response.submitted_at || new Date().toISOString()}
  </p>

  <div class="section-title">Sorted Results</div>
`

  for (const score of scores) {
    const label = score > 0 ? `+${score}` : `${score}`
    const colorClass = score < 0 ? 'score-neg' : score > 0 ? 'score-pos' : 'score-zero'
    const isExtreme = score === minScore || score === maxScore

    html += `  <div class="score-group${isExtreme ? ' extreme' : ''}">\n`
    html += `    <span class="score-label ${colorClass}">${label}</span>\n`
    for (const stmt of byScore[score]) {
      html += `    <div class="stmt">${escapeHtml(stmt)}</div>\n`
    }
    html += `  </div>\n`
  }

  if (explanations.negative || explanations.positive) {
    html += `  <hr>\n`
    html += `  <div class="section-title">Participant Explanations</div>\n`
    if (explanations.negative) {
      html += `  <div class="explanation">
        <strong>Why I most disagreed (${minScore}):</strong>
        ${escapeHtml(explanations.negative)}
      </div>\n`
    }
    if (explanations.positive) {
      html += `  <div class="explanation">
        <strong>Why I most agreed (+${maxScore}):</strong>
        ${escapeHtml(explanations.positive)}
      </div>\n`
    }
  }

  html += `
  <div class="footer">
    Sent by Q-Sort Platform &nbsp;·&nbsp;
    <a href="#">View all responses</a>
  </div>
</body>
</html>`

  return { text, html }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---- Send results email to all organizers ----

export async function sendResultsEmail(study, response) {
  const organizerEmails = safeParse(study.organizer_emails)
  if (!organizerEmails.length) {
    console.log('[email] No organizer emails configured — skipping')
    return
  }

  const { text, html } = formatResultsEmail(study, response)
  const responseCount = arguments[2] || '?'
  const subject = `New Q-Sort response for "${study.title}" (#${responseCount})`

  const transporter = getTransporter()

  if (!transporter) {
    // Demo mode: log to console instead of sending
    console.log('\n' + '='.repeat(60))
    console.log('[email] SMTP not configured — printing email to console')
    console.log(`[email] To: ${organizerEmails.join(', ')}`)
    console.log(`[email] Subject: ${subject}`)
    console.log('='.repeat(60))
    console.log(text)
    console.log('='.repeat(60) + '\n')
    return
  }

  // Send to each organizer
  const results = []
  for (const email of organizerEmails) {
    try {
      const info = await transporter.sendMail({
        from: FROM,
        to: email,
        subject,
        text,
        html,
      })
      console.log(`[email] Sent to ${email}: ${info.messageId}`)
      results.push({ email, success: true, messageId: info.messageId })
    } catch (err) {
      console.error(`[email] Failed to send to ${email}:`, err.message)
      results.push({ email, success: false, error: err.message })
    }
  }

  return results
}

export default { sendResultsEmail }
