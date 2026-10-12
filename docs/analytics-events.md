# Analytics event contract (W04)

Contract version: `v: 1` (`EVENT_CONTRACT_VERSION` in `lib/analytics.ts`).
Every product event carries `platform` (`web`), `feature`, `surface`,
`locale`, `v`. Never send user IDs, emails, names, birth data, city names,
free-text questions, or content bodies. GA4 campaign-reserved params are
stripped automatically (`stripCampaignParams`).

## Value actions → `value_action` mirror

These prove received value and feed the "valuable sessions" metric:

| event                                                  | feature       | surface(s)                     |
| ------------------------------------------------------ | ------------- | ------------------------------ |
| `compatibility_check_completed`                        | compatibility | calculator                     |
| `natal_chart_computed`                                 | natal         | calculator / onboarding result |
| `public_horoscope_read` / `daily_horoscope_read`       | horoscope     | public / dashboard             |
| `daily_ritual_completed`                               | daily         | dashboard                      |
| `tarot_reading_completed` / `tarot_followup_completed` | tarot         | tarot_reader                   |
| `ai_answer_completed`                                  | ai_chat       | chart_chat                     |
| `library_item_opened`                                  | library       | library_detail                 |
| `report_opened`                                        | report        | report_page                    |
| `relationship_insight_opened`                          | relationship  | synastry_detail (wired W12)    |
| `timing_window_opened`                                 | timing        | timing_page (wired W12)        |
| `test_completed`                                       | tests         | test surface                   |

## Funnel / diagnostic events

### Web app installation

`pwa_install_cta_viewed`, `pwa_install_cta_clicked`, `pwa_install_prompt_shown`,
`pwa_install_prompt_accepted`, `pwa_install_prompt_dismissed`, and
`pwa_appinstalled` describe the browser installation path. `pwa_standalone_opened`
counts launches and `pwa_standalone_first_open` fires once per browser storage
after the installed web app opens. They carry the shared event contract and are
consent-gated. The first-open count includes earlier installs that open after
instrumentation starts, and does not reveal whether the shortcut remains on a
device. A consented first-party `/api/pwa/open` call also records a random
browser-storage profile ID in `pwa_installation`, with first and latest open
dates; the admin PWA page displays both sources separately.

| event                                                               | when                                                                                            | key params                        |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| `onboarding_started/step_viewed/step_completed/submitted/abandoned` | wizard lifecycle; abandoned = unmount without submit + last `step_name`                         | `flow`, `step_name`               |
| `search_opened/result_selected/no_result`                           | authed header people-search; no query text, `no_result` once per distinct query                 | `result_type: people`             |
| `nav_item_selected`                                                 | sidebar / drawer / tab-bar taps                                                                 | `item` (nav key)                  |
| `library_item_favorited`                                            | favorite toggle succeeds                                                                        | `outcome: favorited/unfavorited`  |
| `library_note_saved`                                                | non-empty private note saved                                                                    | `outcome: saved`                  |
| `report_downloaded`                                                 | PDF download click                                                                              | `report_type: natal`              |
| `checkout_failed`                                                   | credit top-up could not start (no URL / HTTP / network)                                         | `reason: no_url/http_NNN/network` |
| `checkout_cancel_return`                                            | Stripe `?status=canceled` return                                                                | `outcome: canceled_at_stripe`     |
| `checkout_started/success`                                          | session created / Stripe success return                                                         | product, value, currency          |
| `purchase_completed` + `entitlement_activated`                      | **only after** `/api/billing/session` confirms the server grant, canonical paid-delivery signal | `kind: credits/premium`           |
| `report_ready`                                                      | server marks PDF ready                                                                          | server-side (worker log → W10)    |
| `empty_state_seen`                                                  | empty history / no-result states                                                                | `empty_kind` (wired per surface)  |

## Canonical vs directional

- GA4 client events are directional (consent-gated, ad-blocked).
- Canonical activation / purchase / entitlement lives server-side:
  Stripe webhook → DB ledger (`creditUnlock` mirrors are hints, not truth).
  Never re-label unknown-platform history rows as `web`.
- `first_result_viewed` stays a localStorage diagnostic, not a business metric.

## Baseline status

- Backend baseline (28d, 22 Aug–18 Sep 2026): `analysis/web-improvement-2026-09-19/usage-findings.md` + `data/usage-snapshot.json`.
- Web-only baseline (route reach, funnel completion, paywall exposure) still
  needs GA4 read-only access or an authoritative export, open item, not
  blocked on code.
