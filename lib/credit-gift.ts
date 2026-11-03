/**
 * Credit-gift campaign: 10 free credits for engaged users who spent credits
 * on paid features (tarot, AI chat, synastry, reports…), ran their balance
 * down to <= 3, and never once topped up. The point is reactivation: they
 * already know the paid product is good, they just hit the wall.
 *
 * Order of operations per user matters:
 *   1. claim an email_send_log row (kind='credit_gift'), the campaign guard
 *   2. grant via grantCreditsOnce with ref `credit-gift-10-2026-11:<userId>`
 *      (exactly-once even if this runner is re-executed; also fires the
 *      in-app credit bell notification)
 *   3. send the announcement email saying the credits ARE on the balance
 *
 * An email failure therefore never costs the user the gift, the log row
 * records 'failed' for follow-up. Campaign rows in email_campaign let
 * `completeEligibleEmailCampaigns` stamp conversions on the user's next
 * visit; reward_credits stays 0 because the gift is paid up front, not on
 * conversion.
 */
import { Resend } from "resend";
import { render as renderEmail } from "@react-email/render";
import { and, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creditAccounts,
  emailCampaignRecipients,
  emailCampaigns,
  emailSendLog,
  users,
} from "@/db/schema";
import { grantCreditsOnce } from "@/lib/credits";
import {
  CREDIT_GIFT_SUBJECT,
  CREDIT_GIFT_SUBJECT_EN,
  CreditGiftEmail,
} from "@/lib/email-templates/credit-gift";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { isPremiumUser } from "@/lib/premium";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";

export {
  CREDIT_GIFT_AMOUNT,
  CREDIT_GIFT_BALANCE_THRESHOLD,
  CREDIT_GIFT_CAMPAIGN_SLUG,
  CREDIT_GIFT_SEND_LOG_KIND,
  creditGiftGrantRef,
  creditGiftIdempotencyKey,
  creditGiftLogKind,
} from "./credit-gift-pure";
import {
  CREDIT_GIFT_AMOUNT,
  CREDIT_GIFT_BALANCE_THRESHOLD,
  CREDIT_GIFT_CAMPAIGN_SLUG,
  CREDIT_GIFT_SEND_LOG_KIND,
  creditGiftGrantRef,
  creditGiftIdempotencyKey,
  creditGiftLogKind,
} from "./credit-gift-pure";

function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}

const FROM = resolveFrom(process.env.RESEND_FROM, "Vivida <hello@vivida.ge>");
const ORIGIN = process.env.EMAIL_ORIGIN ?? "https://vivida.ge";

function localizedAbsUrl(path: string, locale: UserLocale): string {
  const origin = locale === "ka" ? ORIGIN : ENGLISH_SITE_URL;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export type CreditGiftRecipient = {
  userId: string;
  email: string;
  name: string | null;
  locale: string;
  balance: number;
};

/**
 * The cohort: at least one real `spend_*` ledger row, balance <= threshold,
 * no `purchase` row ever, not currently PRO, reachable and opted in.
 */
export async function resolveCreditGiftAudience(): Promise<
  CreditGiftRecipient[]
> {
  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
      balance: sql<number>`coalesce(${creditAccounts.balance}, 0)`,
    })
    .from(users)
    .leftJoin(creditAccounts, eq(creditAccounts.userId, users.id))
    .where(
      and(
        isNotNull(users.email),
        eq(users.emailMarketing, true),
        sql`coalesce(${creditAccounts.balance}, 0) <= ${CREDIT_GIFT_BALANCE_THRESHOLD}`,
        sql`not (${users.isPremium} and ${users.premiumUntil} is not null and ${users.premiumUntil} > now())`,
        sql`exists (select 1 from credit_transaction ct where ct.user_id = ${users.id} and ct.reason like 'spend_%')`,
        sql`not exists (select 1 from credit_transaction ct where ct.user_id = ${users.id} and ct.reason = 'purchase')`,
      ),
    );
  return rows
    .filter((r): r is CreditGiftRecipient => !!r.email)
    .map((r) => ({ ...r, balance: Number(r.balance) }));
}

async function ensureCampaign(): Promise<string> {
  const [inserted] = await db
    .insert(emailCampaigns)
    .values({
      slug: CREDIT_GIFT_CAMPAIGN_SLUG,
      name: "Credit gift 10 (Nov 2026)",
      template: "credit_gift",
      subject: CREDIT_GIFT_SUBJECT,
      rewardCredits: 0,
      status: "active",
      launchedAt: new Date(),
    })
    .onConflictDoNothing({ target: emailCampaigns.slug })
    .returning({ id: emailCampaigns.id });
  if (inserted) return inserted.id;
  const [existing] = await db
    .select({ id: emailCampaigns.id })
    .from(emailCampaigns)
    .where(eq(emailCampaigns.slug, CREDIT_GIFT_CAMPAIGN_SLUG))
    .limit(1);
  return existing.id;
}

async function alreadySent(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: emailSendLog.id })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.userId, userId),
        eq(emailSendLog.kind, CREDIT_GIFT_SEND_LOG_KIND),
        eq(emailSendLog.status, "sent"),
      ),
    )
    .limit(1);
  return !!row;
}

export type CreditGiftResult = {
  audience: number;
  granted: number;
  emailed: number;
  skipped: number;
  failed: Array<{ userId: string; error: string }>;
};

/** Grant + email one user. Shared by the campaign run and the test send. */
async function giftAndEmail(
  resend: Resend,
  campaignId: string,
  recipient: CreditGiftRecipient,
  isTest: boolean,
): Promise<{ outcome: "sent" | "skipped"; granted: boolean }> {
  if (!isTest && (await alreadySent(recipient.userId)))
    return { outcome: "skipped", granted: false };

  const locale = normalizeUserLocale(recipient.locale);
  const subject =
    locale === "en" ? CREDIT_GIFT_SUBJECT_EN : CREDIT_GIFT_SUBJECT;

  const [claim] = await db
    .insert(emailSendLog)
    .values({
      userId: recipient.userId,
      kind: creditGiftLogKind(isTest),
      email: recipient.email,
      subject,
      status: "pending",
    })
    .returning({ id: emailSendLog.id });

  await db
    .insert(emailCampaignRecipients)
    .values({
      campaignId,
      userId: recipient.userId,
      email: recipient.email,
      isTest,
      status: "pending",
    })
    .onConflictDoNothing({
      target: [
        emailCampaignRecipients.campaignId,
        emailCampaignRecipients.userId,
      ],
    });

  try {
    // Gift first: the email announces credits that are already spendable.
    // PRO testers get the preview mail only, credits are meaningless to them.
    const granted =
      !(await isPremiumUser(recipient.userId)) &&
      (await grantCreditsOnce(
        recipient.userId,
        CREDIT_GIFT_AMOUNT,
        "admin_grant",
        creditGiftGrantRef(recipient.userId, isTest),
      ));

    const token = await getOrCreateUnsubscribeToken(recipient.userId);
    const unsubUrl = localizedAbsUrl(
      `/unsubscribe?token=${token}&type=marketing`,
      locale,
    );
    // Logged-out readers must land back on /taro after signing in.
    const tarotUrl = localizedAbsUrl("/login?next=%2Ftaro", locale);

    await acquireResendSlot();
    const result = await resend.emails.send(
      {
        from: FROM,
        to: recipient.email,
        subject,
        html: await renderEmail(
          CreditGiftEmail({
            name: recipient.name?.split(" ")[0] ?? null,
            balance: recipient.balance,
            amount: CREDIT_GIFT_AMOUNT,
            tarotUrl,
            unsubscribeUrl: unsubUrl,
            locale,
          }),
        ),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      { idempotencyKey: creditGiftIdempotencyKey(recipient.userId, isTest) },
    );
    if (result.error) throw new Error(result.error.message ?? "send failed");

    await db
      .update(emailSendLog)
      .set({ status: "sent" })
      .where(eq(emailSendLog.id, claim.id));
    await db
      .update(emailCampaignRecipients)
      .set({ status: "sent", sentAt: new Date() })
      .where(
        and(
          eq(emailCampaignRecipients.campaignId, campaignId),
          eq(emailCampaignRecipients.userId, recipient.userId),
        ),
      );
    return { outcome: "sent", granted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(emailSendLog)
      .set({ status: "failed", error: message })
      .where(eq(emailSendLog.id, claim.id));
    await db
      .update(emailCampaignRecipients)
      .set({ status: "failed", error: message })
      .where(
        and(
          eq(emailCampaignRecipients.campaignId, campaignId),
          eq(emailCampaignRecipients.userId, recipient.userId),
        ),
      );
    throw err;
  }
}

/** Full campaign run. Grant-then-email, per user, throttled to Resend limits. */
export async function runCreditGiftCampaign(): Promise<CreditGiftResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  const resend = new Resend(key);

  const audience = await resolveCreditGiftAudience();
  const campaignId = await ensureCampaign();
  const result: CreditGiftResult = {
    audience: audience.length,
    granted: 0,
    emailed: 0,
    skipped: 0,
    failed: [],
  };

  for (const recipient of audience) {
    try {
      const { outcome, granted } = await giftAndEmail(
        resend,
        campaignId,
        recipient,
        false,
      );
      if (outcome === "skipped") {
        result.skipped++;
        continue;
      }
      result.emailed++;
      if (granted) result.granted++;
    } catch (err) {
      result.failed.push({
        userId: recipient.userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return result;
}

/** Preview: grant + send to a single user by email, marked is_test. */
export async function sendCreditGiftTest(email: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  const resend = new Resend(key);

  const [row] = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
      balance: sql<number>`coalesce(${creditAccounts.balance}, 0)`,
    })
    .from(users)
    .leftJoin(creditAccounts, eq(creditAccounts.userId, users.id))
    .where(eq(users.email, email))
    .limit(1);
  if (!row?.email) return false;

  const campaignId = await ensureCampaign();
  await giftAndEmail(
    resend,
    campaignId,
    {
      userId: row.userId,
      email: row.email,
      name: row.name,
      locale: row.locale,
      balance: Number(row.balance),
    },
    true,
  );
  return true;
}
