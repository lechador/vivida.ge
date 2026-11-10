/**
 * Last-day-of-trial reminder, run from the daily lifecycle cron.
 *
 * A first charge must never be a surprise: on the trial's last day the
 * reader gets one email naming the exact first-charge amount, the cadence
 * they picked at trial start, and the two-click way out. Trials that are
 * already cancelled (cancel_at_period_end or a recorded canceled_at) are
 * excluded — telling them "it will continue" would be false.
 *
 * Idempotency follows the winback pattern: a `trial_ending` claim row in
 * `email_send_log` (pending → sent/failed) is inserted before sending, and
 * Resend receives a per-(user, trial-end) Idempotency-Key. One trial per
 * account means a single sent claim suppresses the reminder forever.
 */
import { Resend } from "resend";
import { and, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog, premiumSubscriptions, users } from "@/db/schema";
import { formatBillingAmount } from "@/lib/billing-config";
import { TrialEndingEmail } from "@/lib/email-templates/trial-ending";
import {
  isLifecycleFrequencyCapped,
  lifecycleCapSkipReason,
} from "@/lib/email-frequency-cap";
import { PER_JOB_SEND_CAP, type SendBudget } from "@/lib/email-send-budget";
import { kaDayMonth } from "@/lib/i18n/ka-date";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";
import {
  isTrialEndingDue,
  trialCadenceMonths,
  TRIAL_REMINDER_KIND,
} from "@/lib/trial-reminder-rules";

export { TRIAL_REMINDER_KIND };

const ORIGIN = process.env.APP_ORIGIN ?? "https://www.vivida.ge";

function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}
const FROM = resolveFrom(
  process.env.RESEND_FROM,
  "Vivida <onboarding@resend.dev>",
);

function cadenceLabel(months: number, locale: UserLocale): string {
  if (locale === "pl")
    return months === 1 ? "co miesiąc" : `co ${months} miesiące`;
  if (locale === "en")
    return months === 1 ? "every month" : `every ${months} months`;
  return months === 1 ? "ყოველთვიურად" : `ყოველ ${months} თვეში ერთხელ`;
}

function endDateLabel(end: Date, locale: UserLocale): string {
  if (locale === "ka") return kaDayMonth(end);
  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    day: "numeric",
    month: "long",
  }).format(end);
}

function subjectFor(amountLabel: string, locale: UserLocale): string {
  if (locale === "pl")
    return `Jutro kończy się Twój darmowy okres próbny — potem ${amountLabel}, chyba że anulujesz`;
  if (locale === "en")
    return `Your free trial ends tomorrow — then ${amountLabel}, unless you cancel`;
  return `ხვალ უფასო პერიოდი გისრულდება — მერე ${amountLabel}, თუ არ გააუქმებ`;
}

export type TrialReminderResult = {
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
  planKey: string;
  amountMinor: number;
  currency: string;
  periodEnd: Date;
};

async function findCandidates(now: Date): Promise<Candidate[]> {
  const rows = await db
    .select({
      userId: premiumSubscriptions.userId,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
      planKey: premiumSubscriptions.planKey,
      amountMinor: premiumSubscriptions.amountMinor,
      currency: premiumSubscriptions.currency,
      periodEnd: premiumSubscriptions.currentPeriodEnd,
    })
    .from(premiumSubscriptions)
    .innerJoin(users, eq(users.id, premiumSubscriptions.userId))
    .where(
      and(
        eq(premiumSubscriptions.status, "trialing"),
        eq(premiumSubscriptions.cancelAtPeriodEnd, false),
        isNull(premiumSubscriptions.canceledAt),
      ),
    );
  return rows
    .filter((r): r is typeof r & { email: string } => !!r.email)
    .filter((r) => isTrialEndingDue(r.periodEnd, now))
    .map((r) => ({
      userId: r.userId,
      email: r.email,
      name: r.name,
      locale: normalizeUserLocale(r.locale),
      planKey: r.planKey,
      amountMinor: r.amountMinor,
      currency: r.currency,
      periodEnd: r.periodEnd,
    }));
}

async function alreadyReminded(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const rows = await db
    .select({ userId: emailSendLog.userId })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.kind, TRIAL_REMINDER_KIND),
        inArray(emailSendLog.userId, userIds),
        inArray(emailSendLog.status, ["sent", "pending"]),
      ),
    );
  return new Set(rows.map((r) => r.userId));
}

export async function sendTrialEndingReminders(
  budget?: SendBudget,
): Promise<TrialReminderResult> {
  const result: TrialReminderResult = {
    candidates: 0,
    emailed: 0,
    skipped: 0,
    failed: 0,
  };
  const candidates = await findCandidates(new Date());
  result.candidates = candidates.length;
  if (candidates.length === 0) return result;

  const reminded = await alreadyReminded(candidates.map((c) => c.userId));
  const fresh = candidates.filter((c) => !reminded.has(c.userId));
  result.skipped += candidates.length - fresh.length;
  if (fresh.length === 0) return result;

  const resendKey = process.env.RESEND_API_KEY;
  const resend = resendKey ? new Resend(resendKey) : null;
  if (!resend) {
    console.warn("[trial-reminders] RESEND_API_KEY missing, cannot send");
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
    const origin = locale === "ka" ? ORIGIN : ENGLISH_SITE_URL;
    const amountLabel = formatBillingAmount(
      candidate.amountMinor,
      candidate.currency,
      locale,
    );
    const subject = subjectFor(amountLabel, locale);

    if (await isLifecycleFrequencyCapped(candidate.userId)) {
      await db.insert(emailSendLog).values({
        userId: candidate.userId,
        kind: TRIAL_REMINDER_KIND,
        email: candidate.email,
        subject,
        status: "skipped",
        error: lifecycleCapSkipReason(),
      });
      result.skipped++;
      continue;
    }

    // Claim first: even a crashed run cannot double-send this reminder.
    const [claim] = await db
      .insert(emailSendLog)
      .values({
        userId: candidate.userId,
        kind: TRIAL_REMINDER_KIND,
        email: candidate.email,
        subject,
        status: "pending",
      })
      .returning({ id: emailSendLog.id });

    try {
      const token = await getOrCreateUnsubscribeToken(candidate.userId);
      const unsubUrl = `${origin}/unsubscribe?token=${token}&type=nudges`;
      const manageUrl = `${origin}/login?next=${encodeURIComponent("/subscription")}`;

      await acquireResendSlot();
      const sendResult = await resend.emails.send(
        {
          from: FROM,
          to: candidate.email,
          subject,
          react: TrialEndingEmail({
            name: candidate.name?.split(" ")[0] ?? null,
            amountLabel,
            cadenceLabel: cadenceLabel(
              trialCadenceMonths(candidate.planKey),
              locale,
            ),
            endDateLabel: endDateLabel(candidate.periodEnd, locale),
            manageUrl,
            unsubscribeUrl: unsubUrl,
            locale,
          }),
          headers: {
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        },
        {
          idempotencyKey: `${TRIAL_REMINDER_KIND}:${candidate.userId}:${candidate.periodEnd.toISOString()}`,
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

      if (isPushConfigured()) {
        try {
          await sendPushToUser(candidate.userId, {
            title:
              locale === "pl"
                ? "Jutro kończy się darmowy okres próbny"
                : en
                  ? "Your free trial ends tomorrow"
                  : "ხვალ უფასო პერიოდი გისრულდება",
            body:
              locale === "pl"
                ? `Potem ${amountLabel}, chyba że anulujesz. Szczegóły w e-mailu.`
                : en
                  ? `Then ${amountLabel}, unless you cancel. Details in your email.`
                  : `მერე ${amountLabel} ჩამოიჭრება, თუ არ გააუქმებ. დეტალები მეილშია.`,
            url: "/subscription",
            tag: TRIAL_REMINDER_KIND,
          });
        } catch (err) {
          console.warn(
            "[trial-reminders] push failed:",
            (err as Error).message,
          );
        }
      }
    } catch (err) {
      console.warn(
        `[trial-reminders] failed for ${candidate.userId}:`,
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
