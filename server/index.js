import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import { initDatabase } from './db.js'
import studiesRouter from './routes/studies.js'
import responsesRouter from './routes/responses.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Email diagnostic — visit /api/email-test to check config
app.get('/api/email-test', async (_req, res) => {
  const config = {
    EMAIL_FROM: process.env.EMAIL_FROM || process.env.SMTP_FROM || '(not set — will use default)',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? '***set***' : '(not set)',
    SMTP_HOST: process.env.SMTP_HOST || '(not set)',
    SMTP_PORT: process.env.SMTP_PORT || '(not set)',
    SMTP_USER: process.env.SMTP_USER ? '***set***' : '(not set)',
    SMTP_PASS: process.env.SMTP_PASS ? '***set***' : '(not set)',
  }

  // Determine method
  let method = 'console'
  if (process.env.RESEND_API_KEY) method = 'resend'
  else if (process.env.SMTP_HOST) method = 'smtp'

  if (method === 'console') {
    return res.json({ status: 'no_config', method, config, message: 'No email provider configured — emails go to console only. Set RESEND_API_KEY or SMTP_HOST.' })
  }

  if (method === 'resend') {
    // Test Resend API by calling their domains endpoint (lightweight check)
    try {
      const testRes = await fetch('https://api.resend.com/domains', {
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
      })
      if (!testRes.ok) {
        const body = await testRes.text()
        return res.json({ status: 'error', method, config, error: `Resend API returned ${testRes.status}: ${body}`, message: 'Resend API key rejected — check your key' })
      }
      const domains = await testRes.json()
      return res.json({ status: 'ok', method, config, domains: domains.data, message: 'Resend API key valid — emails should work. Make sure EMAIL_FROM matches a verified domain.' })
    } catch (err) {
      return res.json({ status: 'error', method, config, error: err.message, message: 'Could not reach Resend API' })
    }
  }

  // SMTP test
  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.verify()
    res.json({ status: 'ok', method, config, message: 'SMTP connection verified — emails should work' })
  } catch (err) {
    res.json({ status: 'error', method, config, error: err.message, message: 'SMTP connection failed' })
  }
})

// API routes
app.use('/api/studies', studiesRouter)
app.use('/api/studies', responsesRouter)

// --- Serve the React client in production ---
// The built client lives at ../client/dist after `npm run build`
const CLIENT_DIST = join(__dirname, '..', 'client', 'dist')

if (IS_PRODUCTION || existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST))

  // All non-API routes serve index.html (SPA client-side routing)
  app.get('*', (req, res, next) => {
    // Don't intercept /api routes
    if (req.path.startsWith('/api')) return next()
    res.sendFile(join(CLIENT_DIST, 'index.html'))
  })
}

// JSON parse error handler
app.use((err, _req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large (max 1 MB)' })
  }
  next(err)
})

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ---- Start server after database is ready ----

async function start() {
  try {
    await initDatabase()
    app.listen(PORT, () => {
      console.log(`Q-Method server listening on http://localhost:${PORT}`)
      if (IS_PRODUCTION) {
        console.log(`Serving client from ${CLIENT_DIST}`)
      }
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
