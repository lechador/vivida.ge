# Share-to-earn credits — design and verification plan

Last updated: 22 September 2026
Status: proposal — no code yet

Reward users with credits for sharing Vivida on social networks, with a
verification layer that stands up to client-side lying. This doc is the
implementation spec: mechanics, verification tiers, economy numbers, data
model, UI surfaces, anti-abuse, phases.

## 1. Goal

Turn the already-shipped share surfaces (invite card, result share buttons)
into a measured acquisition loop: **users earn credits when their share
demonstrably reaches people**, not when they tap a button. Success signal
(from the growth doc's "utility-led social loops" P3): more qualified invites
and more attributed shared-result landings.

## 2. What exists today (repo inventory)

- Credit wallet + append-only ledger: `lib/credits.ts`, `db/tables/credits.ts`.
  The idempotent helpers this feature needs already exist:
  `grantCreditsOnce(userId, amount, reason, ref)` (advisory-lock, exactly-once),
  `earnDailyCapped`, `countUnlocks`, plus automatic `notifyCredit` rows.
- Economy constants + `CreditReason` union + ka/en labels:
  `lib/credits-config.ts` (signup 20, referral 10, monthly 5, feed post 1/wk,
  photo 3; costs: chat 2, synastry 5, tests 5, tarot 10, weekly 10, pdf 5).
- Referral engine: `lib/referral.ts` — per-user `referral_code`, `?ref=CODE`
  captured into a 30-day cookie by `components/ref-capture.tsx` (mounted in the
  root layout), attributed on signup, **paid only when the invited user
  verifies email AND fills birth data**. That gate is our ready-made
  anti-fraud gate for share rewards.
- Share UI already shipped: `components/invite/invite-card.tsx` (copy +
  `navigator.share` of `www.vivida.ge/?ref=CODE`),
  `components/mbti/mbti-share-button.tsx`,
  `components/profile/synastry-share-button.tsx` (client-rendered 1080×1920
  PNG share card), IQ/EQ/Big Five result buttons,
  `components/true-sign/true-sign-quiz.tsx`, `components/feed/post-actions.tsx`.
- Rate limiting: `lib/rate-limit.ts` (Postgres fixed-window, hashed ids).
- Guardrail: `lib/credit-economy-metrics.ts` — free-issued/spent ratio > 2.5 is
  "stop". Trailing 30 days is ~4.52× ⇒ the economy is currently in **"stop"**
  territory, which is why this faucet is capped and budgeted (§6).
- Latest migration: `drizzle/0083_*` → this feature adds `0084_*`.

**Gaps this plan closes**

1. Result-page share buttons share `/r/<id>`, `/u/<name>` etc **without the ref
   code** — those shares earn and attribute nothing today.
2. No share verification of any kind; native share-sheet resolution is not
   proof (iOS resolves on sheet dismissal, Android on target selection).
3. No data capturing that a share produced a visit or a signup.

## 3. Core design decision — pay for outcomes, not taps

A tap is unfalsifiable: any client can call the "I shared" endpoint. So the
mechanism pays along two measured paths only:

- **Tier A — click attribution (automatic, works for every platform).** Every
  earned share carries the user's ref code plus a surface tag. Real visitors
  arriving from that link are counted server-side (deduped, dwell-filtered) and
  the owner earns a small milestone reward. Covers WhatsApp, Messenger,
  Instagram DMs/Stories, Facebook, Viber — everywhere a button tap can't be
  verified but the resulting traffic can.
- **Tier B — public post verification (server-side fetch).** User pastes the
  URL of their public post; the server fetches it, checks it really exists, is
  public, contains a Vivida link, and is fresh. Works on X, Reddit, Bluesky,
  Mastodon, and Telegram public channels — no API keys, no app review.
- **Tier C — share-sheet completion / copy: 0 credits.** Kept as analytics
  events only. Nothing for tapping a button; the honest rule is stated in the
  UI copy.

Even a "fake" Tier B share is a real public post containing a Vivida link — the
cheat and the desired behavior are the same artifact. That is the design goal.

## 4. Verification matrix

| Platform                           | Verify a share?                                     | Mechanism                                                                                              | Rewarded via                           |
| ---------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| X (Twitter)                        | ✅ public posts                                     | `cdn.syndication.twimg.com/tweet-result?id=<id>` (public JSON: text, created_at, screen_name; no auth) | Tier B + Tier A                        |
| Reddit                             | ✅ public posts                                     | `<permalink>.json` (author, selftext/url, created_utc)                                                 | Tier B + Tier A                        |
| Bluesky                            | ✅ public posts                                     | `resolveHandle` → `public.api.bsky.app/xrpc/app.bsky.feed.getPostThread`                               | Tier B + Tier A                        |
| Mastodon                           | ✅ public posts                                     | `https://<instance>/api/v1/statuses/<id>`                                                              | Tier B + Tier A                        |
| Telegram                           | ⚠️ public channels only                             | `t.me/<channel>/<n>?embed=1` HTML contains link                                                        | Tier B (channel) + Tier A (DMs/groups) |
| Facebook                           | ❌ (sharer.php has no callback, Graph needs review) | —                                                                                                      | Tier A only                            |
| WhatsApp / Viber / Messenger / SMS | ❌ private                                          | —                                                                                                      | Tier A only                            |
| Instagram (DM/Story/feed)          | ❌ public fetch blocked                             | — (Phase 3: QR watermark on share cards → becomes Tier A)                                              | Tier A only                            |
| Native share sheet                 | ⚠️ weak heuristic                                   | resolved/rejected event                                                                                | 0 credits, analytics only              |

## 5. Mechanics

### 5.1 Share links

Every earned share uses `https://<host>/?ref=<code>&s=<surface>` — or the
result URL with the same query, e.g. `/r/<id>?ref=<code>&s=mbti` (the ref
capture component runs in the root layout, so any path works).

- Host by locale: `www.vivida.ge` (ka) / `www.vividaastro.com` (en) — same map
  as `app/credits/page.tsx`.
- Surfaces: `credits`, `invite`, `mbti`, `synastry`, `iq`, `eq`, `bigfive`,
  `truesign`, `tarot`, `natal`, `feed`, `stories_qr`.
- `components/ref-capture.tsx`: also read `s`, store it in a `vivida_share`
  cookie (30 d), and fire the click beacon (§5.2). Validate both params
  (`/^[a-z0-9]{3,16}$/i` for ref, `/^[a-z0-9_-]{1,24}$/i` for s).
- Result-page share buttons only get the personal link when signed in (pass
  the code down from the server page; signed-out shares stay as they are).

### 5.2 Tier A — click verification (server-side counting)

- Beacon: `POST /api/share/click` fired from `RefCapture` **after ~8 s dwell**
  (filters back-button bounces and fetch-only bots). Body: `{ref, s, path}`.
- Server: resolve owner by code; compute
  `visitorHash = sha256(ip + user-agent + daily-salt)` (salted with an env
  secret, never stored raw — same posture as `lib/rate-limit.ts`); insert into
  `share_click` with `unique(owner_user_id, visitor_hash, day_bucket)` so a
  visitor counts once per day; drop the owner's own signed-in session; per-IP
  rate limit (`share_click_ip`, 60/h).
- Milestones: each **5 distinct visitor-days this week = +1 credit**, credited
  with `grantCreditsOnce(..., ref = 'share-click:{userId}:{weekKey}:{n}')`
  (same UTC week-key convention as the feed reward — `lib/credit-economy.ts`
  `rewardWeekKey()`). Max +2/week, +6/month.
- Response returns a `clickId`; the client stores it in `vivida_share` so a
  later signup can stamp `converted_user_id` on the click row (Phase 1.5) —
  that's the "shared-result landings → qualified invites" funnel.

### 5.3 Tier B — public post verification

Flow: on `/credits` (and result pages) a "დაპოსტე საჯაროდ — ჩასვი ლინკი"
field → `POST /api/share/claim` → server fetches and verifies:

1. Host allow-list; extract post id. Reject unknown hosts with honest copy.
2. Fetch with timeout (5 s), browser-like UA, no cookies:
   - X: `cdn.syndication.twimg.com/tweet-result?id=<id>&token=a`
   - Reddit: `https://www.reddit.com/comments/<id>.json`
   - Bluesky: resolve → `getPostThread` (`record.text`)
   - Mastodon: status JSON (`content`)
   - Telegram: `t.me/<channel>/<n>?embed=1` (public channels only)
   - Facebook / Instagram: not fetchable → rejected with "ამ პლატფორმაზე
     ავტომატურად ვერ ვამოწმებთ" + pointer to Tier A.
3. Checks: fetched text/html contains `vivida.ge` or `vividaastro.com`;
   created within the last 7 days; post not already claimed anywhere
   (`unique(platform, post_id)`, first claim wins); claimer passes the earn
   gate (**verified email + birth data — identical to the referral
   qualification gate** — + account ≥ 24 h old); rate limit 5 claims/day/user,
   20/day/IP.
4. Grant +4 via `grantCreditsOnce(..., ref = 'share-post:{platform}:{postId}')`;
   store evidence: fetched excerpt hash, author handle, post created_at.
5. Rejections return a reason code (`not_public`, `no_link`, `too_old`,
   `already_claimed`, `unknown_host`, `fetch_failed`) for UI + metrics.
   A rejection is not a permanent ban — retry with another post is fine.

Residual risk (accepted): pasting a stranger's post that mentions Vivida.
Mitigations: first-claim-wins, low ceiling, rate limits, author recorded for
manual review, Phase 3 OAuth binding (own the handle → proof of authorship),
and an admin revoke action that reverses the grant.

### 5.4 Phase 2 — 48 h settlement recheck

`app/api/cron/share-recheck/route.ts`: claims for X/Reddit/Bluesky/Mastodon/
Telegram are stored `pending` with `settle_after = now + 48 h`; the cron
re-fetches, grants when still live, rejects (`deleted`) when gone. Phase 1
grants immediately (deleted-post farming costs a real public post with our
link, so the exposure is small); settlement becomes the default in Phase 2.

## 6. Rewards, caps, and the credit-economy guardrail

| Action                                       | Credits | Caps                                       |
| -------------------------------------------- | ------- | ------------------------------------------ |
| Verified public post (Tier B)                | +4      | 1 per platform/week, 2/week total, 8/month |
| 5 distinct visitors from your links (Tier A) | +1      | +2/week, +6/month                          |
| Share-sheet tap / copy (Tier C)              | 0       | analytics only                             |

- **Global monthly budget kill-switch**: `SHARE_REWARD_MONTHLY_BUDGET`
  (default 400 credits). Exhausted → grants stop and the UI shows
  "ამ თვის ბიუჯეტი ამოიწურა". Budget is checked before every grant.
- New ledger reasons `earn_share_post` / `earn_share_click` count as
  `free_issued` in `freeCreditRatio` (classification is "purchase vs
  everything else"), so the admin guardrail card will include them — give the
  growth page a share-attributed split so economy decisions stay honest.
- Math: trailing 30 d issuance ≈ 15k vs spend ≈ 3.3k (ratio 4.52 → "stop").
  Realistic adoption (5 % of 564 MAU × ~6 credits/mo) ≈ **150–250 credits/mo,
  under 2 % of current issuance**; worst case is hard-capped by the 400 budget.
  A verified post (4) costs 2.5× less than a test unlock (5+ credits) and 2.5×
  less than the referral payout (10 for a verified activated signup) — shares
  pay for reach, the referral engine keeps paying for activation.
- Deliberate non-goal: no reward for unverifiable taps, so sharing spam has no
  direct ROI; the 8 s dwell filter further cuts bounce-spam.

## 7. Data model (drizzle → migration 0084)

```ts
share_click:  id, ownerUserId FK→users, surface text, visitorHash text,
              dayBucket date, path text, createdAt
              unique(ownerUserId, visitorHash, dayBucket)

share_claim:  id, userId FK→users, platform text,
              method text ('post' | 'click'),
              postUrl?, postId?, authorHandle?,
              status text ('granted' | 'pending' | 'settled' | 'rejected' | 'revoked'),
              rejectReason?, evidence jsonb?, creditedAt?, settleAfter?, createdAt
              unique(platform, postId) where postId not null
              index(userId, createdAt)
```

`CreditReason` additions (with ka/en labels in `lib/credits-config.ts`):
`earn_share_post` ("გაზიარება სოცქსელში" / "Social share post"),
`earn_share_click` ("ვიზიტორები გაზიარებიდან" / "Visitors from your share").

## 8. API / server surface

- `POST /api/share/click` — beacon; returns `{ clickId }`.
- `POST /api/share/claim` — verify + grant (rate-limited, earn-gated).
- (P2) `app/api/cron/share-recheck/route.ts`.
- `lib/share.ts` (new) — one module for: link building, visitor hashing,
  milestone math, claim pipeline. Fetchers take an injected `fetch` so tests
  run on fixtures without network (repo pattern: vitest, `tests/*.test.ts`).

## 9. UI surfaces

- **`/credits`**: new `ShareEarnCard` (above `InviteCard`, id `#share`):
  platform share buttons (X, Facebook, Telegram, WhatsApp, copy, native
  share), this week's stats (visitors, verified posts, credits earned), the
  paste-verify input with live states (checking → verified +4 / rejected +
  reason / already claimed), and honest copy for unverifiable platforms:
  "Facebook-სა და WhatsApp-ზე ავტომატურად ვერ ვამოწმებთ — კრედიტები მოდის
  იმ ვიზიტორებზე, რომლებიც შენი ლინკიდან შემოვლენ."
- **Result pages** (MBTI, synastry, IQ/EQ/Big Five, true-sign, tarot, feed):
  share buttons switch to the personal link when signed in; a compact
  "+4 კრედიტი" badge next to them deep-links to `/credits#share`. This is
  where the volume comes from — the trigger moment is right after a result.
- Notifications: automatic via `notifyCredit` with the new labels.
- ka/en copy everywhere (existing `locale` prop pattern); no new i18n system.

## 10. Anti-abuse checklist

| Vector                      | Mitigation                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Self-clicking               | owner session excluded; visitor-hash dedupe/day; caps                                                           |
| Click bot farm              | 8 s dwell beacon (JS + cookies), per-IP rate limit, unique-visitor counting, weekly/monthly caps, global budget |
| Fake accounts               | earn gate = verified email + birth data (same as referrals) + ≥ 24 h account age                                |
| Reposting a stranger's post | global unique post, first-claim-wins, rate limits, admin revoke, P3 handle binding                              |
| Post deleted after payout   | P2 48 h settlement recheck                                                                                      |
| Economy inflation           | per-user caps + monthly budget + separate ledger reasons + guardrail split                                      |

## 11. Admin & analytics

- `lib/growth-metrics.ts` + `/admin/growth` "გაზიარებები" section: claims by
  platform (granted / rejected reasons), distinct visitors from shares,
  share → signup conversion, credits issued by share reasons vs budget, top
  surfaces by clicks.
- Analytics events (into `ANALYTICS_EVENT` map, aggregate params only per the
  event contract): `share_intent_opened` (platform, surface),
  `share_claim_submitted`, `share_claim_verified`,
  `share_claim_rejected` (reason), `share_reward_granted` (kind).

## 12. Phases

- **P1 — MVP (~2–3 days)**: tables + migration 0084; `lib/share.ts`; click
  beacon + dedupe + caps; claim API with the five fetchers; `ShareEarnCard` on
  `/credits`; result-page share links get `ref`+`s`; notifications; analytics
  events; tests (fetcher fixtures with mocked fetch, milestone math, earn
  gate); full gate (`npm run check`, `npx vitest run`, `npm run build`).
- **P1.5 (+0.5 day)**: `vivida_share` cookie → click → signup conversion
  stamping; growth metrics numbers live.
- **P2 (~1–2 days)**: 48 h settlement cron; budget kill-switch UI; admin
  revoke; rejection UX polish.
- **P3 (optional)**: X/Telegram OAuth handle binding (authorship proof,
  auto-post); ref-QR watermark on the 1080×1920 share cards so Instagram
  Stories become click-attributed; reward-size A/B via the experiments table.

## 13. Open decisions (defaults proposed — approve or tune)

1. Reward sizes: **+4** per verified post, **+1 per 5 visitors**; caps
   **2/wk** and **8/mo** (posts), **+2/wk** and **+6/mo** (clicks).
2. Earn gate: verified email + birth data + 24 h account age _(recommended —
   same as the referral qualification gate)_.
3. P1 ships immediate grants with P2 settlement later, or wait and ship
   settlement from day one? _(recommended: immediate first — faster signal,
   low exposure.)_

## 14. Files to touch

- **db**: `db/tables/credits.ts`, `db/schema.ts`, generated `drizzle/0084_*.sql`
- **lib**: `lib/share.ts` (new), `lib/credits-config.ts`, `lib/credit-economy.ts`
  (week key reuse), `lib/growth-metrics.ts`
- **api**: `app/api/share/click/route.ts`, `app/api/share/claim/route.ts`,
  (P2) `app/api/cron/share-recheck/route.ts`
- **ui**: `components/share/share-earn-card.tsx` (new), `components/ref-capture.tsx`,
  `components/invite/invite-card.tsx` (link + surface tag),
  `components/mbti/mbti-share-button.tsx`, `components/iq/iq-result.tsx`,
  `components/eq/eq-result.tsx`, `components/big-five/big-five-result.tsx`,
  `components/true-sign/true-sign-quiz.tsx`,
  `components/profile/synastry-share-button.tsx`,
  `components/feed/post-actions.tsx`, `app/credits/page.tsx`,
  `app/admin/growth/page.tsx`
- **tests**: `tests/share-verify.test.ts` (fetchers on fixtures),
  `tests/share-milestones.test.ts` (caps + exactly-once),
  `tests/share-gate.test.ts` (eligibility)
