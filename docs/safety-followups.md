# Safety follow-ups

> ## 🚨 HARD GATE, photo moderation (#1) before ANY ads or growth push
>
> Unmoderated public profile photos become an **acute** risk the moment we
> pull in strangers. **Do not promote Vivida**, no Facebook/Instagram ads, no
> growth campaigns, no public launch push, until **#1 (photo moderation)** is
> built and live. This gate is non-negotiable at any size above the current
> closed group.

Captured during the low-density safety cleanup (Steps 1–3) so they aren't
forgotten. Photo moderation and the admin reports queue remain backlog items;
completed work is recorded below to prevent regressions.

## Block enforcement, RESOLVED (2026-08-26)

Block relationships are enforced server-side across website actions and API
routes:

- Feed posts and direct permalinks, comments/replies, reactions, and their
  visible aggregate counts.
- Friend lists and requests, friend/mutual-friend counts, leaderboard, search,
  discovery, people directory, matches, and direct profile access.
- In-app, push, and email actor notifications; existing actor-backed
  notifications are removed when a block is created.
- Active friendship/match and linked relationship-partner connections are
  disconnected when blocking, while private chart data remains owned by its
  creator.

## Underage accounts, RESOLVED (Step 3.1)

- `MINIMUM_AGE_YEARS = 18` (in `lib/profile-core.ts`) gates **new/edited**
  profiles at onboarding. A read-only scan exists at `scripts/scan-underage.mjs`.
- Account-level restriction now exists (`lib/restriction.ts`,
  `isAccountRestricted`): effective restriction = `users.restricted` (manual
  override) **OR** under-min-age by DOB. Enforced server-side in the shared
  cores (chat, friend send/accept, post + comment create).
  Restricted accounts keep read-only astrology; a notice shows on the dashboard.
- The **3 existing under-18 accounts** (ages 16–17) are restricted **by DOB**,
  not by the manual flag, so the restriction **auto-lifts at 18** with nothing
  to remember to clear. The `users.restricted` flag stays `false` for them and
  is reserved for non-age cases.
- Remaining: no automated re-scan/alerting for future edge cases (not needed
  while onboarding blocks under-18).

## Reports

- Reports are captured in the `report` table but there's **no admin UI**,
  review via SQL (`select * from report where status='open' order by created_at desc`)
  or `npm run db:studio`. A minimal admin queue would speed triage.
