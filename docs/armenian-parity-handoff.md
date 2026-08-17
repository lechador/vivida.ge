# Armenian (`/am`) — implementation handoff

Target: full parity with the Georgian and English trees (~590 Armenian URLs) on
`www.vividaastro.com/am`, plus Armenian/AMD commerce.

The **locale foundation, billing, and SEO plumbing are done, verified, and in the
working tree.** What remains is content translation and wiring it into routes.
Read "Invariants" before writing code — most of them encode a defect that has
already been shipped once on this codebase.

---

## 1. Architecture you are working inside

Armenian is the third locale and the **first that is not a domain**:

| Locale | Where it lives | How it is detected |
| --- | --- | --- |
| Georgian | `www.vivida.ge` | Host header |
| English | `www.vividaastro.com` | Host header |
| Armenian | `www.vividaastro.com/am` | **Path prefix** |

A path prefix is invisible to server components, so `proxy.ts` (Next 16's
renamed middleware) is the only place that can see it. It:

1. sets the request header `x-vivida-locale: am`, which `getRequestLocale()`
   reads **before** the host check;
2. rewrites `/am/<georgian-slug>` → `/<georgian-slug>`, so the shared route tree
   serves all three languages from one file;
3. 308s `vivida.ge/am/*` → `www.vividaastro.com/am/*`.

**`app/am/**` holds 9 core routes** (`/`, `/about`, `/compatibility`,
`/horoscope`, `/natal-chart`, `/privacy`, `/terms`, `/tests`, `/zodiac`),
mirroring `app/en/**` and keeping English slugs. They are listed in
`ARMENIAN_CORE_ROUTES` and are **exempt from the rewrite** — `/am/natal-chart`
would otherwise strip to `/natal-chart`, which exists only under `app/en`.
Everything else rewrites onto the Georgian slugs.

Key files:

- `lib/i18n/armenian-routes.ts` — prefix helpers, core-route list, hreflang gate
- `lib/i18n/request-locale.ts` — `getRequestLocale()`, header-first
- `proxy.ts` — the routing itself
- `lib/seo/locales.ts` — `localizedAlternates()`, gated Armenian hreflang
- `app/sitemap.ts` — `alternatesFor()` + `armenianSitemap()`
- `lib/billing-config.ts` — AMD catalogue
- `tests/armenian-routes.test.ts` — regression tests for all of the above

### Current state of the long tail

`/am/<any-georgian-slug>` already returns **200 with `lang="hy"`** — but renders
**Georgian text**, because no route has an `am` branch yet. This is safe *only*
because the hreflang gate and the sitemap both exclude those URLs. Translating a
cluster and opting it into the gate must land in the same change.

---

## 2. Invariants — do not violate these

1. **Never `startsWith("/am")`.** The Georgian tree contains `/zodiac/amomavali`
   (13 rising-sign URLs) and other `am…` slugs. Use `stripArmenianPrefix()`,
   which matches only the exact segment. There is a test for this.
2. **Never add a path to `ARMENIAN_CONTENT_PATHS` / `ARMENIAN_CONTENT_PREFIXES`
   before that route's `am` branch actually renders Armenian.** hreflang is a
   claim the URL exists; pointing it at a page that serves the wrong language —
   or 404s — makes Google discard the *entire* annotation cluster for the page,
   taking the working ka↔en pair down with it.
3. **Never call `Intl` with `hy` or `ka` in a client component.** Browsers ship
   no locale data for either; the server (full ICU) and the client disagree and
   React throws the markup away. Use `lib/i18n/am-date.ts` and
   `formatBillingAmount()`, which format manually. See the Georgian precedent.
4. **Pass `locale` to `SiteFooter` and `SmartHeader`.** Both default to `"ka"`.
   Any page that does not delegate to an `-am` component and forgets this ships
   Georgian chrome on an Armenian page — this exact bug put 31–57% Georgian text
   on three English pages in Aug 2026.
5. **Never pass an `/en/...` internal path as `pairedPath` to
   `localizedAlternates()`** on a non-`en` branch. It emits an internal English
   path on the wrong domain that only 301s back.
6. **A page-level `openGraph` block replaces the parent's wholesale**, silently
   dropping the site OG image. Any page that sets `openGraph` must restate
   `images: [DEFAULT_OG_IMAGE]` (or its own card).
7. **AMD minor units are ×100.** Stripe treats AMD as two-decimal, so ֏2,990 is
   `299_000`. Display drops the decimals and puts `֏` after the amount.

---

## 3. Work items, in dependency order

### Step 0 — Stripe price — ✅ DONE (created in live mode, 2026-08-17)

Created by hand in the live dashboard, so no script run is needed:

| | |
| --- | --- |
| Product | `Vivida PRO Armenia` · `prod_V5XOANYYjmLuzR` |
| Price | AMD 2,990.00 / month, default price |
| Lookup key | `vivida_premium_am_monthly_299000_v1` |
| Tax code | `txcd_10103100` — Managed Payments **Eligible** |

The dashboard rendering the amount as `2,990.00` is the live confirmation that
**Stripe treats AMD as two-decimal**, i.e. `299_000` minor units, matching
`PREMIUM_PLANS_BY_COUNTRY.AM` in `lib/billing-config.ts`.

Note the account convention discovered while doing this: **one product per
market** (`Vivida PRO Georgia`, `Vivida PRO UK`, `Vivida PRO Armenia`), not one
product carrying several currency prices. Follow that for the next market.
`scripts/create-am-stripe-price.mjs` has been corrected to match and is
idempotent — it now verifies the existing price rather than duplicating it.

Still unverified: an actual Armenian checkout completing end to end. Do that
once an Armenian user path exists.

---

### Step 1 — Internal link prefixing  ← blocks every later step

**Problem.** Armenian long-tail pages render from the shared route tree, so
every `<Link href="/zodiac/virgo">` on `/am/...` points at the **English** URL.
Ship a cluster without fixing this and every Armenian page leaks its visitors
into English on the first click, and Google sees an orphaned language island.

**Do this:**

1. Add to `lib/i18n/armenian-routes.ts` (or a sibling):

   ```ts
   /** Prefix an internal content href for the locale being rendered. */
   export function localeHref(path: string, locale: UserLocale): string {
     return locale === "am" ? withArmenianPrefix(path) : path;
   }
   ```

2. Thread `locale` into every shared component that emits internal content
   links, and route its hrefs through `localeHref`. Start with the ones every
   content page renders: `components/site-footer.tsx`,
   `components/smart-header.tsx`, `components/seo/popular-searches.tsx`,
   `components/seo/astrology-guide-shell.tsx`, and the cross-link rails.

3. Do **not** prefix: external URLs, `/api/*`, auth routes, or the authenticated
   app surfaces (`/dashboard`, `/account`, …). Those are single-tree and shared.

**Acceptance:** on any `/am/<slug>`, every internal `href` in the rendered HTML
either starts with `/am/`, is an authenticated/API path, or is absolute.

```bash
curl -s -H "Host: www.vividaastro.com" http://localhost:3941/am/sizmris-akhsna \
  | grep -o 'href="/[^"]*"' | sort -u
```

---

### Step 2 — Translate the content files

Mirror the English content tree into Armenian. Source of truth for tone and
structure is the `-en` file; translate from **English**, not Georgian
transliteration.

**~28 data files** (`lib/seo/*-en.ts|json`, `lib/*-en.ts`) → `*-am.ts|json`,
about 7,900 lines of TS plus 2.4 MB of JSON. Full list:

```
lib/seo/{angel-numbers,astrology-calendar,astrology-guides,chinese-zodiac,
         dreams,eclipse,eq-articles,numerology-content,rankings,
         zodiac-content}-en.ts
lib/seo/{aspect-library,house-library,interpretation-library,synastry-aspects,
         synastry-library,zodiac-content}-en.json
lib/{mbti-content,moon-phase,natal-library,report-content,report-content-pdf,
     synastry,thematic-horoscope,yearly-horoscope,zodiac-element,zodiac-pair,
     zodiac-placement,zodiac-sign}-en.ts
```

**Already written — do not regenerate, just wire up.** These exist and are
currently orphaned (zero consumers):

```
lib/seo/astrology-guides-am.ts   lib/mbti-content-am.ts
lib/tarot/deck-am.ts             lib/thematic-horoscope-am.ts
lib/synastry-am.ts               lib/zodiac-sign-am.ts   (has consumers)
```

**Pipeline.** Copy `scripts/translate-zodiac-content-en.mjs` — it already does
resume-on-rerun, `--force`, and per-entry retries against OpenRouter
(`google/gemini-2.5-flash`). `OPENROUTER_API_KEY` is present in `.env.local`.
Change the source to the `-en` file and the target to `-am`.

**Translation quality notes for the prompt:**

- Armenian astrological vocabulary, not calques: կենդանակերպ (zodiac), նատալ
  քարտեզ (natal chart), համատեղելիություն (compatibility), հորոսկոպ.
- Keep every slug, key, and JSON shape **byte-identical** to the `-en` file.
  Only human-readable string values change.
- Preserve `{placeholder}` tokens and markdown/HTML inline markup exactly.
- Do not transliterate Georgian words. The URL slugs stay Georgian; the prose
  must be natural Armenian.
- Armenian uses `։` (U+0589) as its full stop. Keep it consistent with the
  existing `app/am/**` copy, which uses it.

---

### Step 3 — Armenian view components

24 components under `components/seo/*-en.tsx` → `*-am.tsx`. Two already exist
(`natal-chart-page-am.tsx`, `zodiac-hub-am.tsx`) — copy their conventions.

Armenian chrome already exists and should be reused rather than rebuilt:
`components/am/{armenian-shell,armenian-header,armenian-footer,armenian-guide}.tsx`.

---

### Step 4 — Add the `am` branch to the content routes

**99 route files** under `app/` branch on locale. Of those, **11 use an
early-return shape that silently routes Armenian into the Georgian branch** —
find and fix all of them first:

```bash
grep -rln '!== "en"' app --include="page.tsx" | grep -v 'app/en/\|app/am/'
```

The broken shape, from `app/sizmris-akhsna/page.tsx`:

```ts
// WRONG once Armenian exists: "am" is not "en", so it returns Georgian.
if ((await getRequestLocale()) !== "en") return KA_METADATA;
```

Replace with an explicit three-way switch in both `generateMetadata` and the
default export:

```ts
const locale = await getRequestLocale();
if (locale === "am") return AM_METADATA;
if (locale === "ka") return KA_METADATA;
// …English
```

For each route, the `am` branch needs: Armenian title/description/keywords,
`alternates: localizedAlternates("/am/<slug>", "/<slug>", "am")`,
`openGraph.locale: "hy_AM"` with `images` restated, the Armenian view component,
and `locale="am"` passed to `SiteFooter`/`SmartHeader`.

JSON-LD: `articleLd()` derives `inLanguage` from the URL host via
`isEnglishHost`, which cannot distinguish `/am`. **Extend it to return `hy-AM`
for `/am` URLs** before shipping Armenian structured data, or every Armenian
page will declare itself English.

---

### Step 5 — Publish each cluster

Only after a cluster's `am` branch renders real Armenian:

1. Add its paths to `ARMENIAN_CONTENT_PATHS` (exact) or
   `ARMENIAN_CONTENT_PREFIXES` (whole dynamic cluster) in
   `lib/i18n/armenian-routes.ts`. This switches on hreflang **and** the sitemap
   at once — `alternatesFor()` and `armenianSitemap()` both read the gate.
2. Extend `armenianSitemap()` in `app/sitemap.ts` to emit the cluster's URLs
   (it currently emits only `ARMENIAN_CORE_ROUTES`).
3. Add the cluster's hub to the Armenian footer so the pages are not orphans.
   A backlink-less new language section is crawled almost entirely through
   internal links — this was the binding constraint on the English launch.

Suggested cluster order by traffic value: zodiac signs → daily/weekly/monthly
horoscopes → compatibility pairs → tarot → tests/MBTI → dreams → numerology →
angel numbers → Chinese zodiac → calendar/moon → rankings → EQ articles.

---

### Step 6 — Armenia as a market (non-SEO)

- `lib/countries.ts` already has `AM_COUNTRY_NAMES`; `lib/residence.ts` already
  resolves Armenian display names. No work expected.
- `sameCountryFirst()` ranking is country-generic — Armenia works automatically.
  **Prioritise, never filter:** a new market starts at single-digit users, and
  filtering would hand every early Armenian user an empty product.
- Confirm the Stripe account can present AMD (it is a supported presentment
  currency; settlement is unaffected).

---

## 4. Verification recipe

```bash
npx tsc --noEmit && npm run lint && npx vitest run && npm run build
```

Then start the prod server (`vivida-web-prod` in `.claude/launch.json`, port
3941) and exercise all three hosts:

```bash
H_EN="Host: www.vividaastro.com"; H_KA="Host: www.vivida.ge"

# Armenian renders Armenian, server-side
curl -s -H "$H_EN" http://localhost:3941/am/<slug> | grep -o '<html lang="[^"]*"'

# Canonical is the /am URL; hreflang is reciprocal
curl -s -H "$H_EN" http://localhost:3941/am/<slug> | grep -io 'hreflang="[^"]*" href="[^"]*"'

# Georgian is byte-unchanged
curl -s -H "$H_KA" http://localhost:3941/sitemap.xml | grep -c '<url>'   # expect 603

# Untranslated pages must NOT advertise Armenian
curl -s -H "$H_KA" http://localhost:3941/<untranslated> | grep -c 'hreflang="hy'  # expect 0
```

**Gotcha:** a local prod build emits `hrefLang` (camelCase) while deployed prod
emits `hreflang`. Grep case-insensitively or you will think hreflang vanished.

Current baseline to preserve: Georgian sitemap **603** URLs, international
sitemap **607** (598 English + 9 Armenian), all `/am` core routes 200 with
`lang="hy"`, 130 unit tests passing.

---

## 5. Definition of done

- [x] Stripe AMD price created (`prod_V5XOANYYjmLuzR`, live)
- [ ] Armenian PRO checkout completes end to end
- [ ] Every internal link on an `/am` page stays inside `/am`
- [ ] No route uses the `!== "en"` early-return shape
- [ ] `articleLd()` emits `inLanguage: "hy-AM"` on `/am` URLs
- [ ] ~590 Armenian URLs return 200 with `lang="hy"` and Armenian text
- [ ] Every Armenian URL is in the international sitemap with reciprocal hreflang
- [ ] Zero hreflang annotations point at a URL that 404s or serves another language
- [ ] Georgian sitemap still 603 URLs; Georgian and English output unchanged
- [ ] `vivida.ge/am/*` 308s to `www.vividaastro.com/am/*`
