# Q-Method Interview Platform — Project Goals

## What We're Building
A web app where researchers can organize Q-method studies and participants can complete Q-sort interviews online. No accounts required — studies are accessed via unique codes.

## Core User Flows

### Flow 1: Organizer creates a study
1. Landing page → "Create a new study"
2. Enter study title + description
3. Enter Q-statements (the items participants will sort) — add one by one or paste in bulk
4. Configure the Q-sort pyramid (define column widths and score values, e.g. -4 to +4)
5. Enter organizer email(s) to receive results
6. Receive a unique study code + shareable link to distribute to participants

### Flow 2: Participant completes an interview
1. Landing page → "Participate in a study" → enter study code
2. **Stage 1 — Triage sort**: Drag statements into three piles (Agree / Neutral / Disagree)
3. **Stage 2 — Q-sort pyramid**: Drag statements from their pile into the pyramid grid, column by column from extremes inward
4. **Stage 3 — Explanations**: For the most positive and most negative columns, participant explains in text why those statements feel most extreme to them
5. Submit → results saved + emailed to organizer(s)

## Monetization
- Subtle "Buy me a coffee ☕" button in the bottom corner (links to buymeacoffee.com or Ko-fi)
- Non-intrusive, friendly tone — not a paywall

## Tech Stack Preferences
- **Frontend**: React (single-page app, no page reloads between steps)
- **Backend**: Node.js + Express (or equivalent lightweight server)
- **Database**: SQLite via `better-sqlite3` (persistent disk on Render)
- **Email**: Nodemailer or Resend API for sending results to organizers
- **Styling**: CSS with a distinctive, editorial aesthetic — avoid generic AI-slop design
- **Hosting target**: Vercel, Netlify, or similar

## Design Direction
- Clean, academic-but-friendly aesthetic. Think: a well-designed research tool, not a corporate SaaS.
- The drag-and-drop pyramid sorting should feel tactile and satisfying
- Mobile-friendly (at least the participant flow — organizer setup can be desktop-first)
- Distinctive typography — something with character, not Inter/Roboto

## Data Model (rough)

### Study
- id (unique code, e.g. 8-char alphanumeric)
- title
- description
- statements: [{ id, text }]
- pyramid_config: [{ score, slots }] (e.g. [-4,1], [-3,2], ..., [+4,1])
- organizer_emails: [string]
- created_at

### Response
- id
- study_id
- sort_result: { statement_id → score }
- explanations: { score_value → text } (for extreme columns)
- submitted_at

## Milestones

### Milestone 1 — Static shell
- [x] Landing page with two CTA buttons
- [x] Create study multi-step form (no backend yet, just UI)
- [x] Participate flow UI (triage sort + pyramid + explanation screens)
- [x] Placeholder confirmation screen
- [x] Interactive drag-and-drop for triage sort
- [x] Interactive drag-and-drop for pyramid sort

### Milestone 2 — Backend + persistence
- [x] Express server with study CRUD endpoints
- [x] SQLite schema + migrations
- [x] Study code generation
- [x] Response storage

### Milestone 3 — Email + polish
- [x] Email results to organizer on submission
- [x] Results formatted nicely (statement text + score + explanations)
- [x] Buy Me a Coffee widget
- [x] Error handling, loading states, edge cases

### Milestone 4 — Launch-ready ✅
- [x] Deploy configuration (Render Blueprint + Dockerfile + production server)
- [x] Test full flow end-to-end (code review)
- [x] README with setup instructions
- [x] Push to GitHub and deploy to Render
- [x] Smoke-test deployed app with a real study

### Milestone 5 — Post-launch updates
- [x] ~~Switch from SQLite to PostgreSQL~~ → Reverted back to SQLite with persistent disk (simpler, no 90-day expiry)
- [x] Give users more freedom when defining pyramid configuration during study creation
- [x] Fix email service for PostgreSQL JSONB compatibility (removed re-stringify workaround, added safeParse helper)
- [x] Fix pyramid sort page (Step 2: Rank) issues:
  - [x] Statement IDs too long — now displays short sequential numbers (S1, S2, S3…) instead of full UUIDs
  - [x] Hovering over statements triggers a fixed-position tooltip instead of an inline panel (no more layout shifts)
- [x] Implement the emailing feature (Resend HTTP API — SMTP ports blocked on Render, so switched to Resend's REST API over HTTPS)

### Milestone 6 — Final touches
- [x] Ask participant's name before the "Begin sorting" button; include name in the results email
- [x] Switch from Buy Me a Coffee to GitHub Sponsors — update links and text to say "Support development"
- [x] Include "Support development" GitHub Sponsors link at the bottom of results emails
- [x] Remove the dead "View all responses" link from the bottom of results emails
- [x] Edit landing page text to subtly emphasize that the tool is free (other Q-sort tools are paid)
- [x] Add Polia company logo next to the "Q Method" text in the header (top-left, on every page); logo links to polia.nl

### Milestone 7 - Ongoing updates
- [x] Investigate whether its possible/easy to switch to Github Pages instead of using Render
  - **Finding**: Not feasible. The app requires a Node.js/Express backend with SQLite for study storage, response submission, and email delivery. GitHub Pages only serves static files — there's no way to run the API or database. Sticking with Render is the right call. (If a static-only version is ever needed, the backend would need to move to a separate service or be replaced with a third-party BaaS.)
- [x] Come up with SEO improvements + add FAQ to have more related text
- [x] Create Polia P favicon from `polia-p-logo_focused.png` — fixed favicon set: proper ICO format, correct sizes (16/32px PNG, 180px apple-touch-icon, 192/512px Android Chrome), transparent background for PNGs, brand teal (#3a7c7e) background for Android Chrome icons
- [x] Build Results Viewer page — organizers can view all responses at `/results/:code`; aggregate view (statements ranked by average score with bar chart), individual response cards (expandable, show all scores + explanations); added "View Results" link to header nav and to CreateStudy success screen (with copyable results URL)
- [x] Add direct "View all responses" link from results emails to the results page — link goes to `{BASE_URL}/results/{study.id}`; BASE_URL env var defaults to `https://q-method.onrender.com`; present in both HTML and plain-text email versions
- [x] Redesign font and color palette to match Polia brand — switched accent from warm orange (#b44d2d) to brand teal (#3a7c7e); updated all paper/background tokens to cool teal-tinted neutrals; switched body font from DM Sans to Space Grotesk (more distinctive, less AI-generic); Instrument Serif display font kept; fixed all hardcoded rgba(180,77,45) and warm hex values across CSS modules

### Milestone 8 - Q-Analysis feature
- [x] Build Q-analysis computation engine (`client/src/lib/qAnalysis.js`) — full factor analysis pipeline: Pearson correlation matrix (between persons), PCA factor extraction via Jacobi eigendecomposition, varimax rotation, auto-flagging (significance threshold + communality check), weighted factor scores (Brown 1980 method), z-score conversion, distinguishing & consensus statement identification
- [x] Build Q-analysis UI component (`client/src/components/QAnalysis.jsx` + CSS module) — 5 interactive sections: Overview (eigenvalue scree chart + factor summary table), Correlation matrix (color-coded heatmap with hover values), Factor loadings (rotated loadings table with highlighted flagged participants + communality), Factor scores (z-score table with color coding, sortable by factor), Statement analysis (distinguishing & consensus statements with z-score details)
- [x] Integrate Q-Analysis tab into Results page — appears as third tab alongside Aggregate and Individual when ≥2 responses exist; configurable number of factors (auto via Kaiser criterion, or manual 2–7)

## Current Status

**Last updated**: 2026-04-06
**Active milestone**: Milestone 8 — Q-Analysis feature
**Last completed**: Full Q-analysis feature — computation engine + interactive UI integrated into Results page
**Next task**: Make promotion and ESO plan (Milestone 9) based on newly created chatgpt-promotion-advice.md file in the folder. Start working on the plan.
**Blockers / decisions needed**: (1) Drop `polia-logo.png` into `client/public/` before deploying — the header references it. (2) Update the `<link rel="canonical">` URL in `client/index.html` if the production domain changes from `q-method.onrender.com`. (3) Set `BASE_URL` env var on Render if the production domain changes (currently defaults to `https://q-method.onrender.com`).

