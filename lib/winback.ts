/**
 * Dormant win-back sequence v1 (3 steps), run from the daily lifecycle cron.
 *
 * Audience: registered, email-verified users with nudges on whose most recent
 * `user_activity_day.date_local` is between 8 and 21 days old. Steps are
 * anchored on that last visit:
 *
 *   step 1  >= 8 days   winback_v1_s1   daily horoscope
 *   step 2  >= 11 days  winback_v1_s2   moon phase / weekly transit
 *   step 3  >= 14 days  winback_v1_s3   tarot for a decision
 *
 * One step per user per run. The sequence exits on return (`lastVisit` leaves
 * the dormant window), purchase, or a nudges unsubscribe. A user who already
 * received part of a sequence keeps that spell: claims younger than the current
 * anchor are the previous spell and impose a 30-day re-enrollment cooldown.
 *
 * Hard rules:
 *  - `email_send_log` is the idempotency/throttle source. Insert the claim
 *    (`pending`) BEFORE sending, then update it to `sent` / `failed` /
 *    `skipped`. Resend gets an Idempotency-Key per (user, step, spell).
 *  - Campaign rows and recipient rows are created in the existing
 *    `email_campaign` / `email_campaign_recipient` tables with
 *    `reward_credits = 0`. No credits are granted for a win-back.
 *  - The shared lifecycle frequency cap (`lib/email-frequency-cap.ts`) runs
 *    before every send. A capped step is recorded as `skipped` and retried on
 *    a later day, unless its dormancy window closed meanwhile.
 *  - Send budget is the shared `SendBudget`/`PER_JOB_SEND_CAP` path, and the
 *    whole sequence (all three steps) shares one reservation per run.
 */

import { Resend } from "resend";
import {
  and,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  or,
  sql as dsql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  emailCampaignRecipients,
  emailCampaigns,
  emailSendLog,
  userActivityDays,
  users,
} from "@/db/schema";
import { WinbackSequenceEmail } from "@/lib/email-templates/winback-sequence";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { PER_JOB_SEND_CAP, type SendBudget } from "@/lib/email-send-budget";
import {
  isLifecycleFrequencyCapped,
  lifecycleCapSkipReason,
} from "@/lib/email-frequency-cap";
import { localDateString } from "@/lib/transits";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import {
  WINBACK_KINDS,
  WINBACK_SEQUENCE_MAX_DAYS,
  WINBACK_SLUGS,
  WINBACK_SPELL_COOLDOWN_DAYS,
  WINBACK_STEPS,
  dayDifference,
  selectWinbackStep,
  type WinbackKind,
  type WinbackStep,
} from "@/lib/winback-sequence";

const TZ = "Asia/Tbilisi";
const DAY = 86_400_000;

/** First day a user can qualify: the sequence is 7-day dormant. */
const ENROLLMENT_MIN_DAYS = 7;

const ORIGIN = process.env.APP_ORIGIN ?? "https://www.vivida.ge";

function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}
const FROM = resolveFrom(
  process.env.RESEND_FROM,
  "Vivida <onboarding@resend.dev>",
);

const STEP_NUMBER_BY_KIND = new Map<string, number>(
  WINBACK_STEPS.map((s) => [s.kind, s.step]),
);

function dateKey(daysAgo: number): string {
  return localDateString(new Date(Date.now() - daysAgo * DAY), TZ);
}

export type WinbackStepResult = {
  candidates: number;
  emailed: number;
  pushed: number;
  skipped: number;
  capped: number;
  failed: number;
};

export type WinbackResult = {
  dormant: number;
  emailed: number;
  pushed: number;
  skipped: number;
  capped: number;
  failed: number;
  /** Per-step counts, keyed by `email_send_log.kind`. */
  steps: Record<WinbackKind, WinbackStepResult>;
};

function emptyStepResult(): WinbackStepResult {
  return {
    candidates: 0,
    emailed: 0,
    pushed: 0,
    skipped: 0,
    capped: 0,
    failed: 0,
  };
}

export function emptyWinbackResult(): WinbackResult {
  const steps = {} as Record<WinbackKind, WinbackStepResult>;
  for (const step of WINBACK_STEPS) steps[step.kind] = emptyStepResult();
  return {
    dormant: 0,
    emailed: 0,
    pushed: 0,
    skipped: 0,
    capped: 0,
    failed: 0,
    steps,
  };
}

type Candidate = {
  userId: string;
  email: string;
  name: string | null;
  locale: string;
  lastVisit: string;
  daysSinceLastVisit: number;
};

type ClaimRow = { userId: string; kind: string; sentAt: Date };
type ConversionRow = { userId: string; completedAt: Date };

/**
 * Create/refresh the three campaign rows. `reward_credits` is pinned to 0 on
 * every write, including updates, so a stray admin edit cannot turn win-back
 * into a credit grant.
 */
async function ensureWinbackCampaigns(): Promise<Map<WinbackKind, string>> {
  const ids = new Map<WinbackKind, string>();
  for (const step of WINBACK_STEPS) {
    const [row] = await db
      .insert(emailCampaigns)
      .values({
        slug: step.slug,
        name: `Dormant win-back v1 — step ${step.step}`,
        template: step.template,
        subject: step.subjectKa,
        body: step.bodyKa.join("\n\n"),
        ctaLabel: step.ctaKa,
        ctaUrl: step.path,
        rewardCredits: 0,
        status: "active",
        launchedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: emailCampaigns.slug,
        set: {
          name: `Dormant win-back v1 — step ${step.step}`,
          template: step.template,
          subject: step.subjectKa,
          body: step.bodyKa.join("\n\n"),
          ctaLabel: step.ctaKa,
          ctaUrl: step.path,
          rewardCredits: 0,
          status: "active",
          launchedAt: dsql`coalesce(${emailCampaigns.launchedAt}, now())`,
        },
      })
      .returning({ id: emailCampaigns.id });
    if (row) ids.set(step.kind, row.id);
  }
  return ids;
}

/** Users whose last visit is inside the sequence's dormancy window. */
async function findCandidates(): Promise<Candidate[]> {
  const today = dateKey(0);
  const lastVisits = await db
    .select({
      userId: userActivityDays.userId,
      last: dsql<string>`max(${userActivityDays.dateLocal})`,
    })
    .from(userActivityDays)
    .groupBy(userActivityDays.userId);

  const lastByUser = new Map<string, { last: string; days: number }>();
  for (const row of lastVisits) {
    if (!row.last) continue;
    const days = dayDifference(row.last, today);
    if (days >= ENROLLMENT_MIN_DAYS && days <= WINBACK_SEQUENCE_MAX_DAYS) {
      lastByUser.set(row.userId, { last: row.last, days });
    }
  }
  if (lastByUser.size === 0) return [];

  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
      emailNudges: users.emailNudges,
    })
    .from(users)
    .where(
      and(
        inArray(users.id, [...lastByUser.keys()]),
        eq(users.emailNudges, true),
        isNotNull(users.email),
        isNotNull(users.emailVerified),
      ),
    );

  return rows
    .filter((u) => !!u.email && u.emailNudges === true)
    .map((u) => {
      const visit = lastByUser.get(u.userId)!;
      return {
        userId: u.userId,
        email: u.email as string,
        name: u.name,
        locale: u.locale,
        lastVisit: visit.last,
        daysSinceLastVisit: visit.days,
      };
    });
}

/** Sequence claims inside the cooldown window; older spells are irrelevant. */
async function findSequenceClaims(userIds: string[]): Promise<ClaimRow[]> {
  if (userIds.length === 0) return [];
  const cutoff = new Date(Date.now() - WINBACK_SPELL_COOLDOWN_DAYS * DAY);
  const rows = await db
    .select({
      userId: emailSendLog.userId,
      kind: emailSendLog.kind,
      sentAt: emailSendLog.sentAt,
    })
    .from(emailSendLog)
    .where(
      and(
        inArray(emailSendLog.userId, userIds),
        inArray(emailSendLog.kind, [...WINBACK_KINDS]),
        gte(emailSendLog.sentAt, cutoff),
        // failed/skipped are retryable non-deliveries, not part of the spell.
        or(
          isNull(emailSendLog.status),
          eq(emailSendLog.status, "sent"),
          eq(emailSendLog.status, "pending"),
        ),
      ),
    );
  return rows;
}

/** Converted win-back recipients (return or purchase) inside the cooldown. */
async function findSequenceConversions(
  userIds: string[],
): Promise<ConversionRow[]> {
  if (userIds.length === 0) return [];
  const cutoff = new Date(Date.now() - WINBACK_SPELL_COOLDOWN_DAYS * DAY);
  const rows = await db
    .select({
      userId: emailCampaignRecipients.userId,
      completedAt: emailCampaignRecipients.completedAt,
    })
    .from(emailCampaignRecipients)
    .innerJoin(
      emailCampaigns,
      eq(emailCampaigns.id, emailCampaignRecipients.campaignId),
    )
    .where(
      and(
        inArray(emailCampaignRecipients.userId, userIds),
        inArray(emailCampaigns.slug, [...WINBACK_SLUGS]),
        isNotNull(emailCampaignRecipients.completedAt),
        gte(emailCampaignRecipients.completedAt, cutoff),
      ),
    );
  return rows.flatMap((r) =>
    r.completedAt ? [{ userId: r.userId, completedAt: r.completedAt }] : [],
  );
}

/**
 * Decide this run's step for one user, scoping claims to the current spell.
 * Claims before the anchor belong to an earlier spell and impose the cooldown.
 */
function pickStep(
  candidate: Candidate,
  claims: ClaimRow[],
  conversions: ConversionRow[],
): WinbackStep | null {
  const anchor = new Date(`${candidate.lastVisit}T00:00:00Z`);
  const mine = claims.filter((c) => c.userId === candidate.userId);
  const hadEarlierSpell = mine.some((c) => c.sentAt < anchor);
  if (hadEarlierSpell) return null;

  const spellClaims = mine.filter((c) => c.sentAt >= anchor);
  const sentSteps = spellClaims
    .map((c) => STEP_NUMBER_BY_KIND.get(c.kind))
    .filter((n): n is number => n != null);
  const lastStepAt = spellClaims.reduce<Date | null>(
    (latest, c) => (!latest || c.sentAt > latest ? c.sentAt : latest),
    null,
  );
  const daysSinceLastStep = lastStepAt
    ? Math.floor((Date.now() - lastStepAt.getTime()) / DAY)
    : null;

  const converted = conversions
    .filter((c) => c.userId === candidate.userId && c.completedAt >= anchor)
    .reduce<Date | null>(
      (latest, c) =>
        !latest || c.completedAt > latest ? c.completedAt : latest,
      null,
    );

  return selectWinbackStep({
    daysSinceLastVisit: candidate.daysSinceLastVisit,
    sentSteps,
    daysSinceLastStep,
    convertedAt: converted,
  });
}

function tally(
  result: WinbackResult,
  step: WinbackStep,
  key: keyof WinbackStepResult,
): void {
  result.steps[step.kind][key]++;
  switch (key) {
    case "candidates":
      break;
    case "emailed":
      result.emailed++;
      break;
    case "pushed":
      result.pushed++;
      break;
    case "skipped":
      result.skipped++;
      break;
    case "capped":
      result.capped++;
      break;
    case "failed":
      result.failed++;
      break;
  }
}

/** Cron entrypoint: enroll, select one step, claim, send. */
export async function sendWinbackNudges(
  budget?: SendBudget,
): Promise<WinbackResult> {
  const result = emptyWinbackResult();
  const candidates = await findCandidates();
  result.dormant = candidates.length;

  // Campaign rows exist even on quiet days, so conversion measurement and the
  // admin surface are ready before the first send.
  const campaignIds = await ensureWinbackCampaigns();
  if (candidates.length === 0) return result;

  const ids = candidates.map((c) => c.userId);
  const [claims, conversions] = await Promise.all([
    findSequenceClaims(ids),
    findSequenceConversions(ids),
  ]);

  const resendKey = process.env.RESEND_API_KEY;
  const resend = resendKey ? new Resend(resendKey) : null;

  // The whole 3-step sequence shares one per-run reservation so it cannot
  // starve the other lifecycle jobs, and later steps drain on later runs.
  const allowance = budget
    ? budget.reserve(candidates.length, PER_JOB_SEND_CAP)
    : PER_JOB_SEND_CAP;
  let sentThisRun = 0;

  for (const candidate of candidates) {
    if (sentThisRun >= allowance) break;

    const step = pickStep(candidate, claims, conversions);
    if (!step) continue;
    tally(result, step, "candidates");

    const locale = normalizeUserLocale(candidate.locale);
    const en = locale === "en";
    const subject = en ? step.subjectEn : step.subjectKa;
    const origin = en ? ENGLISH_SITE_URL : ORIGIN;
    const ctaUrl = `${origin.replace(/\/$/, "")}${step.path}`;

    if (!resend) {
      console.warn("[winback] RESEND_API_KEY missing, cannot send sequence");
      tally(result, step, "skipped");
      continue;
    }

    // Shared company cap, before any claim or send. Recorded as `skipped` so
    // this day's attempt is terminal and the next run can retry the step.
    if (await isLifecycleFrequencyCapped(candidate.userId)) {
      await db.insert(emailSendLog).values({
        userId: candidate.userId,
        kind: step.kind,
        email: candidate.email,
        subject,
        status: "skipped",
        error: lifecycleCapSkipReason(),
      });
      tally(result, step, "capped");
      tally(result, step, "skipped");
      continue;
    }

    // Claim first: even a crashed run cannot double-send this step.
    const [claim] = await db
      .insert(emailSendLog)
      .values({
        userId: candidate.userId,
        kind: step.kind,
        email: candidate.email,
        subject,
        status: "pending",
      })
      .returning({ id: emailSendLog.id });

    const campaignId = campaignIds.get(step.kind);
    if (campaignId) {
      await db
        .insert(emailCampaignRecipients)
        .values({
          campaignId,
          userId: candidate.userId,
          email: candidate.email,
          status: "pending",
        })
        .onConflictDoUpdate({
          target: [
            emailCampaignRecipients.campaignId,
            emailCampaignRecipients.userId,
          ],
          set: {
            email: candidate.email,
            status: "pending",
            error: null,
          },
        });
    }

    try {
      const token = await getOrCreateUnsubscribeToken(candidate.userId);
      const unsubUrl = `${origin}/unsubscribe?token=${token}&type=nudges`;

      await acquireResendSlot();
      const sendResult = await resend.emails.send(
        {
          from: FROM,
          to: candidate.email,
          subject,
          react: WinbackSequenceEmail({
            step,
            ctaUrl,
            unsubscribeUrl: unsubUrl,
            locale,
          }),
          headers: {
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        },
        {
          // Per (user, step, spell). Resend dedupes a retried request; the
          // anchor lets a future spell legitimately send the same step again.
          idempotencyKey: `${step.kind}:${candidate.userId}:${candidate.lastVisit}`,
        },
      );

      if (sendResult.error) {
        await db
          .update(emailSendLog)
          .set({ status: "failed", error: sendResult.error.message })
          .where(eq(emailSendLog.id, claim.id));
        if (campaignId) {
          await db
            .update(emailCampaignRecipients)
            .set({ status: "failed", error: sendResult.error.message })
            .where(
              and(
                eq(emailCampaignRecipients.campaignId, campaignId),
                eq(emailCampaignRecipients.userId, candidate.userId),
              ),
            );
        }
        tally(result, step, "failed");
        continue;
      }

      await db
        .update(emailSendLog)
        .set({ status: "sent" })
        .where(eq(emailSendLog.id, claim.id));
      if (campaignId) {
        await db
          .update(emailCampaignRecipients)
          .set({ status: "sent", sentAt: new Date(), error: null })
          .where(
            and(
              eq(emailCampaignRecipients.campaignId, campaignId),
              eq(emailCampaignRecipients.userId, candidate.userId),
            ),
          );
      }
      tally(result, step, "emailed");
      sentThisRun++;

      // Push after the email succeeds, so a failed send does not leave a
      // push pointing at an inbox that never received the sequence email.
      if (isPushConfigured()) {
        try {
          const sent = await sendPushToUser(candidate.userId, {
            title: en ? step.pushTitleEn : step.pushTitleKa,
            body: en ? step.pushBodyEn : step.pushBodyKa,
            url: step.path,
            tag: step.kind,
          });
          if (sent > 0) tally(result, step, "pushed");
        } catch (err) {
          console.warn("[winback] push failed:", (err as Error).message);
        }
      }
    } catch (err) {
      console.warn(
        `[winback] ${step.kind} failed for ${candidate.userId}:`,
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
      tally(result, step, "failed");
    }
  }

  return result;
}

/** Exposed for the cron JSON and tests: the anchor-relative thresholds. */
export const WINBACK_STEP_THRESHOLDS = WINBACK_STEPS.map((s) => ({
  kind: s.kind,
  dueAfterDays: s.dueAfterDays,
  slug: s.slug,
}));
