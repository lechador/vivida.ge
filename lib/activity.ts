import { sql } from "drizzle-orm";

import { db } from "@/db";
import { completeEligibleEmailCampaigns } from "@/lib/email-campaigns";
import { processPendingSignupCredits } from "@/lib/signup-credit-experiment";
import type { PendingSignupCreditAssignment } from "@/lib/signup-credit-experiment-config";

const VISIT_THROTTLE_MS = 5 * 60 * 1000;
const recentlyRecorded = new Map<string, number>();

/**
 * Avoid scheduling the same best-effort analytics write on every navigation
 * handled by a warm function instance. The SQL below remains authoritative;
 * this is only a zero-I/O fast path for hot users.
 */
export function shouldRecordVisit(userId: string, now = Date.now()): boolean {
  const previous = recentlyRecorded.get(userId) ?? 0;
  if (now - previous < VISIT_THROTTLE_MS) return false;
  recentlyRecorded.set(userId, now);

  // Keep the opportunistic cache bounded on long-lived workers.
  if (recentlyRecorded.size > 5_000) {
    const cutoff = now - VISIT_THROTTLE_MS;
    for (const [id, at] of recentlyRecorded) {
      if (at < cutoff) recentlyRecorded.delete(id);
    }
  }
  return true;
}

/**
 * Best-effort "user was active today" record.
 *
 * Called via Next 16's `after()` from requireUser() so it never blocks
 * page render, if the DB write fails or the lookup is slow, the page
 * has already streamed. Idempotent: at most one row per (user, day),
 * `onConflictDoNothing` makes repeat visits within the same local day
 * a single SELECT roundtrip on the unique-constraint check.
 *
 * `dateLocal` is the user's wall-clock date (from profile.timezone), so
 * the admin heatmap reads the same day the user actually lived. Falls
 * back to UTC when the profile or timezone is missing (e.g. a fresh
 * signup that hasn't completed onboarding yet).
 */
export async function recordVisit(
  userId: string,
  pendingSignupCredits?: PendingSignupCreditAssignment,
): Promise<void> {
  try {
    // One Neon round-trip replaces the former profile SELECT + activity INSERT
    // + last-login UPDATE. PostgreSQL resolves the user's local date itself.
    await db.execute(sql`
      WITH user_context AS (
        SELECT
          ${userId}::text AS user_id,
          to_char(
            now() AT TIME ZONE COALESCE(p.timezone, 'UTC'),
            'YYYY-MM-DD'
          ) AS date_local
        FROM "user" u
        LEFT JOIN profile p ON p.user_id = u.id
        WHERE u.id = ${userId}
      ), activity AS (
        INSERT INTO user_activity_day (user_id, date_local)
        SELECT user_id, date_local FROM user_context
        ON CONFLICT DO NOTHING
      )
      UPDATE "user"
      SET last_login_at = now()
      WHERE id = ${userId}
        AND (
          last_login_at IS NULL
          OR last_login_at < now() - interval '5 minutes'
        )
    `);
  } catch (err) {
    // Activity logging is opportunistic, drop the error rather than
    // letting it bubble up into the page response.
    console.warn(
      "[activity.recordVisit] failed for",
      userId,
      ":",
      (err as Error).message,
    );
  }

  if (pendingSignupCredits) {
    try {
      await processPendingSignupCredits(userId, pendingSignupCredits);
    } catch (err) {
      console.warn(
        "[activity.signupCredits] failed for",
        userId,
        ":",
        (err as Error).message,
      );
    }
  }

  // Returning to the app is the win-back conversion event. Best-effort, and
  // `completeEligibleEmailCampaigns` only touches campaigns whose send already
  // happened, so this cannot complete an in-flight recipient. Rewards are 0 for
  // win-back, so this stamps `completed_at` without granting credits.
  try {
    await completeEligibleEmailCampaigns(userId);
  } catch (err) {
    console.warn(
      "[activity.campaignConversion] failed for",
      userId,
      ":",
      (err as Error).message,
    );
  }
}

export function formatLocalDate(d: Date, timezone: string): string {
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
