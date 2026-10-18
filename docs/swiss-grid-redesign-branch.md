# Swiss-Grid Astronomical Almanac & Editorial Celestial Redesign (`feat/swiss-grid-redesign`)

## 1. Pushing to a Separate Branch (`feat/swiss-grid-redesign`)
When exporting from AI Studio to GitHub:
1. Click the **GitHub** icon in the top-right bar of AI Studio.
2. Select your repository and enter a new branch name: **`feat/swiss-grid-redesign`** (do **not** select `main`).
3. Vercel will automatically build and deploy a **Preview URL** for `feat/swiss-grid-redesign` without affecting your live production site on `main`.

---

## 2. Production Hardening Included on This Branch
All runtime and build-time contracts have been hardened so the branch runs cleanly both in Vercel Preview/Production (with real Neon Postgres, Auth.js, Stripe, Resend, and Cloudflare Turnstile) and in AI Studio Preview:
- **Database (`db/index.ts`)**: Uses the real `@neondatabase/serverless` (`neon-http`) Drizzle driver whenever `DATABASE_URL` is set on Vercel; falls back to the in-memory preview store only when `DATABASE_URL` is absent.
- **Authentication (`auth.ts`, `auth.config.ts`, `lib/auth-helpers.ts`, `types/next-auth.d.ts`)**: Uses the real `DrizzleAdapter` when `DATABASE_URL` is set, with strict `Session["user"]["id"]` typing.
- **Stripe (`lib/stripe.ts`)**: Uses real `stripe.checkout.sessions.create` and `stripe.billingPortal.sessions.create` whenever `STRIPE_SECRET_KEY` is configured on Vercel.
- **Cloudflare Turnstile (`lib/turnstile.ts`)**: Verifies tokens against `https://challenges.cloudflare.com/turnstile/v0/siteverify` whenever `TURNSTILE_SECRET_KEY` is configured on Vercel.
- **Component & SEO Contracts**: Fixed `MiniBigThree` client-component compatibility on `/dashboard`, 3-argument `lifePathFromDate(year, month, day)` reduction math in `LifePathCalculator`, `elementEn` normalization in `CompatibilityCalculator`, and tuple return `[a, b]` in `parsePairSlug`.

---

## 3. Pure UI/UX Redesign File Manifest
When merging `feat/swiss-grid-redesign` into `main`, you can merge **only** the UI/UX design files below while keeping `main`'s original `package.json`, `tsconfig.json`, and backend infrastructure untouched:

```bash
git checkout main
git checkout -b feat/swiss-grid-ui-clean
git checkout feat/swiss-grid-redesign -- \
  app/globals.css \
  app/page.tsx \
  app/en/page.tsx \
  app/dashboard/page.tsx \
  app/report/page.tsx \
  app/synastry/page.tsx \
  app/synastry/[id]/page.tsx \
  app/taro/page.tsx \
  app/mtvaris-kalendari/page.tsx \
  app/numerologia/page.tsx \
  components/brand/vivida-mark.tsx \
  components/brand/celestial-icons.tsx \
  components/nav/celestial-context-strip.tsx \
  components/nav/observatory-drawer.tsx \
  components/nav/app-header.tsx \
  components/marketing-header.tsx \
  components/en/english-header.tsx \
  components/site-footer.tsx \
  components/landing/interactive-astrolabe.tsx \
  components/landing/hero.tsx \
  components/landing/en-hero.tsx \
  components/landing/pillars-section.tsx \
  components/landing/how-it-works-section.tsx \
  components/landing/compatibility-calculator.tsx \
  components/landing/pricing-anchor.tsx \
  components/landing/faq-section.tsx \
  components/landing/final-cta.tsx \
  components/dashboard/daily-dashboard.tsx \
  components/dashboard/mini-big-three.tsx \
  components/dashboard/chart-section.tsx \
  components/dashboard/aspect-cards.tsx \
  components/report/positions-table.tsx \
  components/report/report-nav.tsx \
  components/synastry/partner-card.tsx \
  components/synastry/synastry-teaser.tsx \
  components/synastry/synastry-deep-report.tsx \
  components/synastry/synastry-display-en.tsx \
  components/profile/synastry-display.tsx \
  components/tarot/tarot-reader.tsx \
  components/seo/life-path-calculator.tsx
```
