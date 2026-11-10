import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { isUnlocked } from "@/lib/credits";
import { localDateString } from "@/lib/transits";

/**
 * The 7-day forecast unlock is per ISO week of the user's local date, keyed
 * `weekly:YYYY-Www` in the credit ledger, so paying once no longer unlocks it
 * forever.
 *
 * Grandfathering: before per-week refs existed, the unlock was a single
 * lifetime row with ref "weekly". Anyone holding that row keeps access
 * through `LEGACY_WEEKLY_THROUGH` (the week this shipped) so nobody who paid
 * loses access mid-week; from the next week they pay per week.
 */
export const LEGACY_WEEKLY_REF = "weekly";
export const LEGACY_WEEKLY_THROUGH = "2026-W46";

/** ISO-8601 week key (YYYY-Www) of a "YYYY-MM-DD" calendar date. */
export function isoWeekKeyOfDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  // Shift to the Thursday of this ISO week; its year is the ISO year.
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const isoYear = date.getUTCFullYear();
  const yearStart = Date.UTC(isoYear, 0, 1);
  const week = Math.ceil(((date.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

/** Ledger ref for the week containing `now` in `timezone`. */
export function weeklyUnlockRef(now: Date, timezone: string): string {
  return `weekly:${isoWeekKeyOfDate(localDateString(now, timezone))}`;
}

/** Whether the legacy lifetime row still counts for the given week key. */
export function legacyCoversWeek(weekKey: string): boolean {
  return weekKey <= LEGACY_WEEKLY_THROUGH;
}

async function userTimezone(userId: string): Promise<string> {
  const [row] = await db
    .select({ timezone: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return row?.timezone ?? "UTC";
}

/** Current-week ref for this user (their local date decides the week). */
export async function currentWeeklyRef(
  userId: string,
  now: Date = new Date(),
): Promise<string> {
  return weeklyUnlockRef(now, await userTimezone(userId));
}

/**
 * Is the weekly forecast open for this user this week? PRO bypass comes from
 * `isUnlocked` (spend_* reasons), exactly as before.
 */
export async function isWeeklyUnlocked(
  userId: string,
  now: Date = new Date(),
): Promise<boolean> {
  const ref = await currentWeeklyRef(userId, now);
  if (await isUnlocked(userId, ref, "spend_weekly")) return true;
  const weekKey = ref.slice("weekly:".length);
  if (legacyCoversWeek(weekKey)) {
    return isUnlocked(userId, LEGACY_WEEKLY_REF, "spend_weekly");
  }
  return false;
}
