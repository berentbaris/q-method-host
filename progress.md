# Q-Method Platform — Progress Log

## 2026-04-07 (session 17)

- **Created Milestone 9 promotion & SEO plan** in goals.md — based on chatgpt-promotion-advice.md; structured as technical SEO tasks (automated) and outreach tasks (manual/organizer action)
- **Built 4 SEO landing pages** targeting low-competition keywords: `/q-methodology-tool` (features + comparison table), `/online-q-sort-tool` (participant experience walkthrough), `/q-methodology-explained` (practical Q-method introduction for researchers), `/q-method-analysis-guide` (factor analysis pipeline guide from correlation to interpretation); each page is 800–1500 words of real content with CTAs, comparison tables, and process step breakdowns
- **Added SEO infrastructure** — `sitemap.xml` (8 URLs with priorities) and `robots.txt` in `client/public/`; per-page `<title>` and `<meta description>` updates via `useEffect` on each SEO page
- **Added internal linking** — "Guides and resources" card grid on Landing page linking to all 4 SEO pages; footer nav with links to all guides; cross-links ("Related Guides") section at the bottom of each SEO page for interlinking
- **Shared CSS module** (`SeoPage.module.css`) — editorial long-form article styles including hero with breadcrumb, article prose, callout boxes, CTA blocks, comparison tables, numbered process steps, all using existing design tokens

## 2026-04-06 (session 16)

- **Built Q-analysis computation engine** (`client/src/lib/qAnalysis.js`) — implements the full Q-methodology factor analysis pipeline entirely client-side: Pearson correlation matrix between persons, PCA factor extraction via Jacobi eigendecomposition, varimax rotation, auto-flagging (significant loading > 1.96/√n, highest loading, >50% communality), weighted factor scores using Brown (1980) method with z-score conversion, and distinguishing/consensus statement identification
- **Built Q-analysis interactive UI** (`client/src/components/QAnalysis.jsx` + CSS module) — five navigable sections: Overview (eigenvalue scree chart + factor summary), Correlation matrix (diverging color heatmap with hover tooltips), Factor loadings (varimax-rotated table with highlighted flagged participants and communality column), Factor scores (z-score table with color-coded cells, sortable by any factor), Statement analysis (distinguishing & consensus statement tables with z-score differences)
- **Integrated Analysis tab into Results page** — third tab ("Q-Analysis") appears alongside Aggregate and Individual when ≥2 responses exist; users can configure factor count (auto via Kaiser criterion or manual 2–7); all computation runs in the browser with memoized results
- **Verified engine correctness** — tested with synthetic 4-participant × 5-statement data; confirmed proper eigenvalue decomposition, factor extraction, flagging, and z-score computation

## 2026-04-05 (session 15)

- **Added results page link to emails** — results emails now include a "View all responses for this study →" link (HTML) and a plain-text URL pointing to `{BASE_URL}/results/{study.id}`; `BASE_URL` defaults to `https://q-method.onrender.com` and can be overridden via env var
- **Switched color palette to Polia teal brand** — replaced warm orange accent (#b44d2d) with brand teal (#3a7c7e); updated all CSS variable tokens (`--color-paper*`, `--color-ink*`, `--color-accent*`) to cool teal-tinted neutrals; also updated hardcoded `rgba(180,77,45,…)` values in PyramidSort, Results, and CoffeeButton modules to teal equivalents
- **Switched body font from DM Sans to Space Grotesk** — updated Google Fonts import in `index.html`, CSS variable in `global.css`, and two remaining hardcoded `'DM Sans'` references in `ErrorBoundary.jsx` and `CoffeeButton.module.css`

## 2026-04-03 (session 14)

- **Fixed broken favicon set** — previous session's favicons were malformed (ICO was actually a JPEG, PNGs were 13×13 instead of 16×16, etc.); rebuilt all from `polia-p-logo_focused.png` using Pillow: proper content crop, background removal via saturation heuristic, correct sizes (16/32/48 in ICO, 16/32 PNGs, 180px apple-touch-icon with white bg, 192/512px Android Chrome with brand teal bg)
- **Added Results Viewer page** — new `/results` and `/results/:code` routes; organizers can enter a study code to see all responses; features two views: Aggregate (all statements sorted by average score with proportional bar), Individual (expandable cards per participant with full score breakdown and explanations)
- **Fixed server results endpoint** — `GET /api/studies/:code/results` now includes `participant_name` in each response object
- **Updated header nav** — added "View Results" link to the top navigation bar
- **Updated CreateStudy success screen** — now shows both the participant link and a separate "Results link (keep this for yourself)" with a copy button; organizers get the results URL immediately after creating a study

## 2026-04-03 (session 13)

- **Created Polia P favicon** — processed `polia-p-logo_focused.png` into a full favicon set: cropped to content, removed background, made square with transparent padding
- **Generated multiple favicon sizes** — `favicon.ico` (16/32/48px multi-size), `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` (180px, white background), `android-chrome-192x192.png`, `android-chrome-512x512.png`
- **Created web manifest** — `site.webmanifest` with app name, icons, theme color (#3a7c7e), and background color matching the site palette
- **Updated `index.html`** — added `<link>` tags for favicon.ico, PNG favicons, apple-touch-icon, web manifest, and theme-color meta tag

## 2026-04-03 (session 12)

- **Replaced all `#github-sponsors` placeholder URLs** with `https://buymeacoffee.com/polia` in three locations: `CoffeeButton.jsx`, `Footer.jsx`, and `server/email.js`
- **Updated button title** — removed "on GitHub" from the CoffeeButton tooltip; visible label text stays as "Support development" (no branding)
- **Cleared blocker (2)** from goals.md — the placeholder URL issue is now resolved

## 2026-03-26 (session 11)

- **Investigated GitHub Pages** — concluded it's not feasible: the app requires Express + SQLite for the API and database, which GitHub Pages (static-only) can't support. Documented the finding in goals.md.
- **Added comprehensive SEO meta tags** — added `<meta>` description, keywords, author, robots, canonical URL, Open Graph tags (og:title, og:description, og:type, og:url), and Twitter Card tags to `index.html`
- **Added JSON-LD structured data** — two blocks: a `WebApplication` schema with features list and pricing (free), and a `FAQPage` schema with 6 Q&A entries for rich search results
- **Built interactive FAQ section** — 8 accordion-style Q&A items on the landing page covering free pricing, no accounts needed, completion time, pyramid customization, results delivery, mobile support, forced distributions, and data handling; styled to match the editorial design system with +/− toggle buttons
- **Expanded Q-methodology explainer** — added a second paragraph to the "What is Q-methodology?" aside covering history (William Stephenson, 1930s), cross-disciplinary usage, and how Q-sorts differ from surveys

## 2026-03-20 (session 10)

- **Added participant name field** — name input appears on the study intro page before "Begin sorting"; name is stored in the `responses` table (`participant_name` column), included in email subject line and email body (both HTML and plain text)
- **Switched to GitHub Sponsors** — replaced Buy Me a Coffee floating button and footer link with "Support development" linking to `#github-sponsors` (placeholder); updated CoffeeButton icon from ☕ to ♡
- **Fixed email footer** — removed dead "View all responses" link, added "Support development" GitHub Sponsors link; added participant name to email meta line
- **Updated landing page copy** — hero subtitle now reads "no accounts, no installs, no fees. Completely free, forever." to subtly differentiate from paid Q-sort tools
- **Added Polia logo to header** — logo sits left of the Q Method wordmark with a thin divider, links to polia.nl; references `polia-logo.png` from `client/public/` (file needs to be dropped in before deploy)

## 2026-03-20 (session 9)

- **Email delivery working** — switched from SMTP (Nodemailer) to Resend HTTP API because Render's free tier blocks outbound SMTP ports (465 and 587); emails now send over regular HTTPS
- **Dual email backend** — `email.js` now supports two modes: Resend API (set `RESEND_API_KEY`) or SMTP (set `SMTP_HOST`), with automatic fallback to console logging if neither is configured
- **Diagnostic endpoint** — added `/api/email-test` that checks which email method is active and verifies the connection (handles Resend's send-only API keys gracefully)
- **DNS fix** — merged two conflicting SPF records (Zoho + Resend) into a single combined record so email deliverability works correctly
- **Wrote Milestone 6** — final touches: participant names, GitHub Sponsors, Polia branding, landing page copy updates

## 2026-03-19 (session 8)

- **Reverted from PostgreSQL back to SQLite** — replaced `pg` with `better-sqlite3`; SQLite is simpler, has zero config, and avoids Render's 90-day free Postgres expiry
- **Rewrote `server/db.js`** — synchronous SQLite via `better-sqlite3` with WAL mode, wrapped in async helpers to keep route code unchanged
- **Updated all routes for SQLite** — `$1`-style placeholders → `?`, removed JSONB reliance (explicit `JSON.parse` on read, `JSON.stringify` on write), `lastInsertRowid` instead of `RETURNING id`
- **Updated deployment config** — `render.yaml` now provisions a 1 GB persistent disk instead of a Postgres database; Dockerfile adds build tools for `better-sqlite3` native compilation and a data volume mount point
- **Updated README and .env.example** — removed all PostgreSQL references, documented SQLite setup and `DB_PATH` option

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
