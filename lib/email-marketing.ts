import { Resend } from "resend";
import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
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
  recipient: Recipient
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
    const result = await c.emails.send({
      from: FROM,
      to: recipient.email,
      subject: `${daily.headline} · შენი დღევანდელი ჰოროსკოპი`,
      react: DailyHoroscopeEmail({
        name: recipient.name?.split(" ")[0] ?? null,
        headline: daily.headline,
        summary: daily.summary,
        body: daily.body,
        themes: daily.themes ?? [],
        dashboardUrl,
        unsubscribeUrl: unsubUrl,
        localizedDate,
      }),
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
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
