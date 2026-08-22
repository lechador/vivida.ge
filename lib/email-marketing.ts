import { Resend } from "resend";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creditAccounts,
  dailyEmailLog,
  emailCampaignRecipients,
  emailCampaigns,
  emailSendLog,
  profiles,
  users,
} from "@/db/schema";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { DailyHoroscopeEmail } from "@/lib/email-templates/daily-horoscope";
import { ProfileIncompleteEmail } from "@/lib/email-templates/profile-incomplete";
import { MarketingEmail } from "@/lib/email-templates/marketing";
import { LowCreditOfferEmail } from "@/lib/email-templates/low-credit-offer";
import { ensureDailyFor } from "@/actions/daily";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import {
  LOW_CREDIT_OFFER_CAMPAIGN_SLUG,
  LOW_CREDIT_OFFER_ENDS_AT,
  LOW_CREDIT_OFFER_THRESHOLD,
} from "@/lib/promo-offer";
import {
  formatBillingAmount,
  LOW_CREDIT_PROMO_MONTHS,
  LOW_CREDIT_PROMO_PLAN,
} from "@/lib/billing-config";
import { kaDayMonthGenitive } from "@/lib/i18n/ka-date";

let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

// RESEND_FROM may be a bare address or a full "Name <email>" string —
// normalize so the sender always shows "Vivida", never a raw mailbox name.
function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}

const FROM = resolveFrom(process.env.RESEND_FROM, "Vivida <hello@vivida.ge>");
// Email links must always use the public production site. APP_ORIGIN is often
// localhost in local admin/dev sessions and must never leak into a real send.
const ORIGIN = process.env.EMAIL_ORIGIN ?? "https://vivida.ge";

function localizedAbsUrl(path: string, locale: UserLocale): string {
  const origin = locale === "ka" ? ORIGIN : ENGLISH_SITE_URL;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Type of bulk-send the admin can trigger. */
export type EmailTemplateKind =
  | "daily_horoscope"
  | "profile_incomplete"
  | "marketing"
  | "low_credit_offer";

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
  /** Persist recipients and conversions under this campaign. */
  campaignId?: string;
  /** Preview sends must render even when the test account already has a profile. */
  allowCompletedProfile?: boolean;
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
  locale: string;
  /** Credit balance at audience-resolution time. Only the offer template
   *  reads it — it is the reason that email is being sent. */
  balance?: number;
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
        locale: users.interfaceLanguage,
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
        locale: users.interfaceLanguage,
        dateOfBirth: profiles.dateOfBirth,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.emailNudges, true))
      .then((rows) =>
        rows
          .filter((r) => !r.dateOfBirth)
          .filter((r) => !!r.email)
          .map((r) => ({
            userId: r.userId,
            email: r.email!,
            name: r.name,
            locale: r.locale,
          }))
      );
  }
  if (template === "low_credit_offer") {
    // Georgian users who are nearly out of credits and are not already paying.
    // leftJoin, not innerJoin: a user with no wallet row has no credits at all,
    // which is the most qualified state this campaign has — an innerJoin would
    // silently drop exactly those people.
    const rows = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        locale: users.interfaceLanguage,
        balance: sql<number>`coalesce(${creditAccounts.balance}, 0)`,
        isPremium: users.isPremium,
        premiumUntil: users.premiumUntil,
      })
      .from(users)
      .leftJoin(creditAccounts, eq(creditAccounts.userId, users.id))
      .where(
        and(
          eq(users.emailMarketing, true),
          eq(users.residenceCountryCode, LOW_CREDIT_PROMO_PLAN.countryCode),
          sql`coalesce(${creditAccounts.balance}, 0) <= ${LOW_CREDIT_OFFER_THRESHOLD}`,
        ),
      );
    const now = Date.now();
    return rows
      .filter((r) => !!r.email)
      .filter(
        (r) => !(r.isPremium && r.premiumUntil && r.premiumUntil.getTime() > now),
      )
      .map((r) => ({
        userId: r.userId,
        email: r.email!,
        name: r.name,
        locale: r.locale,
        balance: Number(r.balance),
      }));
  }

  // marketing
  return await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .where(eq(users.emailMarketing, true))
    .then((rows) =>
      rows.filter((r): r is Recipient => !!r.email)
    );
}

export const BIRTH_DETAILS_CAMPAIGN_SLUG = "birth-details-50-credits-2026";

export async function ensureBirthDetailsCampaign(): Promise<{ id: string }> {
  const [campaign] = await db
    .insert(emailCampaigns)
    .values({
      slug: BIRTH_DETAILS_CAMPAIGN_SLUG,
      name: "Birth details · 50 credits",
      template: "profile_incomplete",
      subject: "შეავსე დაბადების დეტალები და მიიღე 50 კრედიტი",
      rewardCredits: 50,
      status: "draft",
      ctaLabel: "შეავსე მონაცემები",
      ctaUrl: "/onboarding",
    })
    .onConflictDoUpdate({
      target: emailCampaigns.slug,
      set: { rewardCredits: 50 },
    })
    .returning({ id: emailCampaigns.id });
  return campaign;
}

const OFFER_SUBJECT = {
  ka: `${LOW_CREDIT_PROMO_MONTHS} თვე ულიმიტო Vivida — მხოლოდ ${formatBillingAmount(
    LOW_CREDIT_PROMO_PLAN.amountMinor,
    LOW_CREDIT_PROMO_PLAN.currency,
    "ka",
  )}`,
  en: `${LOW_CREDIT_PROMO_MONTHS} months of unlimited Vivida — just ${formatBillingAmount(
    LOW_CREDIT_PROMO_PLAN.amountMinor,
    LOW_CREDIT_PROMO_PLAN.currency,
    "en",
  )}`,
};

export async function ensureLowCreditOfferCampaign(): Promise<{ id: string }> {
  const [campaign] = await db
    .insert(emailCampaigns)
    .values({
      slug: LOW_CREDIT_OFFER_CAMPAIGN_SLUG,
      name: "Low credits · 3 months PRO for ₾29",
      template: "low_credit_offer",
      subject: OFFER_SUBJECT.ka,
      // No credit reward: the campaign's conversion is the subscription, and a
      // reward here would hand free credits to the very people it is trying to
      // move onto PRO.
      rewardCredits: 0,
      status: "draft",
      ctaLabel: "გაააქტიურე შეთავაზება",
      ctaUrl: "/credits",
    })
    .onConflictDoUpdate({
      target: emailCampaigns.slug,
      set: { subject: OFFER_SUBJECT.ka },
    })
    .returning({ id: emailCampaigns.id });
  return campaign;
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
  let audience = await resolveAudience(opts.template);
  // Marketing campaigns can outlive a server/request window. Make retries
  // resumable by excluding every recipient already attempted for the same
  // subject, so a partial retry never duplicates accepted deliveries.
  if (opts.template === "marketing" && opts.subject?.trim()) {
    const attempted = await db
      .select({ userId: emailSendLog.userId })
      .from(emailSendLog)
      .where(
        and(
          eq(emailSendLog.kind, "marketing"),
          eq(emailSendLog.subject, opts.subject.trim())
        )
      );
    const attemptedIds = new Set(attempted.map((row) => row.userId));
    audience = audience.filter((recipient) => !attemptedIds.has(recipient.userId));
  }
  // Same resumability for the offer blast, keyed off the campaign rather than
  // the subject line: whoever already has a sent row must not be mailed twice
  // if the route times out and the admin retries.
  if (opts.template === "low_credit_offer" && opts.campaignId) {
    const alreadySent = await db
      .select({ userId: emailCampaignRecipients.userId })
      .from(emailCampaignRecipients)
      .where(
        and(
          eq(emailCampaignRecipients.campaignId, opts.campaignId),
          isNotNull(emailCampaignRecipients.sentAt),
        ),
      );
    const sentIds = new Set(alreadySent.map((row) => row.userId));
    audience = audience.filter((recipient) => !sentIds.has(recipient.userId));
  }
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
      if (opts.campaignId) {
        await db.insert(emailCampaignRecipients).values({
          campaignId: opts.campaignId,
          userId: recipient.userId,
          email: recipient.email,
        }).onConflictDoNothing();
      }
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

/** Send the birth-details incentive only to the explicit test recipient. */
export async function sendBirthDetailsCampaignTest(to: string): Promise<boolean> {
  const [recipient] = await db
    .select({ userId: users.id, email: users.email, name: users.name, locale: users.interfaceLanguage })
    .from(users)
    .where(eq(users.email, to.trim().toLowerCase()))
    .limit(1);
  if (!recipient?.email) throw new Error("test recipient is not a registered user");
  const testRecipient: Recipient = { ...recipient, email: recipient.email };
  const campaign = await ensureBirthDetailsCampaign();
  await db.insert(emailCampaignRecipients).values({
    campaignId: campaign.id,
    userId: recipient.userId,
    email: recipient.email,
    isTest: true,
  }).onConflictDoUpdate({
    target: [emailCampaignRecipients.campaignId, emailCampaignRecipients.userId],
    set: { email: recipient.email },
  });
  return dispatch(
    { template: "profile_incomplete", campaignId: campaign.id, allowCompletedProfile: true },
    testRecipient,
    `campaign:${campaign.id}:${recipient.userId}`
  );
}

/**
 * Send the low-credit offer to one named account, bypassing the audience
 * filters. The recipient row is written as a test so it stays out of the
 * campaign's conversion figures — but it is a real row with a real sent_at, so
 * the tester genuinely sees the offer card and can walk the whole purchase.
 */
export async function sendLowCreditOfferTest(to: string): Promise<boolean> {
  const [recipient] = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .where(eq(users.email, to.trim().toLowerCase()))
    .limit(1);
  if (!recipient?.email) throw new Error("test recipient is not a registered user");
  const campaign = await ensureLowCreditOfferCampaign();
  await db
    .insert(emailCampaignRecipients)
    .values({
      campaignId: campaign.id,
      userId: recipient.userId,
      email: recipient.email,
      isTest: true,
    })
    .onConflictDoUpdate({
      target: [emailCampaignRecipients.campaignId, emailCampaignRecipients.userId],
      set: { email: recipient.email },
    });
  return dispatch(
    {
      template: "low_credit_offer",
      campaignId: campaign.id,
      // The tester is usually not low on credits; send anyway.
      allowCompletedProfile: true,
    },
    { ...recipient, email: recipient.email },
    `campaign:${campaign.id}:${recipient.userId}`,
  );
}

/** Send one real marketing preview without resolving or touching the bulk audience. */
export async function sendMarketingTestEmail(
  to: string,
  opts: Omit<SendOptions, "template" | "dryRun">
): Promise<boolean> {
  const [recipient] = await db
    .select({ userId: users.id, email: users.email, name: users.name, locale: users.interfaceLanguage })
    .from(users)
    .where(eq(users.email, to.trim().toLowerCase()))
    .limit(1);
  if (!recipient?.email) throw new Error("test recipient is not a registered user");
  return dispatch(
    { ...opts, template: "marketing" },
    { userId: recipient.userId, email: recipient.email, name: recipient.name, locale: recipient.locale },
    `marketing-test:new-tests:${recipient.userId}`
  );
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
  const locale = normalizeUserLocale(recipient.locale);

  if (opts.template === "daily_horoscope") {
    const daily = await ensureDailyFor(recipient.userId, locale);
    if (!daily) return false; // No chart or generation failed — skip silently
    const [profile] = await db
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.userId, recipient.userId))
      .limit(1);
    const tz = profile?.timezone ?? "UTC";
    const localizedDate = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ka-GE", {
      timeZone: tz,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());

    const unsubUrl = localizedAbsUrl(`/unsubscribe?token=${token}&type=daily`, locale);
    const dashboardUrl = localizedAbsUrl("/dashboard", locale);
    await acquireResendSlot();
    const result = await c.emails.send(
      {
        from: FROM,
        to: recipient.email,
        // Use today's actual headline as the subject — a concrete, personal
        // line opens far better than a static "your daily horoscope".
        subject: daily.headline?.trim() || (locale === "en" ? "Your daily horoscope" : "შენი დღევანდელი ჰოროსკოპი"),
        react: DailyHoroscopeEmail({
          name: recipient.name?.split(" ")[0] ?? null,
          headline: daily.headline,
          summary: daily.summary,
          dashboardUrl,
          unsubscribeUrl: unsubUrl,
          localizedDate,
          locale,
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
    if (profile?.dateOfBirth && !opts.allowCompletedProfile) return false;

    const unsubUrl = localizedAbsUrl(`/unsubscribe?token=${token}&type=nudges`, locale);
    const onboardingUrl = localizedAbsUrl("/onboarding", locale);
    const subject = locale === "en"
      ? opts.campaignId
        ? "Complete your birth details and get 50 credits"
        : "Your birth chart is waiting — complete your profile"
      : opts.campaignId
        ? "შეავსე დაბადების დეტალები და მიიღე 50 კრედიტი"
        : "შენი ნატალური რუკა გელოდება — დაასრულე რეგისტრაცია";
    await acquireResendSlot();
    const result = await c.emails.send({
      from: FROM,
      to: recipient.email,
      subject,
      react: ProfileIncompleteEmail({
        name: recipient.name?.split(" ")[0] ?? null,
        onboardingUrl,
        unsubscribeUrl: unsubUrl,
        locale,
      }),
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }, idempotencyKey ? { idempotencyKey } : undefined);
    if (opts.campaignId) {
      await db.update(emailCampaignRecipients).set({
        status: result.error ? "failed" : "sent",
        error: result.error?.message ?? null,
        sentAt: result.error ? null : new Date(),
      }).where(and(
        eq(emailCampaignRecipients.campaignId, opts.campaignId),
        eq(emailCampaignRecipients.userId, recipient.userId)
      ));
    }
    await logToUnifiedSendLog(
      recipient.userId,
      "profile_incomplete",
      recipient.email,
      subject,
      result.error?.message
    );
    if (result.error) throw new Error(result.error.message ?? "send failed");
    return true;
  }

  if (opts.template === "low_credit_offer") {
    // Re-check at dispatch, not just at audience resolution: a long blast can
    // outlive someone topping up or subscribing mid-run, and nobody should get
    // a "you are nearly out of credits" email once they no longer are.
    const [current] = await db
      .select({
        balance: sql<number>`coalesce(${creditAccounts.balance}, 0)`,
        isPremium: users.isPremium,
        premiumUntil: users.premiumUntil,
      })
      .from(users)
      .leftJoin(creditAccounts, eq(creditAccounts.userId, users.id))
      .where(eq(users.id, recipient.userId))
      .limit(1);
    const balance = Number(current?.balance ?? recipient.balance ?? 0);
    const stillPremium = Boolean(
      current?.isPremium &&
        current.premiumUntil &&
        current.premiumUntil.getTime() > Date.now(),
    );
    if (stillPremium) return false;
    if (balance > LOW_CREDIT_OFFER_THRESHOLD && !opts.allowCompletedProfile) {
      return false;
    }

    const unsubUrl = localizedAbsUrl(
      `/unsubscribe?token=${token}&type=marketing`,
      locale,
    );
    const subject = locale === "ka" ? OFFER_SUBJECT.ka : OFFER_SUBJECT.en;
    await acquireResendSlot();
    const result = await c.emails.send(
      {
        from: FROM,
        to: recipient.email,
        subject,
        react: LowCreditOfferEmail({
          name: recipient.name?.split(" ")[0] ?? null,
          balance,
          priceLabel: formatBillingAmount(
            LOW_CREDIT_PROMO_PLAN.amountMinor,
            LOW_CREDIT_PROMO_PLAN.currency,
            locale,
          ),
          months: LOW_CREDIT_PROMO_MONTHS,
          deadlineLabel:
            locale === "ka"
              ? kaDayMonthGenitive(LOW_CREDIT_OFFER_ENDS_AT)
              : new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "long",
                }).format(LOW_CREDIT_OFFER_ENDS_AT),
          // Preserve the destination even when the email is opened in a
          // browser where the recipient is not currently signed in.
          creditsUrl: localizedAbsUrl("/login?next=%2Fcredits", locale),
          unsubscribeUrl: unsubUrl,
          locale,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    );
    if (opts.campaignId) {
      await db
        .update(emailCampaignRecipients)
        .set({
          status: result.error ? "failed" : "sent",
          error: result.error?.message ?? null,
          sentAt: result.error ? null : new Date(),
        })
        .where(
          and(
            eq(emailCampaignRecipients.campaignId, opts.campaignId),
            eq(emailCampaignRecipients.userId, recipient.userId),
          ),
        );
    }
    await logToUnifiedSendLog(
      recipient.userId,
      "low_credit_offer",
      recipient.email,
      subject,
      result.error?.message,
    );
    if (result.error) throw new Error(result.error.message ?? "send failed");
    return true;
  }

  // marketing
  if (!opts.subject || !opts.body) {
    throw new Error("subject and body are required for marketing template");
  }
  const unsubUrl = localizedAbsUrl(`/unsubscribe?token=${token}&type=marketing`, locale);
  await acquireResendSlot();
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
      locale,
    }),
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  await logToUnifiedSendLog(
    recipient.userId,
    "marketing",
    recipient.email,
    opts.subject,
    result.error?.message
  );
  if (result.error) throw new Error(result.error.message ?? "send failed");
  return true;
}

/**
 * Best-effort row in the unified email log (admin "Emails" page). The daily
 * template is NOT logged here — it already has daily_email_log, which the
 * admin view merges in. Never throws.
 */
async function logToUnifiedSendLog(
  userId: string,
  kind: string,
  email: string | null,
  subject: string,
  error?: string
): Promise<void> {
  try {
    await db.insert(emailSendLog).values({
      userId,
      kind,
      email,
      subject,
      status: error ? "failed" : "sent",
      error: error ?? null,
    });
  } catch {
    /* logging must never break a send */
  }
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
  /** Dispatch returned false (no chart or user opted out mid-day). */
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
 *      and dispatch with concurrency=8. Concurrency only parallelizes the
 *      per-user work (horoscope lookup, tokens); the actual Resend calls
 *      serialize through acquireResendSlot(), staying under the account's
 *      2 req/s limit. Each Resend call carries
 *      Idempotency-Key=`daily:${userId}:${date}` so an at-least-once retry
 *      from our side never produces a duplicate email on Resend's side.
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
  /** Retry ticks drain existing rows without rewriting the whole audience. */
  enqueue?: boolean;
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
  const inserted = opts.enqueue === false
    ? []
    : await db
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
        let ok: boolean;
        try {
          ok = await dispatch(
            { template: "daily_horoscope" },
            recipient,
            idempotencyKey
          );
        } catch (err) {
          // One in-pass retry for rate-limit blips; the idempotency key
          // makes the retry safe even if the first send actually landed.
          if (!/too many requests/i.test((err as Error).message ?? "")) throw err;
          await new Promise((r) => setTimeout(r, 2000));
          ok = await dispatch(
            { template: "daily_horoscope" },
            recipient,
            idempotencyKey
          );
        }
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
