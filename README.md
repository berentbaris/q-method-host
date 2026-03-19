# Q-Method — Online Q-Sort Studies

A web app where researchers create Q-method studies and participants complete Q-sort interviews online. No accounts required — studies are accessed via unique codes.

## How it works

1. **Organizer** creates a study: enters a title, Q-statements, configures the sorting pyramid, and provides their email
2. **Participants** receive a study code or link, then complete three stages:
   - **Triage** — drag statements into Agree / Neutral / Disagree piles
   - **Pyramid sort** — place statements into the forced-distribution grid
   - **Explanations** — explain their most extreme choices
3. Results are saved and emailed to the organizer(s)

## Tech stack

- **Frontend**: React 18 + Vite + React Router, CSS modules
- **Backend**: Express (Node.js), SQLite via `better-sqlite3`
- **Email**: Nodemailer (configurable SMTP, or console fallback)

## Quick start (local development)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd q-method-platform

# 2. Install dependencies for both client and server
cd client && npm install
cd ../server && npm install
cd ..

# 3. Configure environment (optional — the app runs without any config)
cp .env.example server/.env
# Optionally fill in SMTP credentials to enable email delivery.
# Without SMTP config, emails are printed to the console.

# 4. Start both dev servers
# Terminal 1 — backend (port 4000):
cd server && npm run dev

# Terminal 2 — frontend (port 3000, proxies /api → 4000):
cd client && npm run dev
```

Open http://localhost:3000 and you're set. The SQLite database is created automatically on first server start at `server/data/qmethod.db`.

## Deploy to Render (recommended)

The included `render.yaml` Blueprint provisions the web service with a 1 GB persistent disk for the SQLite database:

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your repo and select it
4. Render reads `render.yaml` and provisions the web service with a persistent disk
5. (Optional) Add SMTP environment variables in the Render dashboard to enable email delivery

That's it — the build command installs deps and builds the React client, and the start command runs the Express server in production mode, serving the client build.

### Free tier notes

- Render's free web services spin down after 15 minutes of inactivity. First request after idle takes ~30 seconds.
- The persistent disk keeps your SQLite data safe across deploys and restarts — no expiry.

## Deploy with Docker

For Railway, Fly.io, or self-hosting:

```bash
docker build -t q-method .
docker run -p 4000:4000 \
  -v qmethod-data:/app/server/data \
  q-method
```

Mount a volume at `/app/server/data` to persist the SQLite database across container restarts.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DB_PATH` | No | SQLite file path (default: `server/data/qmethod.db`) |
| `PORT` | No | Server port (default: 4000) |
| `NODE_ENV` | No | Set to `production` for production mode |
| `SMTP_HOST` | No | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_SECURE` | No | `true` for SSL (port 465) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password or API key |
| `SMTP_FROM` | No | Sender address |

Without SMTP config, the app runs in demo mode — emails are printed to the console.

### Email providers

**Resend** (recommended — free tier: 100 emails/day):
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_your_api_key
SMTP_FROM="Q-Sort <onboarding@resend.dev>"
```

**Gmail** (use an App Password, not your regular password):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Q-Sort <your-email@gmail.com>"
```

## Project structure

```
q-method-platform/
├── client/               React frontend (Vite)
│   ├── src/
│   │   ├── components/   Shared UI — Header, Footer, ErrorBoundary, etc.
│   │   ├── pages/        Route-level pages — Landing, CreateStudy, Participate
│   │   ├── data/         Sample Q-statements for demo
│   │   ├── styles/       Global CSS + reset
│   │   ├── api.js        Fetch wrapper for /api endpoints
│   │   └── App.jsx       Router setup
│   └── index.html
├── server/               Express backend
│   ├── routes/
│   │   ├── studies.js    Study CRUD endpoints
│   │   └── responses.js  Response submission + rate limiting
│   ├── db.js             SQLite database + schema init
│   ├── email.js          Nodemailer email service
│   └── index.js          Express app + static file serving
├── render.yaml           Render Blueprint (web service + persistent disk)
├── Dockerfile            Container build for Railway / Fly.io / self-hosting
├── .env.example          Environment variable template
└── README.md
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/studies` | Create a new study |
| `GET` | `/api/studies/:code` | Get study details (participant-safe) |
| `GET` | `/api/studies/:code/results` | Get all responses (for organizers) |
| `POST` | `/api/studies/:code/responses` | Submit a Q-sort response |
| `GET` | `/api/health` | Health check |

## License

MIT
