# Cloudflare migration runbook

Polia is being prepared for Cloudflare Pages + Pages Functions + D1. This repository can be built and tested locally without connecting to production. **Do not switch DNS or accept live studies on the new deployment until a verified data export, D1 import, and end-to-end smoke test are complete.**

## Architecture

- `client/` builds the React app to `client/dist` and is served as Pages static assets.
- `functions/[[path]].js` serves the existing `/api/*` contract and injects route-specific public-page metadata into HTML responses.
- `migrations/` contains the D1 schema.
- The existing Resend HTTP API integration is preserved using `fetch`; SMTP/Nodemailer is not used by the Worker.
- The API retains the 20-submissions-per-hour per-IP check, storing only a salted SHA-256 IP hash in D1. Configure a random `RATE_LIMIT_SALT` secret before deployment.

## Local setup

1. Install dependencies from the repository root with `npm install`.
2. Build the frontend: `npm run build`.
3. Apply the local D1 schema: `npm run cf:d1:migrate:local`.
4. Start Pages locally: `npm run cf:dev`.
5. Visit `http://127.0.0.1:8788`; exercise study creation, participant submission, results, `/about`, and the four guide routes.

Wrangler uses a local D1 database by default. Local data is separate from production data.

## Cloudflare setup

The `polia-qmethod` production D1 database and `polia-qmethod-preview` preview database have been created in the authenticated Cloudflare account's WEUR region. Their IDs and explicit `env.production` / `env.preview` bindings are in `wrangler.jsonc`; preview and production data stores are separate. Pages preview deployments must use the `env.preview` binding: a D1 `preview_database_id` alone did not isolate the first deployed Pages preview. The Pages project `polia-q-method` is deployed at `https://codex-migration-preview.polia-q-method.pages.dev`. The preview's routes and API health passed smoke checks. HTML responses in the preview also carry `X-Robots-Tag: noindex, nofollow` to keep the preview URL out of search results. After cleanup, both D1 databases were verified to contain zero studies and zero responses.

1. Confirm the authenticated account with `wrangler whoami` before running remote commands.
2. Apply schema migrations to production D1: `npm run cf:d1:migrate:remote`.
3. Initialize the preview D1 schema with `npm run cf:d1:migrate:preview`.
4. The Pages project `polia-q-method` already exists. Its preview deployment is available at the URL above; confirm its build settings use `npm run build`, output directory `client/dist`, and `wrangler.jsonc` for bindings.
5. Secrets are configured in the Pages project; never commit them. Separate generated `RATE_LIMIT_SALT` values and the existing `RESEND_API_KEY` are set for Preview and Production. `/api/email-test` reports a valid Resend key on both deployments; this checks authentication and does not send an email.
6. `EMAIL_FROM` is set to the current live sender (`berent@polia.nl`) in `wrangler.jsonc`; `BASE_URL` remains the production origin for canonical metadata and results links.
7. Deploy to the Pages preview URL first; complete the smoke tests against the preview D1 database before changing the custom domain.

## Data export and import (not required for the current cutover)

The maintainer confirmed that no study data needs to be carried over. The newly created production and preview D1 databases were verified to contain zero studies and zero responses. This cutover therefore starts with empty D1; the legacy Render SQLite file is not required. Keep the export tooling below only for a future migration if that decision changes.

1. **Back up the source SQLite database first.** Obtain a consistent copy from the current production host; a raw copy while SQLite is writing may miss WAL data. Confirm that the export opens and that the study/response counts are plausible.
2. With the source database available locally, run `node server/scripts/export-to-d1.js <path-to-new-sql-file>`. The default output is `server/data/d1-import.sql`, which is git-ignored.
3. Apply the SQL file to the already-migrated D1 database: `npx wrangler d1 execute polia-qmethod --remote --file=<path-to-sql-file>`.
4. Compare source and D1 study/response counts, then test known study codes and response results in the Pages preview.
5. Store the export securely and delete it after the import and backup retention period are confirmed. It contains participant responses and organizer email addresses.

If Render's production SQLite file was on a Free web service, its [documented ephemeral filesystem](https://render.com/docs/free) means the database can be lost on spin-down, restart, or redeploy. Check for an existing backup or another persisted source before proceeding; do not assume the current live database can be recovered from the repository.

## Cutover and rollback

1. Normal `npm run cf:deploy` targets the preview environment explicitly. Use `npm run cf:deploy:production` for future production releases.
2. The maintainer confirmed no studies are currently running and no data needs migration. Preview and Production D1 both contain zero studies and zero responses.
3. The current production build is deployed and smoke-tested at `https://polia-q-method.pages.dev`; `/api/health`, `/api/email-test`, and `/about` return HTTP 200. Preview routes and health checks also passed.
4. Add `qmethod.polia.nl` under Workers & Pages → `polia-q-method` → Custom domains. Then, at the DNS provider for `polia.nl`, replace the existing `qmethod` CNAME target `q-method-platform.onrender.com` with `polia-q-method.pages.dev`. The domain currently uses Google Domains nameservers, so the DNS edit is external to Cloudflare.
5. After DNS propagates, verify `https://qmethod.polia.nl/api/health`, `/api/email-test`, the homepage, About, guide routes, `sitemap.xml`, and `robots.txt`. Keep the Render service available during the rollback window.
6. If the domain or smoke tests fail, restore the CNAME to `q-method-platform.onrender.com` and investigate without deleting the D1 database.

Cloudflare Preview and Production are live. Preview HTML carries `X-Robots-Tag: noindex, nofollow`; production HTML keeps canonical URLs. Separate Pages rate-limit salts and Resend secrets are configured for Preview and Production, and Resend authentication passed in both. The maintainer confirmed that no study data needs migration, and both D1 databases were verified empty. The custom domain `qmethod.polia.nl` is attached to Pages, its CNAME resolves to `polia-q-method.pages.dev`, and the live health, email-authentication, homepage, About, sitemap, and robots checks all returned HTTP 200. Keep Render available during the rollback window.
