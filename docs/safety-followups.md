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

## Underage accounts

- `MINIMUM_AGE_YEARS = 18` (in `lib/profile-core.ts`) gates **new/edited**
  profiles only. A read-only scan exists at `scripts/scan-underage.mjs`.
- As of the first scan, **3 existing accounts are under 18** (ages 16–17).
  There is **no account-level suspension/restriction mechanism yet** — a
  block is per-pair, not global. Handling these requires either a new
  account-level flag (e.g. `users.restricted`) gated in `requireUser` + the
  social write cores, or manual offboarding. Decision pending.

## Mobile API parity

- The web swipe deck / people directory are flag-gated off, but the mobile
  API endpoints `/api/v1/discover` and `/api/v1/people` still serve that data
  to the (unlaunched) Flutter app. Gate them behind the same flags before the
  app ships, or if they become reachable.

## Reports

- Reports are captured in the `report` table but there's **no admin UI** —
  review via SQL (`select * from report where status='open' order by created_at desc`)
  or `npm run db:studio`. A minimal admin queue would speed triage.
