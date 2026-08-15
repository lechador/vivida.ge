# Vivida product growth priorities

This is the implementation order for improving activation, valuable session
depth, and daily retention. The order is intentional: measure the value loop
first, remove activation friction second, then invest in habit mechanics.

## Priority order

| Priority | Initiative | Why now | Success signal |
| --- | --- | --- | --- |
| P0 — shipped | Measurement foundation | We cannot distinguish passive pageviews from sessions where a user received value. | Reliable `value_action`, activation-funnel, and return-channel baselines. |
| P0 — shipped | Preserve calculator data through signup/onboarding | The public calculator already collects the exact birth inputs onboarding asks for again. | Higher calculator-to-profile completion and shorter onboarding time. |
| P2 | Personalized return channels | Push/email exist, but timing, channel, and destination are not user-controlled. | Higher notification-to-value completion with stable opt-out rates. |
| P2 | Next-best-action content graph | Long pages offer many equal choices instead of one relevant continuation. | More meaningful actions per valuable session. |
| P3 | Utility-led social loops | Sharing a chart or compatibility result has value even at low community density. | More qualified invites and shared-result landings. |

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
