import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles, userActivityDays } from "@/db/schema";

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
