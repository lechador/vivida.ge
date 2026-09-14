# scripts/ — catalog

One-off ops, content pipelines, and repo-health checks. Every script documents
its own usage + idempotency in its header — read it before running. Nothing
here runs in production on its own (except via explicit manual invocation);
scheduled work lives in `vercel.json` crons → `app/api/cron/*`.

Conventions:

- `.mjs` — plain Node, `node scripts/<name>.mjs [--dry]`.
- `.mts` / `.tsx` — TypeScript, `npx tsx scripts/<name>`.
- Destructive scripts default to `--dry` / preflight mode. Never add a script
  that writes on a bare run.
- Seeds and translators must be re-runnable (upserts, `IF NOT EXISTS`).
- Env is read from `.env.local` or the process environment. Integration-test
  scripts additionally accept `TEST_DATABASE_URL`.

## Repo health / CI

| Script | Purpose |
|---|---|
| `check-env.mjs` | Fails when code reads a `process.env.*` key missing from `.env.example`. Runs in CI (`npm run check:env`). |
| `audit-armenian-launch.mjs` | Armenian launch QA (`npm run qa:armenian`). |
| `grammar-check-home.mjs` | Copy check for the home page. |

## Infra setup (run once per environment)

| Script | Purpose |
|---|---|
| `generate-apple-client-secret.mjs` | Mints Apple's 6-month client-secret JWT for `AUTH_APPLE_SECRET`. Re-run before expiry. |
| `create-am-stripe-price.mjs` | Idempotently creates the AMD Stripe price. |

## One-shot ops (archived — do not re-run without reading the header)

| Script | Purpose |
|---|---|
| `apply-0009.mjs` | Manually applied migration 0009 via Neon HTTP (idempotent). Historical. |
| `backfill-gender.mjs` | Gender backfill. |
| `backfill-signup-bonus.mjs` | Signup-bonus backfill. |
| `backfill-usernames.mts` | Username backfill. |
| `grandfather-credits.mjs` | Granted 30 credits to pre-wallet users with no credit activity (`--dry` supported). |
| `repair-mislabelled-locale-cache.mjs` | Locale-cache repair. |
| `recalibrate-iq.mjs` | IQ scoring recalibration. |
| `apologize-lost-birthdate.mjs` | Apology email for lost birthdates. |

## Safety (read-only)

| Script | Purpose |
|---|---|
| `scan-underage.mjs` | Scans for under-age accounts. Takes no action by itself. |

## Campaigns (idempotent — preflight first, `--execute` to send)

| Script | Purpose |
|---|---|
| `launch-token-growth-campaign.tsx` | Token-growth campaign; builds a live preflight report by default, idempotent via `reminder_delivery`. |
| `announce-email.mjs`, `announce-free-email.mjs`, `announce-iq-email.mjs` | Bulk announcement sends. |
| `post-iq-feed.mjs` | IQ feed post. |

## Content generation (LLM-assisted — review the diff)

`generate-home-content.mjs`, `generate-synastry-aspects.mjs`,
`generate-yearly-content.mjs`, `generate-zodiac-content.mjs`,
`generate-zodiac-extras.mjs`, `gen-mbti-characters.mjs`

## Library seeds (re-runnable upserts)

`seed-aspect-library.mjs`, `seed-house-library.mjs`,
`seed-interpretation-library.mjs`, `seed-mbti-library.mjs`,
`seed-mbti-questions.mjs`, `seed-moon-library.mjs`,
`seed-synastry-library.mjs`, `seed-transit-library.mjs`,
`seed-vivida-posts.mjs`

## Translations

`translate-*.mjs/.mts` (zodiac, synastry, natal libraries, yearly horoscope,
transit library, true-sign, test banks, EQ articles — mostly `en→am`) plus
`i18n-extract-en-ternaries.mjs`, `i18n-apply-am-ternaries.mjs`,
`i18n-translate-strings.mjs`.

## Proofreading

`proofread-bigfive.mjs`, `proofread-iq-questions.mjs`,
`proofread-mbti-library.mjs`, `proofread-mbti-questions.mjs`,
`proofread-truesign.mjs`
