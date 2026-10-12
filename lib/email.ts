import { Resend } from "resend";
import { and, desc, eq, gt, gte, inArray, isNull, lt } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog, notifications, profiles, users } from "@/db/schema";
import { VerificationEmail } from "@/lib/email-templates/verification";
import { PasswordResetEmail } from "@/lib/email-templates/password-reset";
import { WelcomeEmail } from "@/lib/email-templates/welcome";
import { FriendRequestEmail } from "@/lib/email-templates/friend-request";
import { MessageEmail } from "@/lib/email-templates/message";
import { FeedActivityEmail } from "@/lib/email-templates/feed-activity";
import { MbtiResultEmail } from "@/lib/email-templates/mbti-result";
import { ReportReadyEmail } from "@/lib/email-templates/report-ready";
import { PersonalReminderEmail } from "@/lib/email-templates/personal-reminder";
import { VerifiedBadgeGiftEmail } from "@/lib/email-templates/verified-badge-gift";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { usesEnglishCopy } from "@/lib/i18n/locale";
import { ENGLISH_SITE_URL, isEnglishHost } from "@/lib/seo/locales";

/**
 * Resend client. Lazily-instantiated so dev environments without the API
 * key (e.g. running migrations) don't crash at import time. Functions in
 * this module return early with a console warning when the key is absent,
 * matching how `lib/r2.ts` handles its credentials.
 */
let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

// RESEND_FROM may be set as a bare address ("hello@vivida.ge") or a full
// "Name <email>" string, normalize to always show "Vivida" as the sender
// name so inboxes never display a raw mailbox name like "hello".
function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}

const FROM = resolveFrom(
  process.env.RESEND_FROM,
  "Vivida <onboarding@resend.dev>",
);
// Default to production so emails never ship localhost links when APP_ORIGIN
// is unset (e.g. Vercel cron). Local dev sets APP_ORIGIN to override.
const ORIGIN = process.env.APP_ORIGIN ?? "https://www.vivida.ge";

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Build an absolute URL inside an email. Relative paths break in some
 * mail clients, so every link must include scheme + host.
 */
function absUrl(path: string, origin: string = ORIGIN): string {
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function originForLocale(locale: UserLocale): string {
  return locale === "ka" ? ORIGIN : ENGLISH_SITE_URL;
}

function localeForOrigin(origin: string | undefined): UserLocale {
  if (!origin) return "ka";
  try {
    return isEnglishHost(new URL(origin).hostname) ? "en" : "ka";
  } catch {
    return "ka";
  }
}

/**
 * Send the post-signup verification email. Returns silently on success;
 * logs and rethrows on failure so the calling action can surface a
 * generic "we couldn't send the email" message and the user can retry.
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
  code,
  origin,
}: {
  to: string;
  name: string | null;
  token: string;
  /** 6-digit OTP shown alongside the link so users can type it instead. */
  code?: string | null;
  /** Recognized request origin; lets one deployment serve both brand domains. */
  origin?: string;
}): Promise<void> {
  const c = client();
  const verifyUrl = absUrl(`/api/auth/verify-email?token=${token}`, origin);
  if (!c) {
    console.warn(
      "[email] RESEND_API_KEY missing, would have sent verification to",
      to,
      "→",
      verifyUrl,
    );
    return;
  }
  const locale = localeForOrigin(origin);
  const subject =
    locale === "en"
      ? "Verify your email · Vivida"
      : "დაადასტურე შენი ელფოსტა · Vivida";
  const result = await c.emails.send({
    from: FROM,
    to,
    subject,
    react: VerificationEmail({ name, verifyUrl, code: code ?? null, locale }),
  });
  if (result.error) {
    console.error("[email] verification send failed:", result.error);
    await recordSentByEmail(
      to,
      "verification",
      subject,
      "failed",
      result.error.message,
    );
    throw new Error(result.error.message ?? "verification send failed");
  }
  await recordSentByEmail(to, "verification", subject, "sent");
}

export async function sendPasswordResetEmail({
  to,
  name,
  token,
  origin,
}: {
  to: string;
  name: string | null;
  token: string;
  origin?: string;
}): Promise<void> {
  const c = client();
  const resetUrl = absUrl(`/reset-password?token=${token}`, origin);
  if (!c) {
    console.warn(
      "[email] RESEND_API_KEY missing, would have sent reset to",
      to,
      "→",
      resetUrl,
    );
    return;
  }
  const locale = localeForOrigin(origin);
  const subject =
    locale === "en"
      ? "Reset your password · Vivida"
      : "პაროლის აღდგენა · Vivida";
  const result = await c.emails.send({
    from: FROM,
    to,
    subject,
    react: PasswordResetEmail({ name, resetUrl, locale }),
  });
  if (result.error) {
    console.error("[email] password reset send failed:", result.error);
    await recordSentByEmail(
      to,
      "password_reset",
      subject,
      "failed",
      result.error.message,
    );
    throw new Error(result.error.message ?? "password reset send failed");
  }
  await recordSentByEmail(to, "password_reset", subject, "sent");
}

// ─────────────────────────────────────────────────────────────────────
// Lifecycle / notification emails, welcome, friend-request, message,
// feed activity (comment / reaction). Fire-and-forget from the call site
// (typically wrapped in `after()`) and never throw. They guard against:
//   - missing RESEND_API_KEY (early-return with warn)
//   - duplicate welcome (one-shot per user via email_send_log)
//   - notification spam (1h throttle per user per kind)
//   - sending while user is actively using the app (lastLoginAt < 1h ago)
// ─────────────────────────────────────────────────────────────────────

const ABSENCE_THRESHOLD_MIN = 60;
const NOTIFICATION_THROTTLE_MIN = 60;

/** Has any send for this (userId, kind) ever happened? Welcome guard. */
async function hasSentBefore(userId: string, kind: string): Promise<boolean> {
  const [row] = await db
    .select({ id: emailSendLog.id })
    .from(emailSendLog)
    .where(and(eq(emailSendLog.userId, userId), eq(emailSendLog.kind, kind)))
    .limit(1);
  return !!row;
}

/** Have we sent this kind to this user within the last `minutes`? */
async function sentRecently(
  userId: string,
  kind: string,
  minutes: number,
): Promise<boolean> {
  const cutoff = new Date(Date.now() - minutes * 60_000);
  const [row] = await db
    .select({ id: emailSendLog.id })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.userId, userId),
        eq(emailSendLog.kind, kind),
        gt(emailSendLog.sentAt, cutoff),
      ),
    )
    .orderBy(desc(emailSendLog.sentAt))
    .limit(1);
  return !!row;
}

async function recordSent(
  userId: string,
  kind: string,
  extra?: {
    email?: string | null;
    subject?: string;
    status?: string;
    error?: string;
  },
): Promise<void> {
  await db.insert(emailSendLog).values({
    userId,
    kind,
    email: extra?.email ?? null,
    subject: extra?.subject ?? null,
    status: extra?.status ?? "sent",
    error: extra?.error ?? null,
  });
}

/**
 * Best-effort unified-log write for senders that only know the address
 * (verification / password reset). Resolves the user by email; silently
 * skips when unknown (the log's user_id is NOT NULL). Never throws.
 */
async function recordSentByEmail(
  to: string,
  kind: string,
  subject: string,
  status: "sent" | "failed",
  error?: string,
): Promise<void> {
  try {
    const [u] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, to))
      .limit(1);
    if (!u) return;
    await recordSent(u.id, kind, { email: to, subject, status, error });
  } catch {
    /* logging must never break the send path */
  }
}

/** True when the user hasn't logged in / pinged activity for `minutes`. */
async function userAbsentFor(
  userId: string,
  minutes: number,
): Promise<boolean> {
  const [row] = await db
    .select({ lastLoginAt: users.lastLoginAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return false;
  if (!row.lastLoginAt) return true; // never seen, treat as absent
  return Date.now() - row.lastLoginAt.getTime() > minutes * 60_000;
}

/**
 * Welcome email, sent once, on first signup, from the profile-save hooks
 * (sendWelcomeIfEligible) once the user has verified their email and filled
 * birth data. The site runs on credits (no paid plans), so the copy is a
 * neutral "your cosmic journey begins" framing, no trial pitch.
 *
 * Idempotent at the email_send_log level, a second call after the
 * first success is a no-op. Always sends regardless of email
 * preferences (transactional).
 */
export async function sendWelcomeEmail({
  userId,
  to,
  name,
  locale = "ka",
}: {
  userId: string;
  to: string;
  name: string | null;
  locale?: UserLocale;
}): Promise<void> {
  const c = client();
  if (!c) {
    console.warn("[email] RESEND_API_KEY missing, skipping welcome to", to);
    return;
  }
  if (await hasSentBefore(userId, "welcome")) return;

  const dashboardUrl = absUrl("/dashboard", originForLocale(locale));
  const subject =
    locale === "en"
      ? "Your cosmic journey begins · Vivida"
      : "შენი კოსმიური მოგზაურობა იწყება · Vivida";

  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to,
        subject,
        react: WelcomeEmail({
          name,
          dashboardUrl,
          locale,
        }),
      },
      { idempotencyKey: `welcome:${userId}` },
    );
    if (result.error) {
      console.error("[email] welcome send failed:", result.error);
      return;
    }
    await recordSent(userId, "welcome", {
      email: to,
      subject,
    });
  } catch (err) {
    console.error("[email] welcome threw:", (err as Error).message);
  }
}

/**
 * Transactional notice sent when an admin gifts the identity badge. The
 * caller supplies a grant-specific idempotency key, so retrying a failed admin
 * action cannot put duplicate gift messages in the user's inbox.
 */
export async function sendVerifiedBadgeGiftEmail({
  userId,
  to,
  name,
  username,
  locale = "ka",
  idempotencyKey,
}: {
  userId: string;
  to: string;
  name: string | null;
  username: string | null;
  locale?: UserLocale;
  idempotencyKey: string;
}): Promise<{ ok: boolean; error?: "email_not_configured" | "send_failed" }> {
  const c = client();
  if (!c) {
    console.warn("[email] RESEND_API_KEY missing, skipping badge gift to", to);
    return { ok: false, error: "email_not_configured" };
  }

  const profileUrl = absUrl(
    username ? `/u/${encodeURIComponent(username)}` : "/dashboard",
    originForLocale(locale),
  );
  const subject =
    locale === "en"
      ? "You received a Verified Badge as a gift · Vivida"
      : "Verified Badge საჩუქრად მიიღე · Vivida";

  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to,
        subject,
        react: VerifiedBadgeGiftEmail({
          name: name?.split(" ")[0] ?? null,
          profileUrl,
          locale,
        }),
      },
      { idempotencyKey },
    );
    if (result.error) {
      await recordSent(userId, "verified_badge_gift", {
        email: to,
        subject,
        status: "failed",
        error: result.error.message,
      });
      return { ok: false, error: "send_failed" };
    }
    await recordSent(userId, "verified_badge_gift", { email: to, subject });
    return { ok: true };
  } catch (error) {
    await recordSent(userId, "verified_badge_gift", {
      email: to,
      subject,
      status: "failed",
      error: (error as Error).message.slice(0, 500),
    }).catch(() => undefined);
    return { ok: false, error: "send_failed" };
  }
}

/**
 * Send an Astro-MBTI result email. Transactional (not deduped, a user can
 * retake the test and each result gets its own email); the result also lives
 * on the site. `resultId` deep-links to /test-results/[id].
 */
export async function sendMbtiResultEmail({
  userId,
  to,
  name,
  resultId,
  mbtiType,
  archetypeNameGe,
  excerpt,
  locale = "ka",
  origin,
}: {
  userId: string;
  to: string;
  name: string | null;
  resultId: string;
  mbtiType: string;
  archetypeNameGe: string;
  excerpt?: string;
  locale?: UserLocale;
  origin?: string;
}): Promise<void> {
  const c = client();
  if (!c) {
    console.warn("[email] RESEND_API_KEY missing, skipping MBTI result to", to);
    return;
  }
  const subject =
    locale === "en"
      ? `Your type is ${mbtiType}, ${archetypeNameGe} · Vivida`
      : `შენი ტიპია ${mbtiType}, ${archetypeNameGe} · Vivida`;
  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to,
        subject,
        react: MbtiResultEmail({
          name,
          mbtiType,
          archetypeNameGe,
          resultUrl: absUrl(`/test-results/${resultId}`, origin),
          locale,
          excerpt:
            excerpt?.trim() ||
            (locale === "en"
              ? "Your detailed personality profile is ready."
              : "შენი პიროვნების ღრმა ფსიქოლოგიური და ასტროლოგიური ანალიზი მზადაა."),
        }),
      },
      { idempotencyKey: `mbti:${resultId}` },
    );
    if (result.error) {
      console.error("[email] mbti result send failed:", result.error);
      await recordSent(userId, "mbti_result", {
        email: to,
        subject,
        status: "failed",
      });
      return;
    }
    await recordSent(userId, "mbti_result", { email: to, subject });
  } catch (err) {
    console.error("[email] mbti result threw:", (err as Error).message);
  }
}

/**
 * Resend rejects oversized payloads outright, so a report that somehow renders
 * huge should still arrive as a link rather than as a failed send. Our natal
 * PDFs are tens of kilobytes; this is a floor under a pathological case, well
 * below Resend's own 40 MB ceiling.
 */
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

/**
 * Email a finished natal report PDF to its owner, on demand from the button on
 * /report and /reports/[id]. Transactional and deliberately re-sendable, the
 * whole point of the button is "it didn't arrive, send it again", so there is
 * no idempotency key here; the route rate-limits instead.
 *
 * Unlike the fire-and-forget notification senders above, this one reports back:
 * a person is watching a spinner, and "sent" has to mean sent.
 */
export async function sendReportPdfEmail({
  userId,
  to,
  name,
  reportId,
  pdfKey,
  locale = "ka",
  reportTitle,
  reportType = "natal",
}: {
  userId: string;
  to: string;
  name: string | null;
  reportId: string;
  /** R2 key of the generated PDF. */
  pdfKey: string;
  locale?: UserLocale;
  reportTitle?: string;
  reportType?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const c = client();
  if (!c) {
    console.warn("[email] RESEND_API_KEY missing, skipping report PDF to", to);
    return { ok: false, error: "email_not_configured" };
  }

  const reportUrl = absUrl(`/reports/${reportId}`, originForLocale(locale));
  const subject = `${reportTitle ?? (locale === "en" ? "Your natal report" : "შენი ნატალური ანგარიში")} · Vivida`;

  try {
    // Dynamic import so the AWS SDK stays out of every module that merely
    // imports this file for a notification send.
    const { getObjectBytes } = await import("@/lib/r2");
    let pdf: Uint8Array | null = null;
    try {
      const bytes = await getObjectBytes(pdfKey);
      pdf = bytes.byteLength <= MAX_ATTACHMENT_BYTES ? bytes : null;
      if (!pdf) {
        console.warn(
          `[email] report ${reportId} PDF too large to attach (${bytes.byteLength} bytes), sending link only`,
        );
      }
    } catch (err) {
      // The report exists but its bytes are unreachable. The link still works,
      // so send that rather than nothing.
      console.error(
        "[email] report PDF fetch failed, sending link only:",
        (err as Error).message,
      );
    }

    const result = await c.emails.send({
      from: FROM,
      to,
      subject,
      react: ReportReadyEmail({
        name: name?.split(" ")[0] ?? null,
        reportUrl,
        attached: pdf !== null,
        locale,
        reportTitle,
      }),
      attachments: pdf
        ? [
            {
              filename: `vivida-${reportType}-report.pdf`,
              content: Buffer.from(pdf),
              contentType: "application/pdf",
            },
          ]
        : undefined,
    });

    if (result.error) {
      console.error("[email] report PDF send failed:", result.error);
      await recordSent(userId, "report_pdf", {
        email: to,
        subject,
        status: "failed",
        error: result.error.message,
      });
      return { ok: false, error: "send_failed" };
    }

    await recordSent(userId, "report_pdf", { email: to, subject });
    return { ok: true };
  } catch (err) {
    console.error("[email] report PDF threw:", (err as Error).message);
    return { ok: false, error: "send_failed" };
  }
}

/** Explicitly opted-in personal astrology reminder. */
export async function sendPersonalReminderEmail({
  userId,
  to,
  name,
  title,
  body,
  path,
  locale = "ka",
  idempotencyKey,
}: {
  userId: string;
  to: string;
  name: string | null;
  title: string;
  body: string;
  path: string;
  locale?: UserLocale;
  idempotencyKey: string;
}): Promise<boolean> {
  const c = client();
  if (!c) return false;
  const actionUrl = absUrl(path, originForLocale(locale));
  const subject = `${title} · Vivida`;
  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to,
        subject,
        react: PersonalReminderEmail({
          name: name?.split(" ")[0] ?? null,
          title,
          body,
          actionUrl,
          locale,
        }),
      },
      { idempotencyKey },
    );
    if (result.error) {
      await recordSent(userId, "personal_reminder", {
        email: to,
        subject,
        status: "failed",
        error: result.error.message,
      });
      return false;
    }
    await recordSent(userId, "personal_reminder", { email: to, subject });
    return true;
  } catch (error) {
    await recordSent(userId, "personal_reminder", {
      email: to,
      subject,
      status: "failed",
      error: (error as Error).message.slice(0, 500),
    }).catch(() => undefined);
    return false;
  }
}

/**
 * Send the welcome email only once the account is a fully onboarded member:
 * email verified AND birth data (a profile row) present. Called from the
 * profile-save background hook, the moment onboarding
 * finishes, NOT at registration, so a signup that stops at "check your
 * inbox" never gets a premature "your cosmic journey begins."
 *
 * "Email verified" = a verified password account (emailVerified set) OR an
 * OAuth account (no passwordHash, Google already proved the address). NB:
 * web Google users end up with emailVerified NULL in the DB, so gating on
 * that column alone would wrongly skip every Google signup. This mirrors the
 * login gate in auth.ts (unverified password users can't sign in at all).
 *
 * Idempotent all the way down: sendWelcomeEmail dedups on email_send_log,
 * so re-running (e.g. a later profile edit) never re-sends.
 */
export async function sendWelcomeIfEligible(userId: string): Promise<void> {
  const [row] = await db
    .select({
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      passwordHash: users.passwordHash,
      hasProfile: profiles.userId,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!row?.email || !row.hasProfile) return;
  const emailProven = row.emailVerified !== null || row.passwordHash === null;
  if (!emailProven) return;
  await sendWelcomeEmail({
    userId,
    to: row.email,
    name: row.name,
    locale: normalizeUserLocale(row.locale),
  });
}

/**
 * Friend-request email, sent only when the recipient has been absent
 * for ≥1h and we haven't sent them a friend-request email in the last
 * hour. Respects the `emailNudges` preference. Never throws.
 */
export async function sendFriendRequestEmail({
  recipientUserId,
  fromName,
  fromUsername,
}: {
  recipientUserId: string;
  fromName: string;
  fromUsername: string | null;
}): Promise<void> {
  const c = client();
  if (!c) return;

  const [recipient] = await db
    .select({
      email: users.email,
      name: users.name,
      emailNudges: users.emailNudges,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .where(eq(users.id, recipientUserId))
    .limit(1);
  if (!recipient?.email) return;
  if (recipient.emailNudges === false) return;
  if (!(await userAbsentFor(recipientUserId, ABSENCE_THRESHOLD_MIN))) return;
  if (
    await sentRecently(
      recipientUserId,
      "friend_request",
      NOTIFICATION_THROTTLE_MIN,
    )
  ) {
    return;
  }

  const token = await getOrCreateUnsubscribeToken(recipientUserId);
  const locale = normalizeUserLocale(recipient.locale);
  const origin = originForLocale(locale);
  const unsubUrl = absUrl(`/unsubscribe?token=${token}&type=nudges`, origin);
  const friendsUrl = absUrl("/friends", origin);
  const subject =
    locale === "en"
      ? `${fromName} sent you a friend request · Vivida`
      : `${fromName}-მ მეგობრობა გთხოვა · Vivida`;

  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to: recipient.email,
        subject,
        react: FriendRequestEmail({
          recipientName: recipient.name?.split(" ")[0] ?? null,
          fromName,
          fromUsername,
          friendsUrl,
          unsubscribeUrl: unsubUrl,
          locale,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      // Hour-bucketed key, within the same hour, the throttle already
      // suppresses duplicates; key just guards against races.
      {
        idempotencyKey: `friend_request:${recipientUserId}:${Math.floor(
          Date.now() / 3600_000,
        )}`,
      },
    );
    if (result.error) {
      console.error("[email] friend-request send failed:", result.error);
      return;
    }
    await recordSent(recipientUserId, "friend_request", {
      email: recipient.email,
      subject,
    });
  } catch (err) {
    console.error("[email] friend-request threw:", (err as Error).message);
  }
}

/**
 * Message-received email, same gating as friend-request. Includes the
 * first 140 chars of the message body for context. Never throws.
 */
export async function sendMessageEmail({
  recipientUserId,
  fromUserId,
  fromName,
  body,
}: {
  recipientUserId: string;
  fromUserId: string;
  fromName: string;
  body: string;
}): Promise<void> {
  const c = client();
  if (!c) return;

  const [recipient] = await db
    .select({
      email: users.email,
      name: users.name,
      emailNudges: users.emailNudges,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .where(eq(users.id, recipientUserId))
    .limit(1);
  if (!recipient?.email) return;
  if (recipient.emailNudges === false) return;
  if (!(await userAbsentFor(recipientUserId, ABSENCE_THRESHOLD_MIN))) return;
  if (
    await sentRecently(recipientUserId, "message", NOTIFICATION_THROTTLE_MIN)
  ) {
    return;
  }

  // Look up the sender's username so the email can show "@handle". Falls
  // back to first-name only when no public profile exists.
  const [senderProfile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.userId, fromUserId))
    .limit(1);

  const token = await getOrCreateUnsubscribeToken(recipientUserId);
  const locale = normalizeUserLocale(recipient.locale);
  const origin = originForLocale(locale);
  const unsubUrl = absUrl(`/unsubscribe?token=${token}&type=nudges`, origin);
  // The chat page reads `?with=<partnerId>`, see components/chat/message-button.tsx.
  const conversationUrl = absUrl(
    `/messages?with=${encodeURIComponent(fromUserId)}`,
    origin,
  );
  const subject =
    locale === "en"
      ? `${fromName} sent you a message · Vivida`
      : `${fromName}-მ წერილი მოგწერა · Vivida`;

  const snippet = body.length > 140 ? `${body.slice(0, 140).trimEnd()}…` : body;

  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to: recipient.email,
        subject,
        react: MessageEmail({
          recipientName: recipient.name?.split(" ")[0] ?? null,
          fromName,
          fromUsername: senderProfile?.username ?? null,
          snippet,
          conversationUrl,
          unsubscribeUrl: unsubUrl,
          locale,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      {
        idempotencyKey: `message:${recipientUserId}:${Math.floor(
          Date.now() / 3600_000,
        )}`,
      },
    );
    if (result.error) {
      console.error("[email] message send failed:", result.error);
      return;
    }
    await recordSent(recipientUserId, "message", {
      email: recipient.email,
      subject,
    });
  } catch (err) {
    console.error("[email] message threw:", (err as Error).message);
  }
}

const REACTION_SUBJECT_KA: Record<string, string> = {
  like: "მოეწონა შენი პოსტი",
  funny: "გაეცინა შენი პოსტი",
  sad: "დაამწუხრა შენი პოსტი",
  dislike: "არ მოეწონა შენი პოსტი",
};

const REACTION_SUBJECT_EN: Record<string, string> = {
  like: "liked your post",
  funny: "found your post funny",
  sad: "reacted sadly to your post",
  dislike: "disliked your post",
};

/**
 * Comment / reaction email, same gating as friend-request and message:
 * recipient absent ≥1h, emailNudges on, one send per kind per hour.
 * Never throws.
 */
export async function sendFeedActivityEmail({
  recipientUserId,
  fromUserId,
  kind,
  fromName,
  fromUsername,
  postId,
  preview,
  reaction,
}: {
  recipientUserId: string;
  fromUserId: string;
  kind: "post_comment" | "post_reaction";
  fromName: string;
  fromUsername: string | null;
  postId: string;
  preview?: string | null;
  reaction?: string | null;
}): Promise<boolean> {
  const c = client();
  if (!c) return false;
  const { isBlockedEitherWay } = await import("@/lib/block");
  if (await isBlockedEitherWay(recipientUserId, fromUserId)) return false;

  const [recipient] = await db
    .select({
      email: users.email,
      name: users.name,
      emailNudges: users.emailNudges,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .where(eq(users.id, recipientUserId))
    .limit(1);
  if (!recipient?.email) return false;
  if (recipient.emailNudges === false) return false;
  if (!(await userAbsentFor(recipientUserId, ABSENCE_THRESHOLD_MIN)))
    return false;
  if (await sentRecently(recipientUserId, kind, NOTIFICATION_THROTTLE_MIN)) {
    return false;
  }

  const token = await getOrCreateUnsubscribeToken(recipientUserId);
  const locale = normalizeUserLocale(recipient.locale);
  const origin = originForLocale(locale);
  const unsubUrl = absUrl(`/unsubscribe?token=${token}&type=nudges`, origin);
  const postUrl = absUrl(`/feed/${postId}`, origin);
  const en = usesEnglishCopy(locale);
  const snippet =
    preview && preview.length > 140
      ? `${preview.slice(0, 140).trimEnd()}…`
      : (preview ?? "");

  const subject =
    kind === "post_comment"
      ? en
        ? `${fromName} commented on your post · Vivida`
        : `${fromName}-მ შენს პოსტს დააკომენტარა · Vivida`
      : en
        ? `${fromName} ${REACTION_SUBJECT_EN[reaction ?? ""] ?? "reacted to your post"} · Vivida`
        : `${fromName}, ${REACTION_SUBJECT_KA[reaction ?? ""] ?? "გამოეხმაურა შენს პოსტს"} · Vivida`;

  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to: recipient.email,
        subject,
        react: FeedActivityEmail({
          recipientName: recipient.name?.split(" ")[0] ?? null,
          fromName,
          fromUsername,
          kind,
          preview: snippet || null,
          reaction,
          postUrl,
          unsubscribeUrl: unsubUrl,
          locale,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      {
        idempotencyKey: `${kind}:${recipientUserId}:${Math.floor(
          Date.now() / 3600_000,
        )}`,
      },
    );
    if (result.error) {
      console.error("[email] feed-activity send failed:", result.error);
      return false;
    }
    await recordSent(recipientUserId, kind, {
      email: recipient.email,
      subject,
    });
    return true;
  } catch (err) {
    console.error("[email] feed-activity threw:", (err as Error).message);
    return false;
  }
}

/** Has this kind been emailed to this user at or after `since`? */
async function sentSince(
  userId: string,
  kind: string,
  since: Date,
): Promise<boolean> {
  const [row] = await db
    .select({ id: emailSendLog.id })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.userId, userId),
        eq(emailSendLog.kind, kind),
        gte(emailSendLog.sentAt, since),
      ),
    )
    .limit(1);
  return !!row;
}

/**
 * Delayed feed-activity emails: unread comment/reaction notifications that
 * are ≥1h old, whose owner is still away. Covers the case where the user
 * was on the site when the event happened (so the immediate send was
 * skipped) and then didn't come back. Hourly cron. Never throws.
 */
export async function flushUnreadFeedActivityEmails(): Promise<{
  candidates: number;
  sent: number;
}> {
  const c = client();
  if (!c) return { candidates: 0, sent: 0 };

  try {
    const now = Date.now();
    const oldest = new Date(now - 24 * 60 * 60_000);
    const due = new Date(now - ABSENCE_THRESHOLD_MIN * 60_000);

    const rows = await db
      .select({
        userId: notifications.userId,
        kind: notifications.kind,
        payload: notifications.payload,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .innerJoin(users, eq(users.id, notifications.userId))
      .where(
        and(
          inArray(notifications.kind, ["post_comment", "post_reaction"]),
          isNull(notifications.readAt),
          gt(notifications.createdAt, oldest),
          lt(notifications.createdAt, due),
          eq(users.emailNudges, true),
        ),
      )
      .orderBy(desc(notifications.createdAt));

    const latest = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      const key = `${row.userId}:${row.kind}`;
      if (!latest.has(key)) latest.set(key, row);
    }

    let sent = 0;
    for (const row of latest.values()) {
      if (row.kind !== "post_comment" && row.kind !== "post_reaction") continue;
      const postId = row.payload?.postId;
      if (!postId) continue;
      if (await sentSince(row.userId, row.kind, row.createdAt)) continue;

      const didSend = await sendFeedActivityEmail({
        recipientUserId: row.userId,
        fromUserId: row.payload?.fromUserId ?? "",
        kind: row.kind,
        fromName: row.payload?.fromName ?? "Vivida-ის წევრი",
        fromUsername: row.payload?.fromUsername ?? null,
        postId,
        preview: row.payload?.preview,
        reaction: row.payload?.reaction,
      });
      if (didSend) sent++;
    }

    return { candidates: latest.size, sent };
  } catch (err) {
    console.error("[email] feed-activity flush threw:", (err as Error).message);
    return { candidates: 0, sent: 0 };
  }
}

/**
 * Bazaar transactional mail, paid order (to the reader) and delivered
 * reading (to the buyer). Unlike nudge mail these send immediately with no
 * absence gate or throttle: exactly-once is enforced by the caller's
 * reminder-delivery claim key per booking. Honors the bazaar_updates
 * opt-out. Never throws (callers fire-and-forget after flipping status).
 */
export async function sendBazaarBookingPaidEmail({
  recipientUserId,
  buyerName,
  serviceTitle,
  amountUsdc,
}: {
  recipientUserId: string;
  buyerName: string;
  serviceTitle: string;
  amountUsdc: string;
}): Promise<void> {
  const c = client();
  if (!c) return;

  const [recipient] = await db
    .select({
      email: users.email,
      name: users.name,
      bazaarUpdates: users.bazaarUpdates,
    })
    .from(users)
    .where(eq(users.id, recipientUserId))
    .limit(1);
  if (!recipient?.email || recipient.bazaarUpdates === false) return;

  const { bookingPaidSubject, BookingPaidEmail } =
    await import("@/lib/email-templates/bazaar-booking-paid");
  const subject = bookingPaidSubject(serviceTitle, "en");
  const orderUrl = `${ENGLISH_SITE_URL}/readings?view=bookings`;

  try {
    const result = await c.emails.send({
      from: FROM,
      to: recipient.email,
      subject,
      react: BookingPaidEmail({
        recipientName: recipient.name?.split(" ")[0] ?? null,
        buyerName,
        serviceTitle,
        amountUsdc,
        orderUrl,
        locale: "en",
      }),
    });
    if (result.error) {
      console.error("[email] bazaar booking-paid failed:", result.error);
      return;
    }
    await recordSent(recipientUserId, "bazaar_booking_paid", {
      email: recipient.email,
      subject,
    });
  } catch (err) {
    console.error("[email] bazaar booking-paid threw:", (err as Error).message);
  }
}

export async function sendBazaarReadingDeliveredEmail({
  recipientUserId,
  readerName,
  serviceTitle,
}: {
  recipientUserId: string;
  readerName: string;
  serviceTitle: string;
}): Promise<void> {
  const c = client();
  if (!c) return;

  const [recipient] = await db
    .select({
      email: users.email,
      name: users.name,
      bazaarUpdates: users.bazaarUpdates,
    })
    .from(users)
    .where(eq(users.id, recipientUserId))
    .limit(1);
  if (!recipient?.email || recipient.bazaarUpdates === false) return;

  const { readingDeliveredSubject, ReadingDeliveredEmail } =
    await import("@/lib/email-templates/bazaar-reading-delivered");
  const subject = readingDeliveredSubject("en");
  const readingUrl = `${ENGLISH_SITE_URL}/readings?view=bookings`;

  try {
    const result = await c.emails.send({
      from: FROM,
      to: recipient.email,
      subject,
      react: ReadingDeliveredEmail({
        recipientName: recipient.name?.split(" ")[0] ?? null,
        readerName,
        serviceTitle,
        readingUrl,
        locale: "en",
      }),
    });
    if (result.error) {
      console.error("[email] bazaar reading-delivered failed:", result.error);
      return;
    }
    await recordSent(recipientUserId, "bazaar_reading_delivered", {
      email: recipient.email,
      subject,
    });
  } catch (err) {
    console.error(
      "[email] bazaar reading-delivered threw:",
      (err as Error).message,
    );
  }
}
