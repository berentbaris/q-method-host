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

// Email diagnostic — lets you test whether SMTP is working
// Visit /api/email-test to see config status and send a test email
app.get('/api/email-test', async (_req, res) => {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST || '(not set)',
    SMTP_PORT: process.env.SMTP_PORT || '(not set)',
    SMTP_USER: process.env.SMTP_USER ? '**set**' : '(not set)',
    SMTP_PASS: process.env.SMTP_PASS ? '**set**' : '(not set)',
    SMTP_FROM: process.env.SMTP_FROM || '(not set — will use default)',
    SMTP_SECURE: process.env.SMTP_SECURE || '(not set — defaults to false)',
  }

  if (!process.env.SMTP_HOST) {
    return res.json({ status: 'no_config', config, message: 'SMTP_HOST not set — emails go to console only' })
  }

  // Try to actually connect and send a test
  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    // Verify connection (doesn't send an email, just checks auth)
    await transporter.verify()
    res.json({ status: 'ok', config, message: 'SMTP connection verified successfully — emails should work' })
  } catch (err) {
    res.json({ status: 'error', config, error: err.message, message: 'SMTP connection failed — check your credentials' })
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
