# vivida.ge — Vivida web app

Trilingual astrology platform (Next.js 16 App Router, React 19):

- `ka` — Georgian, served on the vivida.ge host
- `en` — English, served on the vividaastro.com host (clean URLs rewritten to the internal `/en` tree)
- `am` — Armenian, served under `/am` on the international host

See `docs/armenian-parity-handoff.md` for the locale-routing invariants before touching `proxy.ts`, rewrites, or hreflang.

## Stack

Next.js 16 · React 19 · Auth.js v5 (Google + Apple + credentials) · Drizzle ORM + Neon Postgres · Stripe + RevenueCat · Resend email · Cloudflare R2 + Turnstile · Sentry · Vercel (region `fra1`)

## Getting started

Requires Node `>=22`.

```bash
npm ci
cp .env.example .env.local   # fill in values; every key is documented
npm run db:push               # create schema in your dev database
npm run dev                   # http://localhost:3000
```

Validate the environment at any time:

```bash
npm run check:env   # fails when code reads a key missing from .env.example
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | run / build / serve production |
| `npm run lint` | eslint (must be warning-free) |
| `npm run typecheck` | `tsc --noEmit` (has `noUnusedLocals`) |
| `npm run check:env` | env-coverage check (also runs in CI) |
| `npm test` | vitest unit suite |
| `npm run test:e2e` | Playwright smoke + accessibility sweep |
| `npm run qa:armenian` | Armenian launch audit (`scripts/audit-armenian-launch.mjs`) |
| `npm run audit:prod` | `npm audit` for prod deps, high+ |
| `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` | Drizzle schema workflow |

## Database

Schema lives in `db/` (`schema.ts`), migrations in `drizzle/` (80+ and counting). CI applies `db:migrate` against a `postgres:17` service; locally `db:push` is fastest for iteration.

Integration tests (`tests/*.integration.test.ts`) need a scratch Postgres via `TEST_DATABASE_URL` and skip automatically when it is unset. Never point it at production.

## Tests

- `tests/` — ~95 vitest files: billing/credits, SEO content matrices (`-am`/`-en`), webhooks, growth metrics, auth.
- `e2e/` — Playwright smoke, accessibility (`@axe-core`), audit sweep. Thin by design; add coverage when touching `proxy.ts`, checkout return, or onboarding prefill.
- `scripts/check-env.mjs` — keeps `.env.example` in sync with `process.env.*` usage.

## Crons (vercel.json)

`daily-horoscope` 05:00, `daily-horoscope-retry` 05:30, `monthly-credits` (1st, 06:00), `feed-notification-emails` hourly :15, `personal-reminders` hourly. All ingeniously guarded by `CRON_SECRET` / `ADMIN_API_TOKEN` — see `lib/cron/`.

## Docs

- `docs/product-growth-priorities.md` — retention/monetization roadmap, funnel event contract, credit-economy guardrails
- `docs/production-monitoring.md` — Sentry setup and alerting
- `docs/armenian-parity-handoff.md` — locale routing, currency, and translation invariants
- `scripts/README.md` — ops/content script catalog
