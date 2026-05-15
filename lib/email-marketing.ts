import { Resend } from "resend";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { dailyEmailLog, profiles, users } from "@/db/schema";
import { DailyHoroscopeEmail } from "@/lib/email-templates/daily-horoscope";
import { ProfileIncompleteEmail } from "@/lib/email-templates/profile-incomplete";
import { MarketingEmail } from "@/lib/email-templates/marketing";
import { ensureDailyFor } from "@/actions/daily";
import { getCurrentPlan } from "@/lib/plan";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";

let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

const FROM = process.env.RESEND_FROM ?? "Vivida <hello@vivida.ge>";
const ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

function absUrl(path: string): string {
  return `${ORIGIN.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Type of bulk-send the admin can trigger. */
export type EmailTemplateKind =
  | "daily_horoscope"
  | "profile_incomplete"
  | "marketing";

export type SendOptions = {
  template: EmailTemplateKind;
  /** Marketing only — admin-supplied subject line. */
  subject?: string;
  /** Marketing only — admin-supplied body (paragraphs separated by blank lines). */
  body?: string;
  /** Marketing only — optional CTA. */
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  /** When true, resolve the audience but don't actually send. Returns counts only. */
  dryRun?: boolean;
};

export type SendResult = {
  audienceTotal: number;
  sent: number;
  skipped: number;
  failed: Array<{ userId: string; email: string | null; error: string }>;
};

type Recipient = {
  userId: string;
  email: string;
  name: string | null;
};

/**
 * Audience query per template. We do all opt-in filtering at the SQL
 * level so we never load the full user table into memory and never have
 * to filter twice.
 */
async function resolveAudience(
  template: EmailTemplateKind
): Promise<Recipient[]> {
  if (template === "daily_horoscope") {
    // Need birth data on file (otherwise no chart, no horoscope) AND not
    // opted out of daily emails.
    const rows = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .innerJoin(profiles, eq(profiles.userId, users.id))
      .where(
        and(
          isNotNull(profiles.dateOfBirth),
          eq(users.emailDailyHoroscope, true)
        )
      );
    return rows.filter((r): r is Recipient => !!r.email);
  }
  if (template === "profile_incomplete") {
    // Registered users WHERE no profile row OR profile row missing dateOfBirth,
    // and they haven't opted out of nudges.
    return await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        dateOfBirth: profiles.dateOfBirth,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.emailNudges, true))
      .then((rows) =>
        rows
          .filter((r) => !r.dateOfBirth)
          .filter((r): r is { userId: string; email: string; name: string | null; dateOfBirth: null } =>
            !!r.email
          )
          .map((r) => ({
            userId: r.userId,
            email: r.email,
            name: r.name,
          }))
      );
  }
  // marketing
  return await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .where(eq(users.emailMarketing, true))
    .then((rows) =>
      rows.filter((r): r is Recipient => !!r.email)
    );
}

/**
 * Send-with-concurrency-cap. Resend's free tier rate-limits at 2 req/s,
 * but the paid tier accepts much more. We default to 5 concurrent
 * requests — slow enough not to trip rate-limits, fast enough that even
 * a few thousand recipients finish in a couple of minutes.
 */
async function pMap<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

export async function sendBulk(opts: SendOptions): Promise<SendResult> {
  const c = client();
  const audience = await resolveAudience(opts.template);
  if (opts.dryRun || !c) {
    return {
      audienceTotal: audience.length,
      sent: 0,
      skipped: audience.length,
      failed: [],
    };
  }

  let sent = 0;
  let skipped = 0;
  const failed: SendResult["failed"] = [];

  await pMap(audience, async (recipient) => {
    try {
      const dispatched = await dispatch(opts, recipient);
      if (dispatched) sent++;
      else skipped++;
    } catch (err) {
      failed.push({
        userId: recipient.userId,
        email: recipient.email,
        error: (err as Error).message ?? "unknown",
      });
    }
  });

  return { audienceTotal: audience.length, sent, skipped, failed };
}

/**
 * Send to a single recipient. Returns true on a successful Resend call,
 * false when we deliberately skip (e.g. daily horoscope not yet generated
 * for this user). Throws on hard failures.
 */
async function dispatch(
  opts: SendOptions,
  recipient: Recipient,
  /** Optional dedupe key forwarded to Resend so retries can't double-send. */
  idempotencyKey?: string
): Promise<boolean> {
  const c = client();
  if (!c) return false;

  const token = await getOrCreateUnsubscribeToken(recipient.userId);

  if (opts.template === "daily_horoscope") {
    const plan = await getCurrentPlan(recipient.userId);
    const daily = await ensureDailyFor(recipient.userId, plan);
    if (!daily) return false; // No chart, free plan, or generation failed — skip silently
    const [profile] = await db
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.userId, recipient.userId))
      .limit(1);
    const tz = profile?.timezone ?? "UTC";
    const localizedDate = new Intl.DateTimeFormat("ka-GE", {
      timeZone: tz,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());

    const unsubUrl = absUrl(`/unsubscribe?token=${token}&type=daily`);
    const dashboardUrl = absUrl("/dashboard");
    const result = await c.emails.send(
      {
        from: FROM,
        to: recipient.email,
        subject: "შენი დღევანდელი ჰოროსკოპი",
        react: DailyHoroscopeEmail({
          name: recipient.name?.split(" ")[0] ?? null,
          headline: daily.headline,
          summary: daily.summary,
          dashboardUrl,
          unsubscribeUrl: unsubUrl,
          localizedDate,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );
    if (result.error) throw new Error(result.error.message ?? "send failed");
    return true;
  }

  if (opts.template === "profile_incomplete") {
    // Belt-and-suspenders: re-check that profile is still missing data.
    const [profile] = await db
      .select({ dateOfBirth: profiles.dateOfBirth })
      .from(profiles)
      .where(eq(profiles.userId, recipient.userId))
      .limit(1);
    if (profile?.dateOfBirth) return false; // user just completed onboarding

    const unsubUrl = absUrl(`/unsubscribe?token=${token}&type=nudges`);
    const onboardingUrl = absUrl("/onboarding");
    const result = await c.emails.send({
      from: FROM,
      to: recipient.email,
      subject: "შენი ნატალური რუკა გელოდება — დაასრულე რეგისტრაცია",
      react: ProfileIncompleteEmail({
        name: recipient.name?.split(" ")[0] ?? null,
        onboardingUrl,
        unsubscribeUrl: unsubUrl,
      }),
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (result.error) throw new Error(result.error.message ?? "send failed");
    return true;
  }

  // marketing
  if (!opts.subject || !opts.body) {
    throw new Error("subject and body are required for marketing template");
  }
  const unsubUrl = absUrl(`/unsubscribe?token=${token}&type=marketing`);
  const result = await c.emails.send({
    from: FROM,
    to: recipient.email,
    subject: opts.subject,
    react: MarketingEmail({
      name: recipient.name?.split(" ")[0] ?? null,
      heading: opts.subject,
      body: opts.body,
      ctaLabel: opts.ctaLabel ?? null,
      ctaUrl: opts.ctaUrl ?? null,
      unsubscribeUrl: unsubUrl,
    }),
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (result.error) throw new Error(result.error.message ?? "send failed");
  return true;
}

/**
 * Cheap audience-count query for the admin "dry run" preview. Mirrors the
 * filter logic of `resolveAudience` but doesn't load row data.
 */
export async function audienceCount(
  template: EmailTemplateKind
): Promise<number> {
  const audience = await resolveAudience(template);
  return audience.length;
}

// ─────────────────────────────────────────────────────────────────────
// Daily horoscope blast — cron-driven, idempotent, retry-safe.
// ─────────────────────────────────────────────────────────────────────

export type DailyBlastResult = {
  /** Total users matching the audience filter for `sendDate`. */
  audienceTotal: number;
  /** Newly inserted log rows on this invocation. */
  enqueued: number;
  /** Audience rows whose log row already existed (sent/failed/skipped/pending). */
  alreadyEnqueued: number;
  /** Successful Resend dispatches in this invocation. */
  sent: number;
  /** Dispatch returned false (free plan, no chart, user opted out mid-day). */
  skipped: number;
  /** Threw — row left status='failed' for next cron tick to retry. */
  failed: number;
  /** Pending+failed log rows still outstanding for `sendDate` after we returned. */
  remaining: number;
  durationMs: number;
};

/**
 * Run one pass of the daily-horoscope email blast.
 *
 * Two-phase, idempotent:
 *   1. Enqueue: INSERT … ON CONFLICT DO NOTHING for every audience row,
 *      so safe to call repeatedly.
 *   2. Drain: pick rows where status ∈ {pending, failed} for sendDate
 *      and dispatch with concurrency=8 (Resend Pro is 10/s sustained).
 *      Each Resend call carries Idempotency-Key=`daily:${userId}:${date}`
 *      so an at-least-once retry from our side never produces a duplicate
 *      email on Resend's side.
 *
 * If Vercel kills the function mid-drain (maxDuration), the next cron
 * tick (we run a safety cron 30 min later) picks up the remaining rows.
 */
export async function sendDailyHoroscopeBlast(opts: {
  /** YYYY-MM-DD — the calendar day this batch belongs to. Use the UTC date
   *  for the cron caller; `localizedDate` per recipient is computed inside
   *  dispatch from their profile timezone. */
  sendDate: string;
  concurrency?: number;
}): Promise<DailyBlastResult> {
  const start = Date.now();
  const audience = await resolveAudience("daily_horoscope");
  const c = client();

  if (audience.length === 0 || !c) {
    return {
      audienceTotal: audience.length,
      enqueued: 0,
      alreadyEnqueued: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      remaining: 0,
      durationMs: Date.now() - start,
    };
  }

  // 1) Enqueue: idempotent insert.
  const inserted = await db
    .insert(dailyEmailLog)
    .values(
      audience.map((r) => ({
        userId: r.userId,
        sendDate: opts.sendDate,
      }))
    )
    .onConflictDoNothing()
    .returning({ userId: dailyEmailLog.userId });
  const enqueued = inserted.length;
  const alreadyEnqueued = audience.length - enqueued;

  // 2) Pick up everything still outstanding for today (covers pending +
  // any failed rows from a prior tick).
  const outstanding = await db
    .select({ userId: dailyEmailLog.userId })
    .from(dailyEmailLog)
    .where(
      and(
        eq(dailyEmailLog.sendDate, opts.sendDate),
        inArray(dailyEmailLog.status, ["pending", "failed"])
      )
    );

  // Cross-reference with current audience so a user who unsubscribed
  // between enqueue and drain doesn't get the email anyway.
  const audienceByUser = new Map(audience.map((r) => [r.userId, r]));
  const targets = outstanding
    .map((r) => audienceByUser.get(r.userId))
    .filter((r): r is Recipient => !!r);

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  await pMap(
    targets,
    async (recipient) => {
      const idempotencyKey = `daily:${recipient.userId}:${opts.sendDate}`;
      try {
        const ok = await dispatch(
          { template: "daily_horoscope" },
          recipient,
          idempotencyKey
        );
        if (ok) {
          await db
            .update(dailyEmailLog)
            .set({
              status: "sent",
              attempts: sql`${dailyEmailLog.attempts} + 1`,
              lastAttemptAt: new Date(),
              sentAt: new Date(),
              lastError: null,
            })
            .where(
              and(
                eq(dailyEmailLog.userId, recipient.userId),
                eq(dailyEmailLog.sendDate, opts.sendDate)
              )
            );
          sent++;
        } else {
          await db
            .update(dailyEmailLog)
            .set({
              status: "skipped",
              attempts: sql`${dailyEmailLog.attempts} + 1`,
              lastAttemptAt: new Date(),
            })
            .where(
              and(
                eq(dailyEmailLog.userId, recipient.userId),
                eq(dailyEmailLog.sendDate, opts.sendDate)
              )
            );
          skipped++;
        }
      } catch (err) {
        const message = (err as Error).message ?? "unknown";
        await db
          .update(dailyEmailLog)
          .set({
            status: "failed",
            attempts: sql`${dailyEmailLog.attempts} + 1`,
            lastAttemptAt: new Date(),
            lastError: message.slice(0, 500),
          })
          .where(
            and(
              eq(dailyEmailLog.userId, recipient.userId),
              eq(dailyEmailLog.sendDate, opts.sendDate)
            )
          );
        failed++;
      }
    },
    opts.concurrency ?? 8
  );

  // 3) Final outstanding count for the response.
  const remainingRows = await db
    .select({ userId: dailyEmailLog.userId })
    .from(dailyEmailLog)
    .where(
      and(
        eq(dailyEmailLog.sendDate, opts.sendDate),
        inArray(dailyEmailLog.status, ["pending", "failed"])
      )
    );

  return {
    audienceTotal: audience.length,
    enqueued,
    alreadyEnqueued,
    sent,
    skipped,
    failed,
    remaining: remainingRows.length,
    durationMs: Date.now() - start,
  };
}

/** UTC date string in YYYY-MM-DD — what the cron should pass as sendDate. */
export function utcDateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}
