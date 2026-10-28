import { Resend } from "resend";
import { render as renderEmail } from "@react-email/render";
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
import {
  DAILY_ROW_GRACE_HOURS,
  EXPIRY_BATCH_SIZE,
  expiryCutoffs,
} from "@/lib/email-expiry";
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
  HALLOWEEN_PROMO_MONTHS,
  HALLOWEEN_PROMO_PLAN,
  PREMIUM_PLANS_BY_COUNTRY,
} from "@/lib/billing-config";
import { kaDayMonthGenitive } from "@/lib/i18n/ka-date";
import { dailyEmailSubject } from "@/lib/daily-headline";

let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

// RESEND_FROM may be a bare address or a full "Name <email>" string,
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
  "daily_horoscope" | "profile_incomplete" | "marketing" | "low_credit_offer";

export type SendOptions = {
  template: EmailTemplateKind;
  /** Marketing only, admin-supplied subject line. */
  subject?: string;
  /** Marketing only, admin-supplied body (paragraphs separated by blank lines). */
  body?: string;
  /** Marketing only, optional CTA. */
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
   *  reads it, it is the reason that email is being sent. */
  balance?: number;
};

/**
 * Audience query per template. We do all opt-in filtering at the SQL
 * level so we never load the full user table into memory and never have
 * to filter twice.
 */
async function resolveAudience(
  template: EmailTemplateKind,
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
          eq(users.emailDailyHoroscope, true),
        ),
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
          })),
      );
  }
  if (template === "low_credit_offer") {
    // Low-credit users (<= 3 credits) who spent their credits down to <= 3 and
    // still returned to the site afterwards, excluding active PRO subscribers.
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
          sql`coalesce(${creditAccounts.balance}, 0) <= ${LOW_CREDIT_OFFER_THRESHOLD}`,
          sql`EXISTS (
            SELECT 1 FROM credit_transaction ct
            WHERE ct.user_id = ${users.id} AND ct.amount < 0
          )`,
          sql`(
            EXISTS (
              SELECT 1 FROM user_activity_day uad
              WHERE uad.user_id = ${users.id}
                AND uad.date_local > to_char(
                  (
                    SELECT MIN(t.created_at)
                    FROM (
                      SELECT
                        ct.created_at,
                        SUM(ct.amount) OVER (ORDER BY ct.created_at ASC, ct.id ASC) AS running_balance
                      FROM credit_transaction ct
                      WHERE ct.user_id = ${users.id}
                    ) t
                    WHERE t.running_balance <= ${LOW_CREDIT_OFFER_THRESHOLD}
                      AND t.created_at > COALESCE(
                        (
                          SELECT MAX(t2.created_at)
                          FROM (
                            SELECT
                              ct2.created_at,
                              SUM(ct2.amount) OVER (ORDER BY ct2.created_at ASC, ct2.id ASC) AS running_balance
                            FROM credit_transaction ct2
                            WHERE ct2.user_id = ${users.id}
                          ) t2
                          WHERE t2.running_balance > ${LOW_CREDIT_OFFER_THRESHOLD}
                        ),
                        '-infinity'::timestamptz
                      )
                  ) AT TIME ZONE 'Asia/Tbilisi',
                  'YYYY-MM-DD'
                )
            )
            OR ${users.lastLoginAt} > (
              SELECT MAX(ct.created_at)
              FROM credit_transaction ct
              WHERE ct.user_id = ${users.id}
            ) + interval '30 minutes'
          )`,
        ),
      );
    const now = Date.now();
    return rows
      .filter((r) => !!r.email)
      .filter(
        (r) =>
          !(r.isPremium && r.premiumUntil && r.premiumUntil.getTime() > now),
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
    .then((rows) => rows.filter((r): r is Recipient => !!r.email));
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
  ka: `🎃 ჰელოუინის სპეციალური შეთავაზება: 1 თვე ულიმიტო Vivida PRO მხოლოდ ${formatBillingAmount(
    HALLOWEEN_PROMO_PLAN.amountMinor,
    HALLOWEEN_PROMO_PLAN.currency,
    "ka",
  )}-ად`,
  en: `🎃 Halloween Special: 1 month of unlimited Vivida PRO for just ${formatBillingAmount(
    HALLOWEEN_PROMO_PLAN.amountMinor,
    HALLOWEEN_PROMO_PLAN.currency,
    "en",
  )}`,
};

export async function ensureLowCreditOfferCampaign(): Promise<{ id: string }> {
  const [campaign] = await db
    .insert(emailCampaigns)
    .values({
      slug: LOW_CREDIT_OFFER_CAMPAIGN_SLUG,
      name: "Halloween low credits · 1 month PRO for ₾9.99",
      template: "low_credit_offer",
      subject: OFFER_SUBJECT.ka,
      // No credit reward: the campaign's conversion is the subscription, and a
      // reward here would hand free credits to the very people it is trying to
      // move onto PRO.
      rewardCredits: 0,
      status: "draft",
      ctaLabel: "გაააქტიურე ულიმიტო თვე ₾9.99-ად",
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
 * requests, slow enough not to trip rate-limits, fast enough that even
 * a few thousand recipients finish in a couple of minutes.
 */
async function pMap<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency = 5,
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
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, run),
  );
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
          eq(emailSendLog.subject, opts.subject.trim()),
        ),
      );
    const attemptedIds = new Set(attempted.map((row) => row.userId));
    audience = audience.filter(
      (recipient) => !attemptedIds.has(recipient.userId),
    );
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
        await db
          .insert(emailCampaignRecipients)
          .values({
            campaignId: opts.campaignId,
            userId: recipient.userId,
            email: recipient.email,
          })
          .onConflictDoNothing();
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
export async function sendBirthDetailsCampaignTest(
  to: string,
): Promise<boolean> {
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
  if (!recipient?.email)
    throw new Error("test recipient is not a registered user");
  const testRecipient: Recipient = { ...recipient, email: recipient.email };
  const campaign = await ensureBirthDetailsCampaign();
  await db
    .insert(emailCampaignRecipients)
    .values({
      campaignId: campaign.id,
      userId: recipient.userId,
      email: recipient.email,
      isTest: true,
    })
    .onConflictDoUpdate({
      target: [
        emailCampaignRecipients.campaignId,
        emailCampaignRecipients.userId,
      ],
      set: { email: recipient.email },
    });
  return dispatch(
    {
      template: "profile_incomplete",
      campaignId: campaign.id,
      allowCompletedProfile: true,
    },
    testRecipient,
    `campaign:${campaign.id}:${recipient.userId}`,
  );
}

/**
 * Send the low-credit offer to one named account, bypassing the audience
 * filters. The recipient row is written as a test so it stays out of the
 * campaign's conversion figures, but it is a real row with a real sent_at, so
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
  if (!recipient?.email)
    throw new Error("test recipient is not a registered user");
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
      target: [
        emailCampaignRecipients.campaignId,
        emailCampaignRecipients.userId,
      ],
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
    `campaign-test:${campaign.id}:${recipient.userId}:${Date.now()}`,
  );
}

/** Send one real marketing preview without resolving or touching the bulk audience. */
export async function sendMarketingTestEmail(
  to: string,
  opts: Omit<SendOptions, "template" | "dryRun">,
): Promise<boolean> {
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
  if (!recipient?.email)
    throw new Error("test recipient is not a registered user");
  return dispatch(
    { ...opts, template: "marketing" },
    {
      userId: recipient.userId,
      email: recipient.email,
      name: recipient.name,
      locale: recipient.locale,
    },
    `marketing-test:new-tests:${recipient.userId}`,
  );
}

/**
 * A daily-horoscope message, built but not yet sent.
 *
 * Deliberately a local structural type rather than Resend's `CreateEmailOptions`:
 * that type is a union of mutually exclusive template/html/react shapes, which
 * cannot be satisfied by an object assembled across helper boundaries. We only
 * ever construct this one shape, and both transports accept it.
 */
type DailyMessageBody = {
  to: string;
  subject: string;
  react: React.ReactElement;
  headers: Record<string, string>;
};

/**
 * Build the daily-horoscope message for one recipient, without sending it.
 *
 * Split out of `dispatch` so the daily blast can hand a whole batch of these
 * to Resend's batch endpoint. Per-user prep (chart lookup, unsubscribe token,
 * localized subject) stays here; only the transport is shared.
 *
 * Returns null when there is nothing to send for this user (no chart, or
 * generation failed) — the caller records that as a skip, not a failure.
 */
async function buildDailyHoroscopeMessage(
  recipient: Recipient,
): Promise<DailyMessageBody | null> {
  const token = await getOrCreateUnsubscribeToken(recipient.userId);
  const locale = normalizeUserLocale(recipient.locale);

  const daily = await ensureDailyFor(recipient.userId, locale);
  if (!daily) return null; // No chart or generation failed, skip silently

  const [profile] = await db
    .select({ timezone: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.userId, recipient.userId))
    .limit(1);
  const tz = profile?.timezone ?? "UTC";
  const localizedDate = new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "ka-GE",
    {
      timeZone: tz,
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  ).format(new Date());

  const unsubUrl = localizedAbsUrl(
    `/unsubscribe?token=${token}&type=daily`,
    locale,
  );
  const dashboardUrl = localizedAbsUrl("/dashboard", locale);
  const firstName = recipient.name?.split(" ")[0] ?? null;
  const subject = dailyEmailSubject({
    firstName,
    headline:
      daily.headline?.trim() ||
      (locale === "en" ? "Your daily horoscope" : "შენი დღევანდელი ჰოროსკოპი"),
    dateKey: daily.date,
    locale,
    topAspects: daily.transits?.headlineAspect
      ? [daily.transits.headlineAspect]
      : daily.transits?.topAspects,
    moonHouse: daily.transits?.moonHouse,
  });

  return {
    to: recipient.email,
    // Inbox copy has its own hook instead of repeating the dashboard H1.
    subject,
    react: DailyHoroscopeEmail({
      name: firstName,
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
  };
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
  idempotencyKey?: string,
): Promise<boolean> {
  const c = client();
  if (!c) return false;

  const token = await getOrCreateUnsubscribeToken(recipient.userId);
  const locale = normalizeUserLocale(recipient.locale);

  if (opts.template === "daily_horoscope") {
    const message = await buildDailyHoroscopeMessage(recipient);
    if (!message) return false;
    await acquireResendSlot();
    const { react, ...rest } = message;
    const result = await c.emails.send(
      { from: FROM, ...rest, html: await renderEmail(react) },
      idempotencyKey ? { idempotencyKey } : undefined,
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

    const unsubUrl = localizedAbsUrl(
      `/unsubscribe?token=${token}&type=nudges`,
      locale,
    );
    const onboardingUrl = localizedAbsUrl("/onboarding", locale);
    const subject =
      locale === "en"
        ? opts.campaignId
          ? "Complete your birth details and get 50 credits"
          : "Your birth chart is waiting, complete your profile"
        : opts.campaignId
          ? "შეავსე დაბადების დეტალები და მიიღე 50 კრედიტი"
          : "შენი ნატალური რუკა გელოდება, დაასრულე რეგისტრაცია";
    await acquireResendSlot();
    const result = await c.emails.send(
      {
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
      "profile_incomplete",
      recipient.email,
      subject,
      result.error?.message,
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
    if (stillPremium && !opts.allowCompletedProfile) return false;
    if (balance > LOW_CREDIT_OFFER_THRESHOLD && !opts.allowCompletedProfile) {
      return false;
    }
    const displayBalance =
      opts.allowCompletedProfile && balance > LOW_CREDIT_OFFER_THRESHOLD
        ? 2
        : balance;

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
          balance: displayBalance,
          priceLabel: formatBillingAmount(
            HALLOWEEN_PROMO_PLAN.amountMinor,
            HALLOWEEN_PROMO_PLAN.currency,
            locale,
          ),
          regularPriceLabel: formatBillingAmount(
            PREMIUM_PLANS_BY_COUNTRY.GE.amountMinor * HALLOWEEN_PROMO_MONTHS,
            PREMIUM_PLANS_BY_COUNTRY.GE.currency,
            locale,
          ),
          months: HALLOWEEN_PROMO_MONTHS,
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
  const unsubUrl = localizedAbsUrl(
    `/unsubscribe?token=${token}&type=marketing`,
    locale,
  );
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
    result.error?.message,
  );
  if (result.error) throw new Error(result.error.message ?? "send failed");
  return true;
}

/**
 * Best-effort row in the unified email log (admin "Emails" page). The daily
 * template is NOT logged here, it already has daily_email_log, which the
 * admin view merges in. Never throws.
 */
async function logToUnifiedSendLog(
  userId: string,
  kind: string,
  email: string | null,
  subject: string,
  error?: string,
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
  template: EmailTemplateKind,
): Promise<number> {
  const audience = await resolveAudience(template);
  return audience.length;
}

// ─────────────────────────────────────────────────────────────────────
// Daily horoscope blast, cron-driven, idempotent, retry-safe.
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
  /** Threw, row left status='failed' for next cron tick to retry. */
  failed: number;
  /** Pending+failed log rows still outstanding for `sendDate` after we returned. */
  remaining: number;
  durationMs: number;
};

/**
 * Resend's hard limit on emails per batch request.
 * @see https://resend.com/docs/dashboard/emails/batch-sending
 */
const RESEND_BATCH_SIZE = 100;

/**
 * Cap on individual retries when a whole batch is rejected.
 *
 * Resend rejects the ENTIRE batch if any single recipient is malformed
 * (verified: a 100-message batch with one bad `to` returns 422 and sends
 * nothing), so without a fallback one bad address would silently drop 99 valid
 * emails. The fallback recovers them.
 *
 * It must be bounded, though. Each retry goes through `acquireResendSlot()` at
 * 1.1s, so retrying a full 100-message chunk costs ~110s inside a 300s
 * `maxDuration`. If several chunks were poisoned, the invocation would be killed
 * before it could record the failures and the rows would stay pending — retried,
 * poisoned and killed again on every tick until the 48h expiry retired them.
 *
 * Bounding it means a bulk rejection falls back to marking the chunk failed,
 * which the next tick retries as a batch: cheaper, and it cannot spin.
 *
 * In practice this should be unreachable: production held zero malformed
 * recipient addresses across 2,321 users on 2026-10-16, and `to` comes from the
 * auth provider.
 */
const MAX_INDIVIDUAL_FALLBACKS = 25;

/**
 * Expire daily-horoscope rows that missed their send window.
 *
 * Why this exists: `sendDailyHoroscopeBlast` drains only rows matching the
 * current `sendDate`, so any shortfall is orphaned rather than retried. The
 * blast's throughput is capped by a serialized Resend throttle, and the
 * audience outgrew that cap in August 2026 — leaving 28,449 rows stuck in
 * `pending` back to 2026-08-09, growing daily. This converts those rows to a
 * terminal state so the backlog is honest and bounded.
 *
 * Returns the number of rows expired.
 */
export async function expireStaleDailyRows(opts: {
  /** Today's YYYY-MM-DD key. Rows on or after this date are never expired. */
  today: string;
  /** Override the per-invocation cap. Defaults to EXPIRY_BATCH_SIZE. */
  limit?: number;
}): Promise<number> {
  const cutoffs = expiryCutoffs(
    new Date(`${opts.today}T00:00:00.000Z`),
    opts.limit ?? EXPIRY_BATCH_SIZE,
  );
  // The clock-derived cutoff is what matters for age; keep `today` as the caller
  // supplied it so a retry tick and the main tick agree on the same date key.
  cutoffs.today = opts.today;

  /**
   * Bounded, idempotent sweep.
   *
   * The cap matters on first deploy: production held ~28k orphaned rows, and an
   * unbounded single UPDATE would run inside the same invocation that must also
   * send the day's email. Draining over a few ticks is safe because a retired row
   * is already undeliverable, so repeating the sweep changes nothing.
   *
   * The cap is applied through a non-correlated `(user_id, send_date) IN
   * (SELECT ... LIMIT n)` subquery, because Postgres does not support a LIMIT
   * directly on an UPDATE.
   */
  const rows = await db
    .update(dailyEmailLog)
    .set({
      status: "expired",
      lastAttemptAt: new Date(),
      lastError: `expired: undelivered ${DAILY_ROW_GRACE_HOURS}h after enqueue`,
    })
    .where(
      and(
        inArray(dailyEmailLog.status, ["pending", "failed"]),
        // Never touch today's rows: they are still legitimately drainable by
        // the retry tick.
        sql`${dailyEmailLog.sendDate} < ${opts.today}`,
        sql`${dailyEmailLog.createdAt} < ${cutoffs.cutoff}`,
        // Cap at the ROW level, matched on the composite key. Capping on
        // user_id alone would not bound the statement: a user has one backlog
        // row per missed day, so a 5,000-user cap matched ~20,000 rows in
        // production. Non-correlated, so the subquery is evaluated once.
        sql`(${dailyEmailLog.userId}, ${dailyEmailLog.sendDate}) in (
          select user_id, send_date from ${dailyEmailLog}
          where status in ('pending', 'failed')
            and send_date < ${opts.today}
            and created_at < ${cutoffs.cutoff}
          order by send_date asc
          limit ${cutoffs.limit}
        )`,
      ),
    )
    .returning({ userId: dailyEmailLog.userId });
  return rows.length;
}

/**
 * Run one pass of the daily-horoscope email blast.
 *
 * Two-phase, idempotent:
 *   1. Enqueue: INSERT … ON CONFLICT DO NOTHING for every audience row,
 *      so safe to call repeatedly.
 *   2. Drain: pick rows where status ∈ {pending, failed} for sendDate,
 *      build each message, and hand them to Resend in batches of
 *      `RESEND_BATCH_SIZE`.
 *
 * Batched transport is what makes the audience reachable. The previous
 * one-request-per-recipient path serialized through acquireResendSlot() at
 * ~0.9 emails/sec, which capped a full invocation at roughly 540 sends. By
 * October 2026 the audience was 1,458 and delivery had fallen to 41%, with
 * everything sequenced after the blast in the cron starved as a result.
 *
 * Per-user prep (chart lookup, unsubscribe token, localized subject) is still
 * one-per-recipient and runs with `concurrency` parallelism; only the sending
 * is batched.
 *
 * DURABILITY TRADE-OFF, read before changing this. The previous
 * one-request-per-recipient path passed `Idempotency-Key=daily:<user>:<date>`
 * to Resend, so an at-least-once retry could not double-send. **Resend's batch
 * endpoint does not accept per-email idempotency keys.** A batch that Resend
 * accepts but whose response we lose (invocation killed mid-drain) will be
 * retried by the next tick and can deliver a second copy of that day's
 * horoscope to the affected recipients.
 *
 * The trade is deliberate: the unbatched path could not reach the audience at
 * all (41% delivery, 1,458 recipients, ~540/day ceiling), and a rare duplicate
 * is a far better failure than two thirds of opted-in users never receiving
 * their email. The `RESEND_BATCH_SIZE`-sized blast radius is the reason batch
 * size is bounded rather than maximised.
 *
 * If duplicates ever become a support problem, the fix is to stamp an
 * in-flight marker on the rows before the batch call and cap retries, not to
 * revert the batching.
 *
 * If Vercel kills the function mid-drain (maxDuration), the next cron tick
 * picks up the remaining rows.
 */
export async function sendDailyHoroscopeBlast(opts: {
  /** YYYY-MM-DD, the calendar day this batch belongs to. Use the UTC date
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
  const inserted =
    opts.enqueue === false
      ? []
      : await db
          .insert(dailyEmailLog)
          .values(
            audience.map((r) => ({
              userId: r.userId,
              sendDate: opts.sendDate,
            })),
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
        inArray(dailyEmailLog.status, ["pending", "failed"]),
      ),
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

  // Build every message first (per-user chart/token/subject work), then send
  // in batches. Prep stays parallel; transport is batched.
  type Built = { recipient: Recipient; message: DailyMessageBody };
  const built: Built[] = [];
  const skippedRecipients: Recipient[] = [];
  const buildFailures: { recipient: Recipient; message: string }[] = [];

  await pMap(
    targets,
    async (recipient) => {
      try {
        const message = await buildDailyHoroscopeMessage(recipient);
        if (message) {
          built.push({ recipient, message });
        } else {
          skippedRecipients.push(recipient);
        }
      } catch (err) {
        buildFailures.push({
          recipient,
          message: (err as Error).message ?? "unknown",
        });
      }
    },
    opts.concurrency ?? 8,
  );

  const mark = async (
    rows: Recipient[],
    status: "sent" | "skipped" | "failed",
    error: string | null = null,
  ) => {
    if (rows.length === 0) return;
    await db
      .update(dailyEmailLog)
      .set({
        status,
        attempts: sql`${dailyEmailLog.attempts} + 1`,
        lastAttemptAt: new Date(),
        ...(status === "sent" ? { sentAt: new Date(), lastError: null } : {}),
        ...(status === "failed"
          ? { lastError: error?.slice(0, 500) ?? null }
          : {}),
      })
      .where(
        and(
          inArray(
            dailyEmailLog.userId,
            rows.map((r) => r.userId),
          ),
          eq(dailyEmailLog.sendDate, opts.sendDate),
        ),
      );
  };

  // Batched transport: one request per RESEND_BATCH_SIZE emails instead of one
  // per recipient. This is the change that lifts delivery past the ~540/day
  // serial ceiling.
  for (let i = 0; i < built.length; i += RESEND_BATCH_SIZE) {
    const chunk = built.slice(i, i + RESEND_BATCH_SIZE);
    try {
      const response = await c.batch.send(
        chunk.map((b) => ({ from: FROM, ...b.message })),
      );
      if (response.error) {
        // A whole-chunk rejection (validation, payload size) retries messages
        // individually so one bad recipient cannot sink a whole batch — but only
        // up to MAX_INDIVIDUAL_FALLBACKS. Beyond that, mark the chunk failed and
        // let the next tick retry it as a batch, which is far cheaper than
        // spending the invocation's remaining time on doomed serial sends.
        const fallbackTargets = chunk.slice(0, MAX_INDIVIDUAL_FALLBACKS);
        if (chunk.length > MAX_INDIVIDUAL_FALLBACKS) {
          await mark(
            chunk.slice(MAX_INDIVIDUAL_FALLBACKS).map((b) => b.recipient),
            "failed",
            `batch rejected (${response.error.message ?? "unknown"}); deferred to next run`,
          );
          failed += chunk.length - MAX_INDIVIDUAL_FALLBACKS;
        }
        for (const item of fallbackTargets) {
          try {
            const { react, ...rest } = item.message;
            const single = await c.emails.send({
              from: FROM,
              ...rest,
              html: await renderEmail(react),
            });
            if (single.error) {
              await mark([item.recipient], "failed", single.error.message);
              failed++;
            } else {
              await mark([item.recipient], "sent");
              sent++;
            }
          } catch (err) {
            await mark([item.recipient], "failed", (err as Error).message);
            failed++;
          }
        }
        continue;
      }
      await mark(
        chunk.map((b) => b.recipient),
        "sent",
      );
      sent += chunk.length;
    } catch (err) {
      const message = (err as Error).message ?? "unknown";
      await mark(
        chunk.map((b) => b.recipient),
        "failed",
        message,
      );
      failed += chunk.length;
    }
  }

  await mark(skippedRecipients, "skipped");
  skipped += skippedRecipients.length;

  await mark(
    buildFailures.map((f) => f.recipient),
    "failed",
    buildFailures[0]?.message ?? null,
  );
  failed += buildFailures.length;

  // 3) Final outstanding count for the response.
  const remainingRows = await db
    .select({ userId: dailyEmailLog.userId })
    .from(dailyEmailLog)
    .where(
      and(
        eq(dailyEmailLog.sendDate, opts.sendDate),
        inArray(dailyEmailLog.status, ["pending", "failed"]),
      ),
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

/** UTC date string in YYYY-MM-DD, what the cron should pass as sendDate. */
export function utcDateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}
