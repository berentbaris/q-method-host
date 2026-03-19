# Q-Method Platform — Progress Log

## 2026-03-19 (session 7)

- **Fixed statement ID display in PyramidSort** — source cards and placed cards now show short sequential labels (S1, S2, S3…) instead of full UUIDs, making them readable and compact
- **Fixed detail panel layout shift** — replaced the inline detail panel (which pushed the pyramid down on hover) with a fixed-position tooltip that floats above the content without affecting layout
- **Made email service PostgreSQL-compatible** — added a `safeParse` helper that handles both JSON strings and already-parsed JSONB objects; removed the hacky re-stringify workaround in the response submission route
- **Cleaned up response route** — the `sendResultsEmail` call now passes the study and response objects directly instead of re-encoding them as JSON strings

## 2026-03-19 (session 6)

- **Redesigned pyramid configuration step** — replaced the single range slider with a richer UI: users now pick a score range (−2 to −6), choose a shape preset (Standard / Flat / Steep), and fine-tune individual column slot counts via +/− buttons on each column
- **Added distribution presets** — three built-in distribution algorithms: Standard (classic symmetric 1,2,3…3,2,1), Flat (less difference between columns), and Steep (more slots concentrated near center)
- **Added smart range suggestion** — when the user's statement count matches a standard pyramid for a different range, a one-click suggestion button appears (e.g. "Use −3 to +3 range (matches 13 statements)")
- **Strengthened backend validation** — added per-column validation in POST /api/studies: each column must have a numeric score and at least 1 slot (prevents malformed configs from custom edits)
- **Added CSS for new controls** — preset button row, circular +/− adjust buttons on each column, slot count labels, and a dashed suggestion button; all consistent with the existing editorial design system

## 2026-03-18 (session 5)

- **Migrated from SQLite to PostgreSQL** — replaced `better-sqlite3` with the `pg` library using a connection pool; schema uses `JSONB` columns for statements, pyramid config, sort results, and emails (no more manual JSON.stringify/parse on read)
- **Converted all routes to async** — all Express handlers are now `async` functions using parameterised queries with `$1`-style placeholders; INSERT uses `RETURNING id` instead of `lastInsertRowid`
- **Updated deployment config** — `render.yaml` now provisions a free PostgreSQL database and auto-wires `DATABASE_URL`; Dockerfile no longer creates a SQLite data directory; created `.env.example` with `DATABASE_URL` as the primary required config
- **Updated README** — reflects PostgreSQL setup for local dev, Render deployment, and Docker; removed SQLite volume mount instructions; added note about Render's 90-day free Postgres expiry

## 2026-03-18 (session 4)

- **Deployment infrastructure** — created `render.yaml` (Render Blueprint) for one-click deploy with 1 GB persistent disk for SQLite, plus a multi-stage `Dockerfile` for Railway/Fly.io/self-hosting
- **Production server** — updated `server/index.js` to serve the built React client via `express.static` in production, with SPA catch-all routing for client-side routes
- **Root `package.json`** — unified build/start scripts (`npm run build` builds client, `npm start` runs server, `postinstall` handles both dependency trees)
- **README** — comprehensive setup guide covering local development, Render deployment, Docker deployment, environment variables, email provider configs, project structure, and API endpoints
- **End-to-end code review** — verified all flows (create study, participate, submit response, email delivery) are correct and production-ready; added `.gitignore` files for root and client

## 2026-03-18 (session 3)

- Built **email service** (`server/email.js`) — Nodemailer-based module with configurable SMTP via env vars; formats results as both HTML and plain text showing sorted statements grouped by score with color-coded labels, participant explanations, and study metadata; gracefully falls back to console logging when SMTP isn't configured
- **Wired email into response submission** — after a participant submits, organizers receive an email with the full sorted results; sending is non-blocking so it doesn't slow down the response; added response count to email subject line
- Added **floating Buy Me a Coffee widget** — fixed-position button in bottom-right corner with warm styling, collapses to icon-only on mobile; integrated into Layout so it appears on all pages
- Added **error handling & edge cases** — React ErrorBoundary component catches crashes and shows friendly fallback; 404 page for unknown routes; step validation in CreateStudy wizard (prevents advancing with empty title, too few statements, pyramid/statement mismatch, or missing email); loading spinner for study fetch; IP-based rate limiter on response submission (20/hour); explanation text sanitization (5K char limit); JSON parse and body-size error handlers on Express
- Added `dotenv` and `nodemailer` to server dependencies; created `.env.example` with SMTP config for Gmail and Resend
- Completed **Milestone 3** (email + polish); next up is Milestone 4 (launch-ready)

## 2026-03-17 (session 2)

- Built **Express server** (`/server`) with `better-sqlite3` — SQLite schema for `studies` and `responses` tables with WAL mode and foreign keys
- Built **study CRUD endpoints** — `POST /api/studies` (creates study with 8-char code generation, validates statement count matches pyramid slots), `GET /api/studies/:code` (returns participant-safe data), `GET /api/studies/:code/results` (returns all responses for organizers)
- Built **response submission endpoint** — `POST /api/studies/:code/responses` with full validation: checks all statements are placed and score distribution matches pyramid config
- Created **client API module** (`src/api.js`) — thin fetch wrapper used by both CreateStudy and Participate pages
- **Wired up CreateStudy** to POST to the real API on submit — shows success screen with copyable study code and shareable direct link
- **Wired up Participate** to fetch study data from API by code — falls back to sample data when server is offline (for demo), submits responses to API on completion
- Completed **Milestone 2** (backend + persistence); next up is Milestone 3 (email + polish)

## 2026-03-17 (session 1)

- Built **interactive TriageSort** component — card-swiping interface where participants see one statement at a time and sort into Agree / Neutral / Disagree via drag (pointer events), quick-action buttons, or keyboard arrow keys; includes progress bar, pile counters, exit animations, and a completion summary with peek-into-piles
- Built **interactive PyramidSort** component — participants place triaged statements into the forced-distribution pyramid grid; supports both click-to-place (select card → click column) and drag-and-drop with a floating ghost; source cards grouped by triage pile, columns validate capacity, detail panel shows full text on hover
- Created **sample data** — 25 Q-statements on "Technology in Education" topic plus default -4 to +4 pyramid config (matches 25 total slots)
- Updated **Participate.jsx** to manage state across all stages — triage result passes into pyramid sort, pyramid result feeds into explanation stage which now shows the actual extreme statements the participant placed
- Completed Milestone 1 (static shell + interactive drag-and-drop); next up is Milestone 2 (backend + persistence)

## 2026-03-16

- Scaffolded full React + Vite project in `/client` with package.json, vite config, and Google Fonts (Instrument Serif + DM Sans)
- Built **landing page** with hero section, two CTA buttons ("Create a new study" / "I have a study code"), how-it-works steps, and a Q-methodology explainer aside
- Built **Create Study** wizard — 5-step flow: study details → Q-statements (add one-by-one or bulk paste) → pyramid config with interactive range slider and visual preview → organizer emails → review summary
- Built **Participate** flow — 6-stage flow: enter study code → welcome/intro → triage sort layout (agree/neutral/disagree piles) → pyramid sort grid → explanation text fields → thank-you confirmation
- Created shared layout with **Header** (logo + nav links) and **Footer** (tagline + Buy Me a Coffee link), all using CSS modules
- Established editorial design system: warm neutral palette, serif display headings, generous whitespace, distinctive typography, responsive down to mobile
- Note: drag-and-drop interactivity for triage and pyramid sort is placeholder — that's the next task
