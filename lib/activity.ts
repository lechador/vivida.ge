import { and, eq, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { profiles, userActivityDays, users } from "@/db/schema";
import { awardReputation, RepSubject } from "@/lib/reputation";

/**
 * Best-effort "user was active today" record.
 *
 * Called via Next 16's `after()` from requireUser() so it never blocks
 * page render — if the DB write fails or the lookup is slow, the page
 * has already streamed. Idempotent: at most one row per (user, day),
 * `onConflictDoNothing` makes repeat visits within the same local day
 * a single SELECT roundtrip on the unique-constraint check.
 *
 * `dateLocal` is the user's wall-clock date (from profile.timezone), so
 * the admin heatmap reads the same day the user actually lived. Falls
 * back to UTC when the profile or timezone is missing (e.g. a fresh
 * signup that hasn't completed onboarding yet).
 */
export async function recordVisit(userId: string): Promise<void> {
  try {
    const [profile] = await db
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const tz = profile?.timezone ?? "UTC";
    const dateLocal = formatLocalDate(new Date(), tz);

    await db
      .insert(userActivityDays)
      .values({ userId, dateLocal })
      .onConflictDoNothing();

    // Reputation — one point for showing up today. The dedupe key
    // includes the local date, so multiple visits in one day collapse
    // into a single insert at the reputation_event level.
    await awardReputation({
      userId,
      kind: "daily_visit",
      subjectId: RepSubject.dailyVisit(userId, dateLocal),
    });

    // Also bump users.lastLoginAt so the admin "last seen" column reflects
    // continued activity even when the user never explicitly signs in (JWT
    // sessions can stay valid for weeks). Conditional WHERE throttles to
    // ~1 write per minute per user so heavy navigation doesn't pummel Neon.
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(
        and(
          eq(users.id, userId),
          or(
            isNull(users.lastLoginAt),
            lt(users.lastLoginAt, sql`now() - interval '60 seconds'`)
          )
        )
      );
  } catch (err) {
    // Activity logging is opportunistic — drop the error rather than
    // letting it bubble up into the page response.
    console.warn(
      "[activity.recordVisit] failed for",
      userId,
      ":",
      (err as Error).message
    );
  }
}

export type StreakInfo = {
  /** Consecutive active days ending today (today always counts — the caller
   *  is active right now). */
  current: number;
  /** Longest consecutive run ever recorded. */
  longest: number;
};

/** Shift a YYYY-MM-DD calendar-date string by `delta` days (no TZ math —
 *  these are already local date strings). */
function shiftDate(date: string, delta: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) + delta * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * The user's daily-visit streak from `userActivityDays`. Today always counts
 * as active (the request itself is today's activity, and the visit row is
 * written in an after-hook that may not have landed yet), so `current` is at
 * least 1. Consecutive days are measured in the user's local timezone.
 */
export async function getStreak(userId: string): Promise<StreakInfo> {
  const [profile] = await db
    .select({ timezone: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const tz = profile?.timezone ?? "UTC";
  const today = formatLocalDate(new Date(), tz);

  const rows = await db
    .select({ d: userActivityDays.dateLocal })
    .from(userActivityDays)
    .where(eq(userActivityDays.userId, userId));

  const days = new Set(rows.map((r) => r.d));
  days.add(today); // the live request is today's activity

  // Current streak: walk back from today while each prior day is present.
  let current = 0;
  for (let cursor = today; days.has(cursor); cursor = shiftDate(cursor, -1)) {
    current++;
  }

  // Longest streak: sort the dates and scan for the longest consecutive run.
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev !== null && shiftDate(prev, 1) === day ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = day;
  }

  return { current, longest };
}

function formatLocalDate(d: Date, timezone: string): string {
  try {
    // en-CA returns YYYY-MM-DD already padded, no manual zero-pad needed.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
