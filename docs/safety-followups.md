# Safety follow-ups (deferred, not yet built)

Captured during the low-density safety cleanup (Steps 1–3) so they aren't
forgotten. None of these are built yet — this is a backlog, not a spec.

## Block-enforcement gaps

Blocks are enforced server-side in the high-traffic vectors (DMs via
`canMessage`, friend requests via `sendFriendRequestCore`, feed posts via
`listFeedPage`, and the `/u/[username]` profile guard). Still leaking the
blocked user in lower-traffic surfaces:

- **Comments** — a blocked user's comments still render under a visible post
  (`listComments` in `lib/feed-core.ts` is not block-filtered).
- **Friend lists & mutual-friend counts** — `countFriends`,
  `countMutualFriends`, `listMutualFriendsPreview` don't exclude blocks.
- **Leaderboard** (`/leaderboard`) — blocked users still appear in rankings.
- **Notifications** — actions a blocked user can still take on shared content
  (e.g. reacting to / commenting on your post) can still emit notifications.
- **Discovery / people directory** — currently flagged OFF, but if
  `SOCIAL_FEATURES.swipeDeck` / `peopleDirectory` are re-enabled, their queries
  (`getDiscoveryFeed`, `listPeople`) need block filtering added.

## Underage accounts — RESOLVED (Step 3.1)

- `MINIMUM_AGE_YEARS = 18` (in `lib/profile-core.ts`) gates **new/edited**
  profiles at onboarding. A read-only scan exists at `scripts/scan-underage.mjs`.
- Account-level restriction now exists (`lib/restriction.ts`,
  `isAccountRestricted`): effective restriction = `users.restricted` (manual
  override) **OR** under-min-age by DOB. Enforced server-side in the shared
  cores (chat, friend send/accept, post + comment create) → mobile inherits it.
  Restricted accounts keep read-only astrology; a notice shows on the dashboard.
- The **3 existing under-18 accounts** (ages 16–17) are restricted **by DOB**,
  not by the manual flag — so the restriction **auto-lifts at 18** with nothing
  to remember to clear. The `users.restricted` flag stays `false` for them and
  is reserved for non-age cases.
- Remaining: no automated re-scan/alerting for future edge cases (not needed
  while onboarding blocks under-18).

## Mobile API parity

- The web swipe deck / people directory are flag-gated off, but the mobile
  API endpoints `/api/v1/discover` and `/api/v1/people` still serve that data
  to the (unlaunched) Flutter app. Gate them behind the same flags before the
  app ships, or if they become reachable.

## Reports

- Reports are captured in the `report` table but there's **no admin UI** —
  review via SQL (`select * from report where status='open' order by created_at desc`)
  or `npm run db:studio`. A minimal admin queue would speed triage.
