# Q-Method — Online Q-Sort Studies

A web app where researchers create Q-method studies and participants complete Q-sort interviews online. No accounts required — studies are accessed via unique codes.
Accessible via: https://qmethod.polia.nl/

## How it works

1. **Organizer** creates a study: enters a title, Q-statements, configures the sorting pyramid, and provides their email
2. **Participants** receive a study code or link, then complete three stages:
   - **Triage** — drag statements into Agree / Neutral / Disagree piles
   - **Pyramid sort** — place statements into the forced-distribution grid
   - **Explanations** — explain their most extreme choices
3. Results are saved and emailed to the organizer(s)

## Research documentation

The `/about` page identifies the maintainer and ORCID, describes current data handling,
provides a suggested software citation and BibTeX entry, and documents the implemented
analysis pipeline and its limitations. Update that page when access controls, storage,
email delivery, retention, or analysis behavior changes. The current study code also
grants access to results; statement labels in the dashboard are exploratory rather
than significance-tested.

## Tech stack

- **Frontend**: React 18 + Vite + React Router, CSS modules
- **Backend (current production)**: Express (Node.js)
- **Database (current production)**: SQLite via `better-sqlite3`
- **Migration target**: Cloudflare Pages Functions + D1
- **Email**: Resend HTTP API (SMTP is supported only by the legacy Express server)

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

## Cloudflare migration

Cloudflare deployment configuration, D1 schema, local development commands, and the data cutover runbook are in [CLOUDFLARE_MIGRATION.md](CLOUDFLARE_MIGRATION.md). The migration uses:

- Cloudflare Pages for the Vite build in `client/dist`
- Pages Functions for the `/api/*` routes
- D1 for studies and participant responses
- Resend over HTTPS for results emails

The production D1 ID and secrets are intentionally not committed. Follow the runbook to configure a separate preview database, production database, Resend key, and cutover.

## Existing Render deployment and data warning

The current Render deployment is the legacy Express/SQLite app. The repository's `render.yaml` currently declares `plan: free` and a persistent disk, but [Render's free-service limits](https://render.com/docs/free) say free web services do not support persistent disks and their local filesystem is ephemeral. Do not rely on that configuration to preserve studies or responses. Before cutover, obtain a consistent database backup, verify study and response counts, and follow the migration runbook. Render remains useful only as a rollback target if its production data and service are verified.

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
