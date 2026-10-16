import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { dailyEmailLog, emailSendLog } from "@/db/schema";
import { WATCHED_LIFECYCLE_KINDS } from "@/lib/email-health-canaries";

/**
 * Operational health checks for the email channels.
 *
 * Why this exists: between 2026-08-04 and 2026-10-18 the daily-horoscope blast
 * silently degraded from 97% delivery to 41%, and four lifecycle sequences
 * (winback, verify_reminder, birthday, profile_incomplete) stopped sending
 * altogether — zero emails for nine weeks. Every one of those failures was
 * invisible: no alert, no dashboard, no error. They were only found by querying
 * the database by hand.
 *
 * These checks make the same failures loud. Each returns a plain summary for the
 * cron JSON response (so the endpoint is inspectable) and raises a Sentry event
 * when a threshold is breached.
 *
 * Only aggregate counts are reported. No email addresses, names, or user IDs.
 */

/** Delivery rate below this for the day's blast is an incident. */
const MIN_DAILY_DELIVERY_RATE = 0.9;

/** Enqueued rows below this are too small a sample to judge a rate on. */
const MIN_SAMPLE_SIZE = 50;

/**
 * A lifecycle sequence sending zero emails for this long is an incident.
 *
 * Generous on purpose: these are event-driven (a birthday, a dormancy window)
 * and genuinely quiet days are normal. Nine weeks of silence is not.
 */
const LIFECYCLE_SILENCE_DAYS = 14;

/**
 * Lifecycle sequences that must show activity within the silence window.
 *
 * The list itself lives in a pure module (with the reasoning and the history of
 * which sequences actually failed) so it can be unit tested without a database.
 */
export { WATCHED_LIFECYCLE_KINDS } from "@/lib/email-health-canaries";

export type EmailHealthAlert = {
  check: string;
  detail: string;
};

export type EmailHealthSummary = {
  /** Today's blast: enqueued, sent, and the resulting rate. */
  dailyDelivery: { enqueued: number; sent: number; rate: number | null };
  /** Rows still pending or failed for today after the drain. */
  stalePending: number;
  /** Days since each watched lifecycle kind last sent, null when never. */
  lifecycleSilenceDays: Record<string, number | null>;
  /** Human-readable breaches; empty when healthy. */
  alerts: EmailHealthAlert[];
};

/**
 * Gather the health summary and raise Sentry events for any breach.
 *
 * Never throws: a monitoring failure must not take down the job it monitors.
 */
export async function checkEmailHealth(opts: {
  /** Today's YYYY-MM-DD key. */
  today: string;
}): Promise<EmailHealthSummary> {
  const empty: EmailHealthSummary = {
    dailyDelivery: { enqueued: 0, sent: 0, rate: null },
    stalePending: 0,
    lifecycleSilenceDays: {},
    alerts: [],
  };

  try {
    const [delivery] = await db
      .select({
        enqueued: sql<number>`count(*)::int`,
        sent: sql<number>`count(*) filter (where ${dailyEmailLog.status} = 'sent')::int`,
        outstanding: sql<number>`count(*) filter (where ${dailyEmailLog.status} in ('pending','failed'))::int`,
      })
      .from(dailyEmailLog)
      .where(eq(dailyEmailLog.sendDate, opts.today));

    const enqueued = delivery?.enqueued ?? 0;
    const sent = delivery?.sent ?? 0;
    const stalePending = delivery?.outstanding ?? 0;
    const rate = enqueued > 0 ? sent / enqueued : null;

    // Lifecycle silence, one grouped query rather than N round trips.
    const silence: Record<string, number | null> = {};
    for (const kind of WATCHED_LIFECYCLE_KINDS) {
      const [row] = await db
        .select({ last: sql<string | null>`max(${emailSendLog.sentAt})` })
        .from(emailSendLog)
        .where(eq(emailSendLog.kind, kind));
      const last = row?.last ? new Date(row.last) : null;
      silence[kind] = last
        ? Math.floor((Date.now() - last.getTime()) / 86_400_000)
        : null;
    }

    const alerts: EmailHealthAlert[] = [];

    // 1) Today's blast is under-delivering.
    if (
      rate !== null &&
      enqueued >= MIN_SAMPLE_SIZE &&
      rate < MIN_DAILY_DELIVERY_RATE
    ) {
      alerts.push({
        check: "daily_delivery_rate",
        detail: `daily horoscope delivered ${sent}/${enqueued} (${Math.round(rate * 100)}%), below ${Math.round(
          MIN_DAILY_DELIVERY_RATE * 100,
        )}%`,
      });
    }

    // 2) Rows left outstanding for today — the retry tick's problem, but worth
    //    knowing before it becomes tomorrow's orphaned backlog.
    if (stalePending > 0) {
      alerts.push({
        check: "daily_outstanding_rows",
        detail: `${stalePending} daily row(s) still pending/failed for ${opts.today}`,
      });
    }

    // 3) A lifecycle sequence has gone quiet.
    for (const [kind, days] of Object.entries(silence)) {
      if (days === null) {
        alerts.push({
          check: "lifecycle_never_sent",
          detail: `${kind} has no send history at all`,
        });
      } else if (days > LIFECYCLE_SILENCE_DAYS) {
        alerts.push({
          check: "lifecycle_silent",
          detail: `${kind} has not sent for ${days} days`,
        });
      }
    }

    if (alerts.length > 0) {
      // Imported lazily so this module stays cheap for callers that only want
      // the summary, and so a Sentry misconfiguration cannot throw here.
      try {
        const Sentry = await import("@sentry/nextjs");
        for (const alert of alerts) {
          Sentry.captureMessage(
            `[email-health] ${alert.check}: ${alert.detail}`,
            {
              level:
                alert.check === "daily_delivery_rate" ? "error" : "warning",
              tags: { area: "email-health", check: alert.check },
            },
          );
        }
      } catch (err) {
        console.warn(
          "[email-health] Sentry report failed:",
          (err as Error).message,
        );
      }
    }

    return {
      dailyDelivery: { enqueued, sent, rate },
      stalePending,
      lifecycleSilenceDays: silence,
      alerts,
    };
  } catch (err) {
    console.warn("[email-health] check failed:", (err as Error).message);
    return empty;
  }
}
