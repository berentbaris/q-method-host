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
- **Database**: SQLite for simplicity (or a hosted option like Supabase/PlanetScale if persistence across deploys matters)
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
- [x] Switch from SQLite to PostgreSQL (persistent data across deploys)
- [x] Give users more freedom when defining pyramid configuration during study creation
- [x] Fix email service for PostgreSQL JSONB compatibility (removed re-stringify workaround, added safeParse helper)
- [x] Fix pyramid sort page (Step 2: Rank) issues:
  - [x] Statement IDs too long — now displays short sequential numbers (S1, S2, S3…) instead of full UUIDs
  - [x] Hovering over statements triggers a fixed-position tooltip instead of an inline panel (no more layout shifts)
- [ ] Implement the emailing feature (configure SMTP on Render — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars)

## Current Status
> Update this section each session so Claude knows where to pick up.

**Last updated**: 2026-03-19
**Active milestone**: Milestone 5
**Last completed**: Fixed pyramid sort UI issues (short statement labels, tooltip instead of inline detail panel) and made email service PostgreSQL-compatible
**Next task**: Implement the emailing feature (configure SMTP env vars on Render — the code is ready, just needs SMTP_HOST/PORT/USER/PASS set in Render dashboard)
**Blockers / decisions needed**: To enable email delivery, the organizer needs to choose an SMTP provider (e.g. Resend, Gmail SMTP, or Mailgun) and add the credentials as environment variables on Render. The code handles everything else automatically.

## Conventions & Preferences
- Use functional React components with hooks
- Keep components small and single-purpose
- CSS modules or plain CSS — no Tailwind (to keep aesthetic control)
- Commit-friendly file structure: `/client` for frontend, `/server` for backend
- Prefer readable code over clever one-liners
- Add a short comment above any non-obvious logic
