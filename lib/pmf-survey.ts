/**
 * Sean Ellis PMF baseline survey sender.
 *
 * Audience: marketing-consented users active in the last 30 days — the
 * people whose disappointment would actually mean something. One send per
 * user per wave, enforced by the `pmf_survey` claim rows in
 * `email_send_log` plus the unique response row itself.
 */
import { Resend } from "resend";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog, pmfSurveyResponses, users } from "@/db/schema";
import { PmfSurveyEmail } from "@/lib/email-templates/pmf-survey";
import { PER_JOB_SEND_CAP, type SendBudget } from "@/lib/email-send-budget";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import {
  PMF_ANSWERS,
  PMF_SURVEY_KIND,
  PMF_WAVE,
  pmfScore,
} from "@/lib/pmf-survey-rules";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { ENGLISH_SITE_URL, GEORGIAN_SITE_URL } from "@/lib/seo/locales";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";

const ORIGIN = process.env.APP_ORIGIN ?? GEORGIAN_SITE_URL;

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
    return "Jedno pytanie: jak bardzo brakowałoby Ci Vivida?";
  if (locale === "en") return "One question: how much would you miss Vivida?";
  return "ერთი კითხვა: რამდენად მოგენატრებოდა Vivida?";
}

export type PmfSurveyResult = {
  candidates: number;
  emailed: number;
  skipped: number;
  failed: number;
};

export async function sendPmfSurvey(
  budget?: SendBudget,
): Promise<PmfSurveyResult> {
  const result: PmfSurveyResult = {
    candidates: 0,
    emailed: 0,
    skipped: 0,
    failed: 0,
  };

  const since = new Date(Date.now() - 30 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .where(
      and(
        eq(users.emailMarketing, true),
        sql`EXISTS (
          SELECT 1 FROM user_activity_day a
          WHERE a.user_id = ${users.id} AND a.date_local >= ${since}
        )`,
        sql`NOT EXISTS (
          SELECT 1 FROM pmf_survey_response r
          WHERE r.user_id = ${users.id} AND r.wave = ${PMF_WAVE}
        )`,
      ),
    );
  const candidates = rows.filter(
    (r): r is typeof r & { email: string } => !!r.email,
  );
  result.candidates = candidates.length;
  if (candidates.length === 0) return result;

  const alreadySentRows = await db
    .select({ userId: emailSendLog.userId })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.kind, PMF_SURVEY_KIND),
        inArray(
          emailSendLog.userId,
          candidates.map((c) => c.userId),
        ),
        inArray(emailSendLog.status, ["sent", "pending"]),
      ),
    );
  const alreadySent = new Set(alreadySentRows.map((r) => r.userId));
  const fresh = candidates.filter((c) => !alreadySent.has(c.userId));
  result.skipped += candidates.length - fresh.length;
  if (fresh.length === 0) return result;

  const resendKey = process.env.RESEND_API_KEY;
  const resend = resendKey ? new Resend(resendKey) : null;
  if (!resend) {
    console.warn("[pmf-survey] RESEND_API_KEY missing, cannot send");
    result.skipped += fresh.length;
    return result;
  }

  const allowance = budget
    ? budget.reserve(fresh.length, PER_JOB_SEND_CAP)
    : fresh.length;
  let sentThisRun = 0;

  for (const candidate of fresh) {
    if (sentThisRun >= allowance) break;
    const locale = normalizeUserLocale(candidate.locale);
    const en = locale === "en";
    const origin = en ? ENGLISH_SITE_URL : ORIGIN;
    const subject = subjectFor(locale);

    const [claim] = await db
      .insert(emailSendLog)
      .values({
        userId: candidate.userId,
        kind: PMF_SURVEY_KIND,
        email: candidate.email,
        subject,
        status: "pending",
      })
      .returning({ id: emailSendLog.id });

    try {
      const token = await getOrCreateUnsubscribeToken(candidate.userId);
      const unsubUrl = `${origin}/unsubscribe?token=${token}&type=marketing`;
      const answerUrls = Object.fromEntries(
        PMF_ANSWERS.map((a) => [
          a,
          `${origin}/api/pmf/respond?t=${token}&a=${a}`,
        ]),
      ) as Record<(typeof PMF_ANSWERS)[number], string>;

      await acquireResendSlot();
      const sendResult = await resend.emails.send(
        {
          from: FROM,
          to: candidate.email,
          subject,
          react: PmfSurveyEmail({
            name: candidate.name?.split(" ")[0] ?? null,
            answerUrls,
            unsubscribeUrl: unsubUrl,
            locale,
          }),
          headers: {
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        },
        {
          idempotencyKey: `${PMF_SURVEY_KIND}:${PMF_WAVE}:${candidate.userId}`,
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
        `[pmf-survey] failed for ${candidate.userId}:`,
        (err as Error).message,
      );
      try {
        await db
          .update(emailSendLog)
          .set({ status: "failed", error: (err as Error).message })
          .where(eq(emailSendLog.id, claim.id));
      } catch {
        /* claim row will age out */
      }
      result.failed++;
    }
  }

  return result;
}

/** Current wave's scoreboard: response count and the Sean Ellis percentage. */
export async function pmfSurveyScoreboard(): Promise<{
  responses: number;
  veryDisappointedPct: number;
}> {
  const rows = await db
    .select({ answer: pmfSurveyResponses.answer })
    .from(pmfSurveyResponses)
    .where(eq(pmfSurveyResponses.wave, PMF_WAVE));
  return {
    responses: rows.length,
    veryDisappointedPct: pmfScore(rows.map((r) => r.answer)),
  };
}
