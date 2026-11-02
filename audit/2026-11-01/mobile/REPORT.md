# Mobile responsiveness audit — vivida.ge

**Date:** 2026-11-01
**Scope:** every App Router page (public + signed-in), both locales, phone and tablet widths.
**Production database:** used only to render public pages; no account, profile, credit, or signup mutations were performed. Signed-in flows were audited against a disposable local Postgres seeded with test users.

## Result

| Surface                 | Routes |       320 px |       360 px |       390 px |        768 px |       1280 px |
| ----------------------- | -----: | -----------: | -----------: | -----------: | ------------: | ------------: |
| Public (ka + `/en`)     |    155 | ✅ 0 defects | ✅ 0 defects | ✅ 0 defects | ✅ 0 (sample) | ✅ 0 (sample) |
| Signed-in (free, ka)    |     36 | ✅ 0 defects | ✅ 0 defects | ✅ 0 defects | ✅ 0 (sample) | ✅ 0 (sample) |
| New user, no birth data |      9 | ✅ 0 defects | ✅ 0 defects | ✅ 0 defects |             — |             — |
| Premium (ka)            |      9 | ✅ 0 defects | ✅ 0 defects | ✅ 0 defects |             — |             — |
| Premium (English host)  |      9 | ✅ 0 defects | ✅ 0 defects | ✅ 0 defects |             — |             — |

“Defect” = horizontal page scroll, clipped/cut-off text, content escaping the viewport, or a form control that would trigger iOS focus-zoom (<16 px).

Final sweeps: **155/155 public routes clean at 320, 360 and 390**, **36/36 signed-in routes clean at 320, 360 and 390**, tablet/desktop samples clean, 0 runtime errors.

## What was broken and fixed

### Global chrome

- **Signed-in header overflowed at every phone width.** At 414 px the avatar was already off-screen; at 320 px the notification badge sat 56 px outside the viewport. The wordmark now drops below 380 px, the credits pill below 430 px (credits remain in the account menu), and the header gap is compacted. Search stays available at all phone/tablet widths.
- **Public header’s second row was cramped** at 390/320: coordinates wrapped and the moon-phase label was truncated. Coordinates are hidden on phones; the drawer trigger and language switch keep single-line layouts with real hit areas.
- **Desktop navbar appeared at 768 px** (public and signed-in) before it could fit, expanding the page to ~849 px. Moved the nav breakpoint to `lg`; phone/tablet navigation stays on the drawer/tab bar.
- **Footer legal links were clipped at ≤360 px** (“კონფიდენციალურობა”), and the footer row overflowed at 768 px. Tighter mobile gaps, 13 px labels, wrapping fallback, and the legal column spans both columns on the narrowest phones. The row layout now starts at `lg`.
- **Mobile bottom tab bar** was 74 px tall while page padding assumed 72 px. Clearance is now 76 px; fixed FAB/privacy controls follow the same measure.
- **`100vh` pages** were taller than the visible iOS viewport. `.min-h-screen` / `.h-screen` now resolve to `100dvh` (unlayered, so it beats the utility).
- **Privacy re-open button** was a 32 px target; now 40 px.

### Inputs / iOS zoom

Every text field, select, and textarea that computed below 16 px on mobile was bumped to 16 px through tablet widths (14 px returns at desktop): home compatibility selects, tarot question, dream interpreter + symbol search, feed composer/editor/comments, chat composer, library search/note, people search, account selects, numerology date, readings search, inline birth-date prompt.

### Layout overflow (min-content / grid-item) bugs

- **`/friends`** rows were **950 px wide** at 390 px (displayed edge-to-edge but clipped) — friends list items and the compatibility chip needed `min-w-0` / narrow-phone hiding.
- **`/tests`** cards expanded to 438 px inside a 358 px grid; fixed with `min-w-0`.
- **`/zodiac/datit`** date table clipped its third column at 320 px; compact cells on phones and the “element” column folds under the sign until 380 px.
- **Compatibility calculator** cards (home, `/tavsebadoba`, `/zodiac/tavsebadoba`) expanded to 292 px in a 224 px grid; both cards now shrink.
- **`/zodiac/reitingebi`** cards expanded to 439 px because a `truncate` title’s min-content leaked through the grid item.
- **`/taro/[card]`** prev/next links overflowed at 320 px.
- **`/u/[username]`** profile action buttons overflowed; actions stack under the handle on phones and wrap.
- **`/report`** big-three cards expanded past their column and clipped the interpretation paragraph; the natal wheel’s AC/DC/MC/IC labels sat outside the SVG viewBox.
- **Big Five radar** labels (“კეთილსინდისიერება”) were cut off by the SVG edge; axis labels are abbreviated (full names remain in the score bars) and the radar radius was reduced.
- **`/account`** gender toggle and reminder frequency select overflowed; they stack on phones.
- **`/ask`** memory button and **`/credits`** invite stats overflowed at 320 px; memory collapses to an icon, invite stats wrap.
- **Dashboard** article recommendations clipped a category at 768 px; two columns until `lg`.

### 320 px typography and buttons

Long Georgian words are wider than a 320 px content column at desktop font sizes. Eight page headings (`privacy`, houses, love/daily/yearly horoscopes, compatibility, calendar, dates, houses hub) and the home hero step down one size below 380 px. Two long CTAs (“ნატალური რუკის გამოთვლა”, “გაიგე შენი ტიპი…”) now wrap/full-width on small phones instead of clipping.

### Functional bug found during the signed-in sweep

- **`/feed`, `/people`, and dashboard suggestions returned 500** for every viewer without a residence country: `sameCountryFirst()` emitted a bare boolean constant, and Postgres rejects `ORDER BY false` (“non-integer constant in ORDER BY”). The fallback is now `(false)::boolean`, which is valid in both `SELECT` and `ORDER BY`. This was reproducible with a normal seeded user and is unrelated to mobile — it would have affected desktop too.

## How it was verified

- Playwright sweeps at **390×844**, **360×780** and **320×568** for every route, plus **768×1024**, **1280×900** samples.
- Per page: attempted horizontal scroll, underlying overflow with body clipping disabled, text-node clipping vs viewport and clip ancestors, tap-target sizes, input font sizes, fixed overlays, horizontal scrollers, tab-bar clearance, console/page errors.
- Signed-in flows with real Auth.js session cookies against a **local Postgres** seeded with test users/profiles/posts/messages/results. English signed-in pages were checked through the real `vividaastro.com` host mapping.
- Overlays checked at 320/390: consent sheet, public almanac drawer, signed-in menu drawer, notifications, chart-zoom dialog, onboarding.
- Commands: `npm run lint` (0 warnings), `npm run typecheck`, `npm test` (**137 files / 779 tests passed**, 8 skipped), `npm run check:env`, `npm run build` (687 static pages, 0 errors).

## Notes / residual risks

- Many inline text links remain 16–17 px tall. They meet the WCAG 2.5.8 _spacing_ exception and were left as-is to avoid inflating editorial layouts; primary controls (language switch, privacy, CTA buttons) were enlarged.
- Tests ran in Chromium with iPhone/Android viewports, not real Safari. iOS-specific issues were addressed at the CSS level (16 px inputs, `dvh`, safe-area padding).
- 320 px is the narrowest verified width; 280 px foldable cover screens were not part of this pass.
- Pre-existing, unrelated: a hydration mismatch in the dashboard loading SVG (numeric attribute formatting) and an IQ-quiz option-order mismatch. Neither changes page layout after hydration.
- Next’s Turbopack dev cache grew to ~9 GB during the audit and crashed once; clearing `.next/dev` resolved it. This is a dev-server issue, not application code.

## Artifacts

- `audit/2026-11-01/mobile/REPORT.md` — this report.
- `results-390-final.json`, `results-360-final360.json`, `results-320-final.json` — all public routes.
- `results-*-nino-final.json`, `results-360-nino360-final.json`, `results-*-newbie-final.json`, `results-*-ana-final.json`, `results-*-ana-en-final.json` — signed-in surfaces.
- `overlays.json` — consent/drawer/notification/chart-zoom checks.
- `sweep.mjs` — reusable Playwright sweep (`--widths`, `--routes`, `--cookies`, `--label`).
- `build-routes.mjs`, `seed-local.mjs`, `auth-cookies.mjs`, `overlays.mjs` — audit harness.
- `screenshots/` — curated before/after screenshots and overlay captures (54 images).
- Session cookie files were deleted after the audit; `auth-cookies.mjs` regenerates them from `.env.local` when needed.
