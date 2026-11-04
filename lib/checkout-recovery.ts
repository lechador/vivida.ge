/**
 * Abandoned-checkout recovery, run from the daily lifecycle cron.
 *
 * Roughly three of four started checkouts never finish (measured: 88
 * started vs 22 purchased across the paywall experiments to 2026-11).
 * One email 1–48 hours later brings the reader back to the hub; readers
 * who never had a subscription also see the free-trial alternative.
 *
 * Exclusions, all re-checked at send time: anyone who purchased after the
 * abandoned start (any purchase_completed outcome), anyone currently
 * entitled to PRO, and anyone already sent this recovery in the last 7
 * days. Claim-first `email_send_log` rows and a per-start Resend
 * Idempotency-Key make repeated cron runs send at most once per start.
 */
import { Resend } from "resend";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  emailSendLog,
  experimentEvents,
  premiumSubscriptions,
  users,
} from "@/db/schema";
import { PRO_TRIAL_DAYS } from "@/lib/billing-config";
import {
  CHECKOUT_RECOVERY_COOLDOWN_MS,
  CHECKOUT_RECOVERY_KIND,
  isAbandonedCheckout,
} from "@/lib/checkout-recovery-rules";
import { CheckoutRecoveryEmail } from "@/lib/email-templates/checkout-recovery";
import {
  isLifecycleFrequencyCapped,
  lifecycleCapSkipReason,
} from "@/lib/email-frequency-cap";
import { PER_JOB_SEND_CAP, type SendBudget } from "@/lib/email-send-budget";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";

const ORIGIN = process.env.APP_ORIGIN ?? "https://www.vivida.ge";

function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}
const FROM = resolveFrom(
  process.env.RESEND_FROM,
  "Vivida <onboarding@resend.dev>",
);

function subjectFor(locale: UserLocale): string {
  if (locale === "pl")
    return "Twoja płatność w Vivida nie została dokończona — brakuje jednego kroku";
  if (locale === "en")
    return "Your Vivida checkout did not finish — one step left";
  return "შენი შეძენა Vivida-ზე არ დასრულებულა — ერთი ნაბიჯი დაგრჩა";
}

export type CheckoutRecoveryResult = {
  candidates: number;
  emailed: number;
  skipped: number;
  failed: number;
};

type Candidate = {
  userId: string;
  email: string;
  name: string | null;
  locale: UserLocale;
  startedAt: Date;
  trialEligible: boolean;
};

async function findCandidates(now: Date): Promise<Candidate[]> {
  const rows = await db
    .select({
      userId: experimentEvents.userId,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
      startedAt: experimentEvents.createdAt,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
      subHistory: premiumSubscriptions.userId,
    })
    .from(experimentEvents)
    .innerJoin(users, eq(users.id, experimentEvents.userId))
    .leftJoin(
      premiumSubscriptions,
      eq(premiumSubscriptions.userId, experimentEvents.userId),
    )
    .where(
      and(
        eq(experimentEvents.eventType, "outcome"),
        eq(experimentEvents.eventName, "checkout_started"),
        sql`${experimentEvents.createdAt} <= ${new Date(now.getTime() - 3_600_000)}`,
        sql`${experimentEvents.createdAt} >= ${new Date(now.getTime() - 48 * 3_600_000)}`,
        // Purchased after this start: the rescue has nothing to rescue.
        sql`NOT EXISTS (
          SELECT 1 FROM experiment_event p
          WHERE p.user_id = ${experimentEvents.userId}
            AND p.event_type = 'outcome'
            AND p.event_name = 'purchase_completed'
            AND p.created_at >= ${experimentEvents.createdAt}
        )`,
      ),
    )
    .orderBy(experimentEvents.createdAt);

  const byUser = new Map<string, Candidate>();
  for (const r of rows) {
    if (!r.email) continue;
    if (
      r.isPremium &&
      r.premiumUntil &&
      r.premiumUntil.getTime() > now.getTime()
    )
      continue;
    if (!isAbandonedCheckout(r.startedAt, now)) continue;
    // One candidate per user, anchored on their most recent abandoned start.
    byUser.set(r.userId, {
      userId: r.userId,
      email: r.email,
      name: r.name,
      locale: normalizeUserLocale(r.locale),
      startedAt: r.startedAt,
      trialEligible: !r.subHistory,
    });
  }
  return [...byUser.values()];
}

async function recentlyRecovered(
  userIds: string[],
  now: Date,
): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const since = new Date(now.getTime() - CHECKOUT_RECOVERY_COOLDOWN_MS);
  const rows = await db
    .select({ userId: emailSendLog.userId })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.kind, CHECKOUT_RECOVERY_KIND),
        inArray(emailSendLog.userId, userIds),
        inArray(emailSendLog.status, ["sent", "pending"]),
        sql`${emailSendLog.sentAt} >= ${since}`,
      ),
    );
  return new Set(rows.map((r) => r.userId));
}

export async function sendCheckoutRecovery(
  budget?: SendBudget,
): Promise<CheckoutRecoveryResult> {
  const result: CheckoutRecoveryResult = {
    candidates: 0,
    emailed: 0,
    skipped: 0,
    failed: 0,
  };
  const now = new Date();
  const candidates = await findCandidates(now);
  result.candidates = candidates.length;
  if (candidates.length === 0) return result;

  const recovered = await recentlyRecovered(
    candidates.map((c) => c.userId),
    now,
  );
  const fresh = candidates.filter((c) => !recovered.has(c.userId));
  result.skipped += candidates.length - fresh.length;
  if (fresh.length === 0) return result;

  const resendKey = process.env.RESEND_API_KEY;
  const resend = resendKey ? new Resend(resendKey) : null;
  if (!resend) {
    console.warn("[checkout-recovery] RESEND_API_KEY missing, cannot send");
    result.skipped += fresh.length;
    return result;
  }

  const allowance = budget
    ? budget.reserve(fresh.length, PER_JOB_SEND_CAP)
    : PER_JOB_SEND_CAP;
  let sentThisRun = 0;

  for (const candidate of fresh) {
    if (sentThisRun >= allowance) break;
    const locale = candidate.locale;
    const en = locale === "en";
    const origin = en ? ENGLISH_SITE_URL : ORIGIN;
    const subject = subjectFor(locale);

    if (await isLifecycleFrequencyCapped(candidate.userId)) {
      await db.insert(emailSendLog).values({
        userId: candidate.userId,
        kind: CHECKOUT_RECOVERY_KIND,
        email: candidate.email,
        subject,
        status: "skipped",
        error: lifecycleCapSkipReason(),
      });
      result.skipped++;
      continue;
    }

    const [claim] = await db
      .insert(emailSendLog)
      .values({
        userId: candidate.userId,
        kind: CHECKOUT_RECOVERY_KIND,
        email: candidate.email,
        subject,
        status: "pending",
      })
      .returning({ id: emailSendLog.id });

    try {
      const token = await getOrCreateUnsubscribeToken(candidate.userId);
      const unsubUrl = `${origin}/unsubscribe?token=${token}&type=nudges`;
      const recoveryUrl = `${origin}/login?next=${encodeURIComponent("/credits?product=checkout_recovery")}`;
      const trialUrl = candidate.trialEligible
        ? `${origin}/login?next=${encodeURIComponent("/subscription?product=checkout_recovery")}`
        : null;

      await acquireResendSlot();
      const sendResult = await resend.emails.send(
        {
          from: FROM,
          to: candidate.email,
          subject,
          react: CheckoutRecoveryEmail({
            name: candidate.name?.split(" ")[0] ?? null,
            recoveryUrl,
            trialUrl,
            trialDays: PRO_TRIAL_DAYS,
            unsubscribeUrl: unsubUrl,
            locale,
          }),
          headers: {
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        },
        {
          idempotencyKey: `${CHECKOUT_RECOVERY_KIND}:${candidate.userId}:${candidate.startedAt.toISOString()}`,
        },
      );

      if (sendResult.error) {
        await db
          .update(emailSendLog)
          .set({ status: "failed", error: sendResult.error.message })
          .where(eq(emailSendLog.id, claim.id));
        result.failed++;
        continue;
      }

      await db
        .update(emailSendLog)
        .set({ status: "sent" })
        .where(eq(emailSendLog.id, claim.id));
      result.emailed++;
      sentThisRun++;
    } catch (err) {
      console.warn(
        `[checkout-recovery] failed for ${candidate.userId}:`,
        (err as Error).message,
      );
      try {
        await db
          .update(emailSendLog)
          .set({ status: "failed", error: (err as Error).message })
          .where(eq(emailSendLog.id, claim.id));
      } catch {
        /* claim row will age out; the send itself already failed */
      }
      result.failed++;
    }
  }

  return result;
}
