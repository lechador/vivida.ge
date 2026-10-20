/**
 * Which email lifecycle sequences count as "must be sending".
 *
 * Pure and DB-free so it can be unit tested and imported anywhere. The health
 * check in `lib/email-health.ts` reads this list.
 *
 * The re-nudges and the original single `winback` email went silent for nine
 * weeks in August–October 2026, when the daily-horoscope blast grew to fill the
 * cron's 300s budget and starved every job sequenced behind it:
 *
 *   winback            last sent 2026-08-04 (retired, replaced by v1 steps)
 *   verify_reminder    last sent 2026-08-04
 *   profile_incomplete last sent 2026-08-18
 *
 * Win-back v1 is three distinct `email_send_log.kind` values, each with its own
 * dormancy threshold. Watch all three: step 3 can starve while step 1 still
 * delivers, and only per-kind silence catches that.
 *
 * `profile_incomplete` and the win-back steps are the highest volume and the
 * most sensitive canaries.
 *
 * Deliberately NOT watched:
 *  - `verification`: despite the name this is the ordinary signup verification
 *    email, which sends continuously. Watching it reported "healthy" for the
 *    entire outage it was meant to catch. The re-nudge is `verify_reminder`.
 *  - `birthday`: genuinely sparse (a few dozen sends a year), so any sane
 *    silence window would fire constantly.
 */
export const WATCHED_LIFECYCLE_KINDS = [
  "profile_incomplete",
  "winback_v1_s1",
  "winback_v1_s2",
  "winback_v1_s3",
  "verify_reminder",
] as const;

export type WatchedLifecycleKind = (typeof WATCHED_LIFECYCLE_KINDS)[number];
