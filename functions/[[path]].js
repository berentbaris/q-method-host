import { ABOUT_SCHEMA } from '../server/aboutMetadata.js'

const encoder = new TextEncoder()
const MAX_BODY_BYTES = 1024 * 1024
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
let requestCount = 0

const PAGE_METADATA = {
  '/': {
    title: 'Q-Method — Free Online Q-Methodology Tool for Researchers',
    description: 'Create and run Q-studies online for free. No accounts, no installs, no fees.',
  },
  '/about': {
    title: 'About Q-Method — Maintainer, Data Handling & Research Citation',
    description: 'Meet Q-Method maintainer Berent Tevfik Barış, learn how study data is handled, cite the tool, and review the implemented analysis methods and limitations.',
  },
  '/about/': {
    title: 'About Q-Method — Maintainer, Data Handling & Research Citation',
    description: 'Meet Q-Method maintainer Berent Tevfik Barış, learn how study data is handled, cite the tool, and review the implemented analysis methods and limitations.',
  },
  '/q-methodology-tool': {
    title: 'Free Q-Methodology Tool — Online Q-Sort Platform for Researchers',
    description: 'Create and run Q-sort studies online for free. No installs, no accounts, no fees. Includes drag-and-drop sorting, customizable pyramids, email results, and built-in factor analysis.',
  },
  '/online-q-sort-tool': {
    title: 'Online Q-Sort Tool — Free Browser-Based Q-Sort for Researchers',
    description: 'Run Q-sorts online with a free drag-and-drop tool. Three-stage participant flow: triage, pyramid sort, and explanations. Works on mobile. No download needed.',
  },
  '/q-methodology-explained': {
    title: 'Q-Methodology Explained — What Is Q-Method and How Does It Work?',
    description: 'A practical guide to Q-methodology for researchers. Learn what Q-method is, when to use it, how Q-sorts work, how it differs from surveys, and common pitfalls to avoid.',
  },
  '/q-method-analysis-guide': {
    title: 'Q-Method Analysis Guide — Factor Analysis for Q-Sort Data',
    description: 'Step-by-step guide to Q-method factor analysis: correlation matrices, PCA extraction, varimax rotation, flagging, factor scores, and interpretation. Practical advice for researchers.',
  },
}

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*', ...headers },
  })
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyPageMetadata(html, pathname, canonicalOrigin) {
  const metadata = PAGE_METADATA[pathname]
  if (!metadata) return html

  const canonical = `${canonicalOrigin}${pathname === '/' ? '/' : pathname}`
  let result = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(metadata.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(metadata.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(metadata.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, `$1${canonical}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(metadata.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(metadata.description)}$2`)

  if (pathname === '/about' || pathname === '/about/') {
    result = result.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    result = result.replace('</head>', `<script id="about-schema" type="application/ld+json">${JSON.stringify(ABOUT_SCHEMA)}</script>\n  </head>`)
  }
  return result
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) return { error: 'Request body is too large (max 1 MB)' }
  const text = await request.text()
  if (encoder.encode(text).byteLength > MAX_BODY_BYTES) return { error: 'Request body is too large (max 1 MB)' }
  try {
    return { value: text ? JSON.parse(text) : {} }
  } catch {
    return { error: 'Invalid JSON in request body' }
  }
}

function randomStudyCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return [...bytes].map((byte) => chars[byte % chars.length]).join('')
}

async function rateLimitKey(ip, salt = '') {
  const bytes = encoder.encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function allowSubmission(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local-development'
  const key = await rateLimitKey(ip, env.RATE_LIMIT_SALT || '')
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const row = await env.DB.prepare(`
    INSERT INTO submission_rate_limits (ip_hash, window_start, count)
    VALUES (?, ?, 1)
    ON CONFLICT(ip_hash) DO UPDATE SET
      count = CASE
        WHEN submission_rate_limits.window_start <= ? THEN 1
        ELSE submission_rate_limits.count + 1
      END,
      window_start = CASE
        WHEN submission_rate_limits.window_start <= ? THEN excluded.window_start
        ELSE submission_rate_limits.window_start
      END
    RETURNING count, window_start
  `).bind(key, now, cutoff, cutoff).first()

  requestCount += 1
  if (requestCount % 100 === 0) {
    await env.DB.prepare('DELETE FROM submission_rate_limits WHERE window_start <= ?').bind(cutoff).run()
  }

  return row
}

function safeParse(value, fallback) {
  try { return typeof value === 'string' ? JSON.parse(value) : value } catch { return fallback }
}

function sendResultsEmail(study, response, responseCount, env) {
  const recipients = safeParse(study.organizer_emails, [])
  if (!Array.isArray(recipients) || recipients.length === 0) return Promise.resolve()

  const statements = safeParse(study.statements, [])
  const pyramid = safeParse(study.pyramid_config, [])
  const sort = safeParse(response.sort_result, {})
  const explanations = safeParse(response.explanations, {})
  const statementText = new Map(statements.map((statement) => [String(statement.id), statement.text]))
  const scores = pyramid.map((column) => Number(column.score)).sort((a, b) => a - b)
  const grouped = new Map(scores.map((score) => [score, []]))
  for (const [statementId, score] of Object.entries(sort)) {
    if (grouped.has(Number(score))) grouped.get(Number(score)).push(statementText.get(statementId) || `[Statement ${statementId}]`)
  }

  const safeName = escapeHtml(response.participant_name || 'Anonymous')
  const safeTitle = escapeHtml(study.title)
  const resultsUrl = `${(env.BASE_URL || 'https://qmethod.polia.nl').replace(/\/$/, '')}/results/${encodeURIComponent(study.id)}`
  const plainText = [
    'New Q-Sort Response',
    `Participant: ${response.participant_name || 'Anonymous'}`,
    `Study: ${study.title}`,
    `Study code: ${study.id}`,
    `Submitted: ${response.submitted_at}`,
    `View all responses: ${resultsUrl}`,
    '',
    ...scores.flatMap((score) => [`[${score > 0 ? `+${score}` : score}]`, ...(grouped.get(score) || []).map((text) => `  ${text}`), '']),
    ...(explanations.negative || explanations.positive ? ['Participant explanations:', explanations.negative ? `Disagreed most: ${explanations.negative}` : '', explanations.positive ? `Agreed most: ${explanations.positive}` : ''] : []),
  ].filter((line) => line !== undefined).join('\n')
  const rows = scores.map((score) => `<h3>${score > 0 ? `+${score}` : score}</h3>${(grouped.get(score) || []).map((text) => `<p>${escapeHtml(text)}</p>`).join('')}`).join('')
  const html = `<h1>New Q-Sort Response</h1><p>Participant: <strong>${safeName}</strong><br>Study: <strong>${safeTitle}</strong><br>Code: ${escapeHtml(study.id)}<br>${escapeHtml(response.submitted_at)}</p><p><a href="${escapeHtml(resultsUrl)}">View all responses for this study</a></p>${rows}<h2>Participant explanations</h2><p><strong>Most disagreed:</strong> ${escapeHtml(explanations.negative || '—')}</p><p><strong>Most agreed:</strong> ${escapeHtml(explanations.positive || '—')}</p><p><a href="https://buymeacoffee.com/berentbaris">Support development</a></p>`
  const from = env.EMAIL_FROM || env.SMTP_FROM || 'Polia Q-Method <noreply@qmethod.polia.nl>'

  if (!env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY is not configured; skipping email delivery')
    return Promise.resolve()
  }

  return Promise.all(recipients.filter((email) => typeof email === 'string' && email.includes('@')).map(async (to) => {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New Q-Sort response for "${study.title}" from ${response.participant_name || 'Anonymous'} (#${responseCount})`,
        text: plainText,
        html,
      }),
    })
    if (!result.ok) throw new Error(`Resend API returned ${result.status}`)
  }))
}

async function handleApi(request, env, context) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/$/, '') || '/'
  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })

  if (method === 'GET' && path === '/api/health') {
    return json({ status: 'ok', timestamp: new Date().toISOString() }, 200, { 'Access-Control-Allow-Origin': '*' })
  }

  if (method === 'GET' && path === '/api/email-test') {
    if (!env.RESEND_API_KEY) return json({ status: 'no_config', method: 'console', message: 'Set RESEND_API_KEY to enable email delivery.' })
    try {
      const response = await fetch('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` } })
      if (response.ok || (response.status === 401 && (await response.clone().json().catch(() => ({}))).name === 'restricted_api_key')) {
        return json({ status: 'ok', method: 'resend', message: 'Resend API key is valid. Ensure EMAIL_FROM uses a verified domain.' })
      }
      return json({ status: 'error', method: 'resend', error: `Resend API returned ${response.status}` })
    } catch {
      return json({ status: 'error', method: 'resend', error: 'Could not reach Resend API' })
    }
  }

  const studyPath = path.match(/^\/api\/studies(?:\/([^/]+))?(?:\/(results|responses))?$/)
  if (!studyPath) return json({ error: 'Not found' }, 404, { 'Access-Control-Allow-Origin': '*' })

  const code = studyPath[1] ? decodeURIComponent(studyPath[1]).toUpperCase() : null
  const action = studyPath[2] || null

  if (method === 'POST' && !code && !action) {
    const parsed = await readJson(request)
    if (parsed.error) return json({ error: parsed.error }, parsed.error.startsWith('Invalid') ? 400 : 413)
    const { title, description, statements, pyramidConfig, organizerEmails } = parsed.value
    if (!title || typeof title !== 'string' || !title.trim()) return json({ error: 'Title is required' }, 400)
    if (!Array.isArray(statements) || statements.length < 3) return json({ error: 'At least 3 statements are required' }, 400)
    if (!Array.isArray(pyramidConfig) || pyramidConfig.length === 0) return json({ error: 'Pyramid configuration is required' }, 400)
    for (const column of pyramidConfig) {
      if (typeof column.score !== 'number' || !Number.isFinite(column.score)) return json({ error: 'Each pyramid column must have a numeric score' }, 400)
      if (!Number.isInteger(column.slots) || column.slots < 1) return json({ error: 'Each pyramid column must have at least 1 slot' }, 400)
    }
    if (!Array.isArray(organizerEmails) || organizerEmails.filter(Boolean).length === 0) return json({ error: 'At least one organizer email is required' }, 400)
    const totalSlots = pyramidConfig.reduce((sum, column) => sum + column.slots, 0)
    if (totalSlots !== statements.length) return json({ error: `Pyramid has ${totalSlots} slots but there are ${statements.length} statements — these must match` }, 400)

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const studyCode = randomStudyCode()
      try {
        await env.DB.prepare(`INSERT INTO studies (id, title, description, statements, pyramid_config, organizer_emails)
          VALUES (?, ?, ?, ?, ?, ?)`)
          .bind(studyCode, title.trim(), (description || '').trim(), JSON.stringify(statements), JSON.stringify(pyramidConfig), JSON.stringify(organizerEmails.filter(Boolean)))
          .run()
        return json({ code: studyCode, title: title.trim(), message: `Study created. Share this code with participants: ${studyCode}` }, 201, { 'Access-Control-Allow-Origin': '*' })
      } catch (error) {
        if (attempt === 4) throw error
      }
    }
  }

  if (!code || !/^[A-Z0-9]{1,40}$/.test(code)) return json({ error: 'Study not found' }, 404)

  if (method === 'GET' && action === 'results') {
    const study = await env.DB.prepare('SELECT * FROM studies WHERE id = ?').bind(code).first()
    if (!study) return json({ error: 'Study not found' }, 404)
    const { results: responses } = await env.DB.prepare('SELECT * FROM responses WHERE study_id = ? ORDER BY submitted_at ASC').bind(code).all()
    return json({
      study: {
        code: study.id,
        title: study.title,
        description: study.description,
        statements: safeParse(study.statements, []),
        pyramidConfig: safeParse(study.pyramid_config, []),
      },
      responses: responses.map((response) => ({
        id: response.id,
        participantName: response.participant_name || 'Anonymous',
        sortResult: safeParse(response.sort_result, {}),
        explanations: safeParse(response.explanations, {}),
        submittedAt: response.submitted_at,
      })),
      totalResponses: responses.length,
    }, 200, { 'Access-Control-Allow-Origin': '*' })
  }

  if (method === 'GET' && !action) {
    const study = await env.DB.prepare('SELECT * FROM studies WHERE id = ?').bind(code).first()
    if (!study) return json({ error: 'Study not found. Please check the code and try again.' }, 404)
    return json({
      code: study.id,
      title: study.title,
      description: study.description,
      statements: safeParse(study.statements, []),
      pyramidConfig: safeParse(study.pyramid_config, []),
      createdAt: study.created_at,
    }, 200, { 'Access-Control-Allow-Origin': '*' })
  }

  if (method === 'POST' && action === 'responses') {
    const limited = await allowSubmission(request, env)
    if (limited.count > RATE_LIMIT_MAX) {
      const retryAfter = Math.max(1, Math.ceil((limited.window_start + RATE_LIMIT_WINDOW_MS - Date.now()) / 1000))
      return json({ error: 'Too many submissions. Please try again later.' }, 429, { 'Retry-After': String(retryAfter), 'Access-Control-Allow-Origin': '*' })
    }

    const parsed = await readJson(request)
    if (parsed.error) return json({ error: parsed.error }, parsed.error.startsWith('Invalid') ? 400 : 413)
    const { sortResult, explanations, participantName } = parsed.value
    const study = await env.DB.prepare('SELECT * FROM studies WHERE id = ?').bind(code).first()
    if (!study) return json({ error: 'Study not found' }, 404)
    if (!sortResult || typeof sortResult !== 'object' || Array.isArray(sortResult)) return json({ error: 'sortResult is required and must be an object' }, 400)

    const statements = safeParse(study.statements, [])
    const pyramidConfig = safeParse(study.pyramid_config, [])
    const placedIds = Object.keys(sortResult)
    if (placedIds.length !== statements.length || statements.some((statement) => !Object.hasOwn(sortResult, statement.id))) {
      return json({ error: `Expected ${statements.length} sorted statements, got ${placedIds.length}` }, 400)
    }
    const scoreCounts = {}
    for (const score of Object.values(sortResult)) scoreCounts[score] = (scoreCounts[score] || 0) + 1
    for (const column of pyramidConfig) {
      if ((scoreCounts[column.score] || 0) !== column.slots) return json({ error: `Score ${column.score} should have ${column.slots} statements, got ${scoreCounts[column.score] || 0}` }, 400)
    }
    const allowedScores = new Set(pyramidConfig.map((column) => column.score))
    if (Object.values(sortResult).some((score) => !allowedScores.has(score))) return json({ error: 'Sort contains a score that is not in the pyramid configuration' }, 400)

    const safeExplanations = {}
    if (explanations && typeof explanations === 'object' && !Array.isArray(explanations)) {
      for (const [key, value] of Object.entries(explanations)) if (typeof value === 'string') safeExplanations[key] = value.slice(0, 5000)
    }
    const safeName = typeof participantName === 'string' && participantName.trim()
      ? participantName.trim().slice(0, 200)
      : 'Anonymous'
    const submittedAt = new Date().toISOString()
    const insert = await env.DB.prepare(`INSERT INTO responses (study_id, participant_name, sort_result, explanations, submitted_at)
      VALUES (?, ?, ?, ?, ?)`)
      .bind(code, safeName, JSON.stringify(sortResult), JSON.stringify(safeExplanations), submittedAt)
      .run()
    const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM responses WHERE study_id = ?').bind(code).first()
    const emailTask = sendResultsEmail(study, {
      participant_name: safeName,
      sort_result: JSON.stringify(sortResult),
      explanations: JSON.stringify(safeExplanations),
      submitted_at: submittedAt,
    }, Number(count?.count || 0), env).catch((error) => console.error('[email] Delivery failed:', error.message))
    context.waitUntil(emailTask)
    return json({ id: insert.meta?.last_row_id ?? null, message: 'Response recorded successfully. Thank you!' }, 201, { 'Access-Control-Allow-Origin': '*' })
  }

  return json({ error: 'Not found' }, 404, { 'Access-Control-Allow-Origin': '*' })
}

export async function onRequest(context) {
  const { request, env } = context
  const pathname = new URL(request.url).pathname

  if (pathname.startsWith('/api/')) {
    try {
      return await handleApi(request, env, context)
    } catch (error) {
      console.error('[api] Request failed:', error)
      return json({ error: 'Internal server error' }, 500, { 'Access-Control-Allow-Origin': '*' })
    }
  }

  const response = await context.next()
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) return response

  const html = await response.text()
  const canonicalOrigin = new URL(env.BASE_URL || request.url).origin
  const rendered = applyPageMetadata(html, pathname === '/about/' ? '/about' : pathname, canonicalOrigin)
  const headers = new Headers(response.headers)
  headers.set('content-length', String(encoder.encode(rendered).byteLength))
  if (env.ENVIRONMENT === 'preview') headers.set('X-Robots-Tag', 'noindex, nofollow')
  return new Response(rendered, { status: response.status, statusText: response.statusText, headers })
}
