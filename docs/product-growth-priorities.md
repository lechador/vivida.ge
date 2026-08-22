# Vivida retention and monetization plan

Last updated: 22 August 2026

This is the implementation order for improving activation, retention, and
customer spend. It combines the repository and live-product audit with
aggregate production baselines. The order is intentional: measure the full
value and payment loop first, create a repeat-use habit second, and expand paid
inventory only after those foundations are measurable.

## Measured baseline

- 981 registered users; 564 MAU, 202 WAU, and 21 DAU at extraction.
- DAU / MAU is 3.7%.
- 73.7% of the measured signup cohort completed a birth profile, while 31.8%
  returned during days 1–7.
- 48.2% of MAU were active on one day only; 8.2% were active on 8+ days.
- 15,273 free credits were issued in the trailing 30 days versus 3,075 spent,
  a 4.97× supply-to-spend ratio.
- Tarot and natal PDF reports generated 79.5% of credit consumption.
- Two users have made lifetime credit purchases and one PRO subscription was
  active at extraction. Those counts can overlap and are not summed as unique
  payers.
- Early AI chart chat and tarot usage correlate with stronger later retention,
  but both samples are small and should guide experiments rather than forecasts.

## Priority order

| Priority | Initiative | Why now | Success signal |
| --- | --- | --- | --- |
| P0 — shipped 2026-08-22 | Full value and paywall measurement | We can see some value actions, but not the complete exposure → selection → shortfall → checkout → unlock journey. | Reliable value, paywall, D1/D7/D30, and payer-conversion baselines. |
| P0 — shipped | Preserve calculator data through signup/onboarding | The public calculator already collects the exact birth inputs onboarding asks for again. | Higher calculator-to-profile completion and shorter onboarding time. |
| P0 — shipped 2026-08-22 | First onboarding “aha” result | New users now see their personalized Big Three immediately, then receive tracked, prefilled AI question recommendations. | Higher first-value completion, recommendation click-through, and D1 return. |
| P0 — shipped 2026-08-22 | Credits vs PRO comparison | Public natal promos, natal and first-free-tarot result states, and the Credits hub now explain one-time credits versus monthly unlimited PRO before a balance shortfall. | Higher monetization-choice click-through and payer conversion before users reach zero credits. |
| P1 | Daily “Today” ritual | Existing daily content does not yet create a compact progress loop with a clear reason to return tomorrow. | Higher DAU/MAU, active days per MAU, and D7 retention. |
| P1 | Contextual paywalls and credit-economy experiments | Free supply materially exceeds spend and most active wallets are far from a purchase decision. | Higher paywall-to-checkout and 30-day payer conversion without lower retention. |
| P1 | Reading history and journal | Tarot, forecasts, and AI insight do not accumulate into durable personal value. | Higher weekly repeat use and history reopen rate. |
| P2 | Paid report store and bundles | Demand is concentrated in tarot and natal PDFs, but the paid catalog is narrow. | Higher ARPPU and report attach rate. |
| P2 | Recurring relationship experience | Synastry is mainly a static, one-time unlock. | Higher partner invites and weekly relationship-feature retention. |
| P2 | Annual PRO, gifting, and bundles | Monetization is limited to monthly PRO, credits, and one targeted quarterly offer. | Higher subscription conversion, prepaid revenue, and gift purchases. |
| P2 | Personalized return channels | Push/email exist, but timing, channel, and destination are not user-controlled. | Higher notification-to-value completion with stable opt-out rates. |
| P2 | Next-best-action content graph | Long pages offer many equal choices instead of one relevant continuation. | More meaningful actions per valuable session. |
| P3 | Utility-led social loops | Sharing a chart or compatibility result has value even at low community density. | More qualified invites and shared-result landings. |

## 90-day roadmap

### P0 — foundation and activation (weeks 0–2)

1. Instrument the full value and paywall funnel. Add events for first result
   viewed, recommendation clicked, paywall viewed, product selected,
   insufficient credits, checkout success, credit unlock, PRO exposure, and
   experiment assignment. Build cohort views for D1, D7, D30, and 30-day payer
   conversion.
2. **Shipped 2026-08-22:** Put a first “aha” moment into onboarding. After birth
   details, show a concise personal result plus suggested AI questions. The
   result now reveals Sun, Moon, and Rising, preserves feature-specific return
   paths, and prefills questions without sending or spending automatically.
3. **Shipped 2026-08-22:** Surface monetization before a short wallet. Public
   natal promos, natal and first-free-tarot result states, and the Credits hub
   now compare one-time credits with monthly unlimited PRO using market-specific
   prices and tracked selection links.
4. Test future signup-credit issuance on new cohorts. Compare the current 20
   credits with a staged grant such as 10 immediately plus 5 after the first
   return. Preserve every existing balance.

### P1 — repeat-use loop and conversion (weeks 2–6)

5. Build a “Today” home module with one insight, one recommended action,
   progress/streak state, next refresh time, and a deep link into paid depth.
6. Add durable tarot, AI insight, and forecast history with a personal journal.
7. Make paywalls contextual: preview the locked value, explain the unlock,
   recommend a pack, compare PRO, and return to the content after checkout.
8. Make the credit system legible with a detailed ledger, next-unlock progress,
   and earned rewards tied to meaningful behavior rather than passive issuance.

### P2 — expand high-intent paid inventory (weeks 6–12)

9. Launch annual forecast, relationship, career, and timing reports plus two-
   and three-report bundles.
10. Turn synastry into a recurring experience with weekly partner/friend
    updates, shared prompts, relevant alerts, and mutual invite links.
11. Test annual PRO at an effective 8–10 monthly payments, gift credits/reports,
    and relationship bundles.
12. Persist experiment eligibility, assignment, exposure, and outcome for every
    onboarding, paywall, notification, and pricing test.

## Event contract for the value and paywall funnel

All events are aggregate and non-identifying. Never include email, name, user
ID, birth details, location, free text, messages, or profile content.

| Event | Fire when | Required low-cardinality properties |
| --- | --- | --- |
| `first_result_viewed` | The browser sees its first completed Vivida result | `product`, `surface` |
| `recommendation_clicked` | A curated next-best-action link is selected | `placement`, `destination`, `product` |
| `paywall_viewed` | A credit, report, pack, or PRO gate becomes visible | `product`, `surface`; add `cost`, `balance_bucket`, or `offer` when applicable |
| `product_selected` | The visitor selects a paid product or unlock | `product`, `surface`, `payment_model`; add price/currency or credit cost |
| `insufficient_credits` | A rendered balance check or server response blocks an unlock | `product`, `surface`, `cost`, `balance_bucket` when known |
| `checkout_started` | Stripe returns a valid checkout URL | `product`, `value`, `currency` |
| `checkout_success` | A verified checkout session is read on the return page | `product`, `kind`, `value`, `currency` |
| `credit_unlock` | The server confirms a credit-backed unlock or paid generation | `product`, `surface`, `cost`, `outcome` |
| `pro_exposure` | An eligible visitor sees a standard or promotional PRO offer | `product`, `placement`, `value`, `currency`; add `offer` when applicable |
| `experiment_assigned` | Eligibility logic assigns a stable variant | `experiment`, `variant`, `eligibility` when applicable |

Use `surface`, `placement`, `destination`, and `widget` instead of GA4-reserved
campaign parameter names such as `source`, `medium`, and `campaign`.

Implementation status: the canonical events live in `lib/analytics.ts`; the
current natal, daily, recommendation, credit-gate, report, tarot, credit-pack,
PRO, and verified checkout-return surfaces emit them. The admin app exposes
database-backed weekly cohorts at `/growth`. Future experiments must call the
shared assignment helper when eligibility selects a stable variant.

## Cohort and conversion definitions

- **D1 return:** an eligible signup with activity during the rolling 24–48
  hours after account creation.
- **D7 return:** an eligible signup with any activity from 24 hours through the
  end of day 7 after account creation.
- **D30 return:** an eligible signup with any activity from 24 hours through
  the end of day 30 after account creation.
- **30-day payer conversion:** eligible signups with either a credit purchase
  or a PRO subscription start during their first 30 days / eligible signups.
- Each percentage uses its own matured denominator. A cohort too young for D30
  must show no D30 rate rather than counting immature users as not retained.
- Weekly cohort tables are the operating view. Aggregate cards are useful only
  when their eligibility windows match the cohort table.

## Missing or underdeveloped functionality

- Personal reading history, saved insights, bookmarks, and user notes.
- Configurable reminders for transits, relationships, forecasts, and calendar
  export/sync.
- A recurring relationship experience rather than static synastry alone.
- A broader paid report store and bundles.
- Gift credits, gift reports, and partner/seasonal packages.
- A standard annual PRO plan.
- Persistent experiment assignment/exposure data and complete paywall analytics.
- A coherent visible streak, challenge, or collection loop.
- Offline PWA content caching; the current service worker is push-focused.

## Provisional 90-day targets

- Week-1 return: 31.8% → at least 40%.
- DAU / MAU: 3.7% → 8–10%.
- MAU active on 8+ days: 8.2% → 15%.
- Push adoption among MAU: approximately 6.4% → at least 15%.
- New-user 30-day payer conversion: establish a complete baseline, then target
  2–3% while monitoring retention, refunds, and support complaints.

Rebaseline after four complete weeks of the expanded event contract. Current
behavior correlations are observational, activity logging does not represent
every feature table equally, and small segments must not be treated as causal.

## P0 measurement foundation

### North-star diagnostic

**Valuable session rate** = sessions containing at least one `value_action` /
all sessions.

`value_action` is emitted automatically alongside these completed-value events:

- `compatibility_check_completed`
- `natal_chart_computed`
- `public_horoscope_read`
- `daily_horoscope_read`
- `tarot_reading_completed`
- `test_completed`

A pageview, signup click, dashboard mount, or push impression is deliberately
not a value action.

### Supporting funnels

| Funnel | Events |
| --- | --- |
| Home acquisition | `home_primary_cta_click`, `compatibility_check_completed`, `compatibility_share` |
| Free natal tool | `natal_chart_computed`, `natal_chart_shared`, `register_click`, `horoscope_email_subscribed` |
| Email signup | `sign_up_submitted`, `sign_up_verified` |
| Onboarding | `onboarding_started`, `onboarding_prefilled`, `onboarding_step_viewed`, `onboarding_step_completed`, `onboarding_submitted` |
| Daily horoscope | `daily_horoscope_viewed`, `daily_horoscope_read` |
| Anonymous horoscope | `public_horoscope_read` by `sign` and `view` |
| Push opt-in | `push_prompt_viewed`, `push_enabled`, `push_permission_denied`, `push_dismissed` |

### KPI definitions

- **D1/D7 activated retention:** users who complete a natal profile and return
  on day 1/day 7 to complete a value action. Use the database
  `profile_completed` reputation event for the durable logged-in cohort and
  GA4 cohorts as the directional cross-check.
- **Daily value completion:** unique signed-in users with
  `daily_horoscope_read` / `daily_horoscope_viewed`.
- **Anonymous horoscope completion:** `public_horoscope_read` / horoscope detail
  page views.
- **Owned-channel conversion:** `horoscope_email_subscribed` or `push_enabled` /
  eligible prompt views.
- **Activation completion:** completed natal profiles / signup starts, segmented
  by Google and email paths.

### Guardrails

- Push permission denial and prompt dismissal rate.
- Email unsubscribe rate.
- Signup verification and onboarding abandonment.
- Core Web Vitals, especially LCP, INP, and CLS on mobile.
- Do not send PII: no email, name, user ID, birth details, location, free text,
  messages, or profile content in analytics event parameters.

## Baseline and decision cadence

Collect at least 14 complete days before setting a firm target so weekday mix
does not dominate the result. Review weekly, segmented by first value action
(natal chart, horoscope, compatibility, test, tarot) and acquisition channel.

After the baseline, run one primary experiment at a time. The next experiment
should preserve public-calculator birth data through registration and compare:

- calculator-to-signup conversion;
- signup-to-profile completion;
- median onboarding completion time;
- D1 activated retention;
- error and abandonment guardrails.

## P0 calculator-to-onboarding continuity

After a successful public natal calculation, the validated date, optional time,
and selected place are kept in the current tab's `sessionStorage` for at most
two hours. Calculator signup and login links return the user to onboarding,
which consumes the draft as a prefill. The draft is cleared when a saved report
is reached, when an existing profile is detected, when it expires, or when its
runtime shape is invalid.

No birth or location values are included in analytics. The only prefill event
parameters are the draft origin and whether an exact time was supplied.
