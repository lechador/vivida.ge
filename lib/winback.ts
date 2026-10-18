/**
 * Winback nudges, the daily cron calls `sendWinbackNudges()`, which finds
 * users who WERE active but have now been quiet for 7+ days and sends one
 * personal "the sky kept moving" email (+ web push when they have push subs).
 *
 * Audience: last authed visit (user_activity_day) between 7 and 14 days ago.
 * The 14-day upper bound means long-dormant users aren't nagged forever,
 * each dormancy spell gets exactly one shot, in its second week.
 *
 * Idempotency: an email_send_log claim row (kind='winback') is inserted
 * before sending, and anyone with a winback in the last 30 days is skipped,
 * so the 05:30 retry tick can't double-send, and a user who returns then
 * lapses again isn't nudged more than monthly.
 *
 * Personalization (all best-effort): today's cached horoscope headline for
 * their sun sign (from date_of_birth, no chart needed) and their credit
 * balance. Missing pieces degrade to the generic copy, never block the send.
 */

import { Resend } from "resend";
import { and, eq, gte, inArray, sql as dsql } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog, profiles, userActivityDays, users } from "@/db/schema";
import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { ensureDailyFor } from "@/actions/daily";
import { getBalance } from "@/lib/credits";
import { WinbackEmail } from "@/lib/email-templates/winback";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { PER_JOB_SEND_CAP, type SendBudget } from "@/lib/email-send-budget";
import { localDateString } from "@/lib/transits";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";
import { signMetaBySlug, signSlugByDate } from "@/lib/seo/zodiac-dates";
import type { ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";

const TZ = "Asia/Tbilisi";
const DORMANT_MIN_DAYS = 7;
const DORMANT_MAX_DAYS = 14;
const COOLDOWN_DAYS = 30;

const ORIGIN = process.env.APP_ORIGIN ?? "https://www.vivida.ge";

function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}
const FROM = resolveFrom(
  process.env.RESEND_FROM,
  "Vivida <onboarding@resend.dev>",
);

export const WINBACK_SUBJECT = "ვარსკვლავები ისევ შენზე საუბრობენ ✨";
export const WINBACK_SUBJECT_EN = "The stars are still speaking to you ✨";

function dateKey(daysAgo: number): string {
  return localDateString(new Date(Date.now() - daysAgo * 86_400_000), TZ);
}

type DormantUser = {
  userId: string;
  email: string | null;
  name: string | null;
  emailNudges: boolean | null;
  dateOfBirth: string | null;
  locale: string;
};

/** Users whose most recent visit falls inside the dormancy window. */
async function findDormantUsers(): Promise<DormantUser[]> {
  const newest = dateKey(DORMANT_MIN_DAYS); // e.g. 7 days ago
  const oldest = dateKey(DORMANT_MAX_DAYS); // e.g. 14 days ago

  // Per-user last-visit day. date_local is a YYYY-MM-DD string, so max()
  // and string comparison order correctly.
  const lastVisits = await db
    .select({
      userId: userActivityDays.userId,
      last: dsql<string>`max(${userActivityDays.dateLocal})`,
    })
    .from(userActivityDays)
    .groupBy(userActivityDays.userId);

  const targetIds = lastVisits
    .filter((r) => r.last >= oldest && r.last <= newest)
    .map((r) => r.userId);
  if (targetIds.length === 0) return [];

  return db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      emailNudges: users.emailNudges,
      dateOfBirth: profiles.dateOfBirth,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(inArray(users.id, targetIds));
}

/** Already nudged within the cooldown window? (sentAt defaults to now() on
 *  the claim insert, so it doubles as the claim timestamp.) */
async function recentlyNudged(userId: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - COOLDOWN_DAYS * 86_400_000);
  const [row] = await db
    .select({ id: emailSendLog.id })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.userId, userId),
        eq(emailSendLog.kind, "winback"),
        gte(emailSendLog.sentAt, cutoff),
      ),
    )
    .limit(1);
  return !!row;
}

/** Sun-sign slug from a YYYY-MM-DD date of birth. */
function sunSlugFromDob(dob: string | null): ZodiacSlug | null {
  if (!dob) return null;
  const m = Number(dob.slice(5, 7));
  const d = Number(dob.slice(8, 10));
  if (!m || !d) return null;
  try {
    return signSlugByDate(m, d);
  } catch {
    return null;
  }
}

export type WinbackResult = {
  dormant: number;
  emailed: number;
  pushed: number;
  skipped: number;
  failed: number;
};

/** Cron entrypoint, one personal nudge per user per dormancy spell. */
export async function sendWinbackNudges(
  budget?: SendBudget,
): Promise<WinbackResult> {
  const found = await findDormantUsers();
  const result: WinbackResult = {
    dormant: found.length,
    emailed: 0,
    pushed: 0,
    skipped: 0,
    failed: 0,
  };
  if (found.length === 0) return result;

  const resendKey = process.env.RESEND_API_KEY;
  const resend = resendKey ? new Resend(resendKey) : null;

  // Per-run cache: 12 signs max, so repeated lookups are free.
  const headlineBySlug = new Map<ZodiacSlug, string | null>();
  async function headlineFor(slug: ZodiacSlug): Promise<string | null> {
    if (headlineBySlug.has(slug)) return headlineBySlug.get(slug) ?? null;
    let headline: string | null = null;
    try {
      const row = await ensureSignHoroscope(slug, "day");
      headline = row?.headline ?? null;
    } catch {
      /* horoscope is garnish, never block the nudge */
    }
    headlineBySlug.set(slug, headline);
    return headline;
  }

  // Bound this run's sends. The 7-14 day dormancy window held 219 candidates in
  // production, and every send costs 1.1s, so an uncapped loop competes with the
  // other lifecycle jobs for a 300s invocation budget.
  const allowance = budget
    ? budget.reserve(found.length, PER_JOB_SEND_CAP)
    : PER_JOB_SEND_CAP;
  let sentThisRun = 0;

  for (const u of found) {
    if (sentThisRun >= allowance) break;
    try {
      const locale = normalizeUserLocale(u.locale);
      const en = locale === "en";
      const origin = en ? ENGLISH_SITE_URL : ORIGIN;
      const subject = en ? WINBACK_SUBJECT_EN : WINBACK_SUBJECT;
      if (await recentlyNudged(u.userId)) {
        result.skipped++;
        continue;
      }

      // Claim first, the once-per-spell guard, so the 05:30 retry tick
      // can't double-send even if this run dies mid-loop.
      const [claim] = await db
        .insert(emailSendLog)
        .values({
          userId: u.userId,
          kind: "winback",
          email: u.email,
          subject,
          status: "pending",
        })
        .returning({ id: emailSendLog.id });

      // Personalization (best-effort).
      const slug = sunSlugFromDob(u.dateOfBirth);
      const signMeta = slug ? signMetaBySlug(slug) : null;
      const signLabel = en
        ? (signMeta?.labelEn ?? null)
        : (signMeta?.labelKa ?? null);
      let headline: string | null = null;
      try {
        headline = en
          ? ((await ensureDailyFor(u.userId, "en"))?.headline ?? null)
          : slug
            ? await headlineFor(slug)
            : null;
      } catch {
        /* horoscope is garnish, never block the nudge */
      }
      let balance = 0;
      try {
        balance = await getBalance(u.userId);
      } catch {
        /* balance line just disappears */
      }
      const firstName = u.name?.split(" ")[0] ?? null;

      // Web push (independent of email prefs, its own opt-in channel).
      if (isPushConfigured()) {
        try {
          const sent = await sendPushToUser(u.userId, {
            title: en ? "We miss you ✨" : "შენ გვაკლიხარ ✨",
            body: headline
              ? en
                ? `Today for ${signLabel ?? "you"}: ${headline}`
                : `დღეს ${signLabel ?? "შენთვის"}: ${headline}`
              : en
                ? "Your daily horoscope is waiting"
                : "შენი დღევანდელი ჰოროსკოპი გელოდება",
            url: "/dashboard",
            tag: "winback",
          });
          if (sent > 0) result.pushed++;
        } catch (err) {
          console.warn("[winback] push failed:", (err as Error).message);
        }
      }

      // Email, only with an address and nudges not opted out.
      if (!resend || !u.email || u.emailNudges === false) {
        await db
          .update(emailSendLog)
          .set({
            status: "failed",
            error: !resend
              ? "resend not configured"
              : !u.email
                ? "no email address"
                : "nudges opted out (push-only)",
          })
          .where(eq(emailSendLog.id, claim.id));
        result.skipped++;
        continue;
      }

      const token = await getOrCreateUnsubscribeToken(u.userId);
      const unsubUrl = `${origin}/unsubscribe?token=${token}&type=nudges`;

      await acquireResendSlot();
      const sendResult = await resend.emails.send({
        from: FROM,
        to: u.email,
        subject,
        react: WinbackEmail({
          name: firstName,
          signLabel,
          horoscopeHeadline: headline,
          balance,
          dashboardUrl: `${origin}/dashboard`,
          unsubscribeUrl: unsubUrl,
          locale,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (sendResult.error) {
        await db
          .update(emailSendLog)
          .set({ status: "failed", error: sendResult.error.message })
          .where(eq(emailSendLog.id, claim.id));
        result.failed++;
      } else {
        await db
          .update(emailSendLog)
          .set({ status: "sent" })
          .where(eq(emailSendLog.id, claim.id));
        result.emailed++;
        sentThisRun++;
      }
    } catch (err) {
      console.warn(`[winback] failed for ${u.userId}:`, (err as Error).message);
      result.failed++;
    }
  }

  return result;
}
