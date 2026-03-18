import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
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

app.listen(PORT, () => {
  console.log(`Q-Method server listening on http://localhost:${PORT}`)
  if (IS_PRODUCTION) {
    console.log(`Serving client from ${CLIENT_DIST}`)
  }
})
