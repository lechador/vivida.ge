import { Resend } from "resend";
import { and, desc, eq, gte, isNotNull, isNull, lt } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog, profiles, users } from "@/db/schema";
import { prepareVerificationResend } from "@/lib/auth-core";
import { sendVerificationEmail } from "@/lib/email";
import { ProfileIncompleteEmail } from "@/lib/email-templates/profile-incomplete";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";

/**
 * Lifecycle re-nudges, fired best-effort from the daily-horoscope cron. Two
 * low-volume, capped, idempotent nudges that recover abandoned sign-ups —
 * both a real one-and-done driver:
 *
 *  - verify_reminder: credentials login HARD-requires email verification, so a
 *    sign-up that never verified is permanently locked out and can never
 *    return. Re-send the verify email up to 2× (≈ T+24h then T+48h), never
 *    after 7 days from sign-up.
 *  - profile_incomplete: users with no birth data get no personalized daily
 *    horoscope (the main return engine). Nudge them to finish their chart at
 *    ≈ T+2d then T+7d, max 2.
 *
 * Both cap + dedupe via email_send_log(kind), so the 05:00 + 05:30 cron ticks
 * and day-to-day reruns never double-send.
 */

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// Self-contained Resend transport (mirrors lib/email-marketing.ts) so this
// module doesn't have to touch that file.
let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}
function resolveFrom(v: string | undefined, fb: string): string {
  if (!v) return fb;
  return v.includes("<") ? v : `Vivida <${v}>`;
}
const FROM = resolveFrom(process.env.RESEND_FROM, "Vivida <hello@vivida.ge>");
const ORIGIN = process.env.EMAIL_ORIGIN ?? "https://vivida.ge";
function absUrlForLocale(p: string, locale: UserLocale): string {
  const origin = locale === "ka" ? ORIGIN : ENGLISH_SITE_URL;
  return `${origin.replace(/\/$/, "")}${p.startsWith("/") ? p : `/${p}`}`;
}

/** Prior sends of a given kind for a user — count + most-recent timestamp. */
async function priorSends(
  userId: string,
  kind: string
): Promise<{ count: number; last: Date | null }> {
  const rows = await db
    .select({ sentAt: emailSendLog.sentAt })
    .from(emailSendLog)
    .where(and(eq(emailSendLog.userId, userId), eq(emailSendLog.kind, kind)))
    .orderBy(desc(emailSendLog.sentAt));
  return { count: rows.length, last: rows[0]?.sentAt ?? null };
}

export type RenudgeResult = { candidates: number; sent: number };

/**
 * Re-email credential sign-ups that never verified. Cohort: passwordHash set,
 * still unverified, signed up 1–7 days ago. Cadence: max 2, ≥ 20h apart.
 */
export async function sendVerificationRenudges(): Promise<RenudgeResult> {
  const now = Date.now();
  const candidates = await db
    .select({ id: users.id, email: users.email, locale: users.interfaceLanguage })
    .from(users)
    .where(
      and(
        isNull(users.emailVerified),
        isNotNull(users.passwordHash),
        isNotNull(users.email),
        gte(users.createdAt, new Date(now - 7 * DAY)),
        lt(users.createdAt, new Date(now - 1 * DAY))
      )
    );

  let sent = 0;
  for (const u of candidates) {
    if (!u.email) continue;
    const { count, last } = await priorSends(u.id, "verify_reminder");
    if (count >= 2) continue;
    if (last && now - last.getTime() < 20 * HOUR) continue;

    // Re-issues a fresh verify token; returns send:false if already verified.
    const dispatch = await prepareVerificationResend(u.email);
    if (!dispatch.send) continue;
    const locale = normalizeUserLocale(u.locale);
    const subject = locale === "en"
      ? "Complete your registration — verify your email"
      : "დაასრულე რეგისტრაცია — დაადასტურე ელფოსტა";
    try {
      await sendVerificationEmail({
        to: dispatch.email,
        name: dispatch.name,
        token: dispatch.token,
        code: dispatch.code,
        origin: locale === "en" ? ENGLISH_SITE_URL : ORIGIN,
      });
      await db.insert(emailSendLog).values({
        userId: u.id,
        kind: "verify_reminder",
        email: u.email,
        subject,
        status: "sent",
      });
      sent++;
    } catch (err) {
      console.warn("[renudge] verify send failed:", (err as Error).message);
    }
  }
  return { candidates: candidates.length, sent };
}

/**
 * Nudge registered users who never added birth data to finish onboarding, so
 * they enter the personalized daily-horoscope audience. Cohort: emailNudges on,
 * no dateOfBirth. Cadence: 1st at ≥ T+2d, 2nd at ≥ T+7d, max 2, ≥ 20h apart.
 */
export async function sendProfileIncompleteRenudges(): Promise<RenudgeResult> {
  const c = client();
  const now = Date.now();
  const candidates = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(users.emailNudges, true),
        isNull(profiles.dateOfBirth),
        isNotNull(users.email),
        lt(users.createdAt, new Date(now - 2 * DAY))
      )
    );

  if (!c) return { candidates: candidates.length, sent: 0 };

  let sent = 0;
  for (const u of candidates) {
    if (!u.email) continue;
    const ageMs = now - new Date(u.createdAt).getTime();
    const { count, last } = await priorSends(u.id, "profile_incomplete");
    if (count >= 2) continue;
    // 1st nudge: ≥ T+2d (already filtered). 2nd: ≥ T+7d and ≥ 20h after the 1st.
    if (count === 1 && (ageMs < 7 * DAY || (last && now - last.getTime() < 20 * HOUR))) {
      continue;
    }

    const token = await getOrCreateUnsubscribeToken(u.id);
    const locale = normalizeUserLocale(u.locale);
    const unsubUrl = absUrlForLocale(`/unsubscribe?token=${token}&type=nudges`, locale);
    const subject = locale === "en"
      ? "Your birth chart is waiting — complete your profile"
      : "შენი ნატალური რუკა გელოდება — დაასრულე პროფილი";
    try {
      await acquireResendSlot();
      const res = await c.emails.send({
        from: FROM,
        to: u.email,
        subject,
        react: ProfileIncompleteEmail({
          name: u.name?.split(" ")[0] ?? null,
          onboardingUrl: absUrlForLocale("/onboarding", locale),
          unsubscribeUrl: unsubUrl,
          locale,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      await db.insert(emailSendLog).values({
        userId: u.id,
        kind: "profile_incomplete",
        email: u.email,
        subject,
        status: res.error ? "failed" : "sent",
        error: res.error?.message ?? null,
      });
      if (!res.error) sent++;
    } catch (err) {
      console.warn(
        "[renudge] profile_incomplete send failed:",
        (err as Error).message
      );
    }
  }
  return { candidates: candidates.length, sent };
}
