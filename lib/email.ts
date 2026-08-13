import { Resend } from "resend";
import { and, desc, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog, profiles, users } from "@/db/schema";
import { VerificationEmail } from "@/lib/email-templates/verification";
import { PasswordResetEmail } from "@/lib/email-templates/password-reset";
import { WelcomeEmail } from "@/lib/email-templates/welcome";
import { FriendRequestEmail } from "@/lib/email-templates/friend-request";
import { MessageEmail } from "@/lib/email-templates/message";
import { MbtiResultEmail } from "@/lib/email-templates/mbti-result";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";
import { isEnglishHost } from "@/lib/seo/locales";

/**
 * Resend client. Lazily-instantiated so dev environments without the API
 * key (e.g. running migrations) don't crash at import time. Functions in
 * this module return early with a console warning when the key is absent
 * — matching how `lib/r2.ts` handles its credentials.
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
// "Name <email>" string — normalize to always show "Vivida" as the sender
// name so inboxes never display a raw mailbox name like "hello".
function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}

const FROM = resolveFrom(process.env.RESEND_FROM, "Vivida <onboarding@resend.dev>");
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

function localeForOrigin(origin: string | undefined): "ka" | "en" {
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
      "[email] RESEND_API_KEY missing — would have sent verification to",
      to,
      "→",
      verifyUrl
    );
    return;
  }
  const locale = localeForOrigin(origin);
  const subject = locale === "en" ? "Verify your email · Vivida" : "დაადასტურე შენი ელფოსტა · Vivida";
  const result = await c.emails.send({
    from: FROM,
    to,
    subject,
    react: VerificationEmail({ name, verifyUrl, code: code ?? null, locale }),
  });
  if (result.error) {
    console.error("[email] verification send failed:", result.error);
    await recordSentByEmail(to, "verification", subject, "failed", result.error.message);
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
      "[email] RESEND_API_KEY missing — would have sent reset to",
      to,
      "→",
      resetUrl
    );
    return;
  }
  const locale = localeForOrigin(origin);
  const subject = locale === "en" ? "Reset your password · Vivida" : "პაროლის აღდგენა · Vivida";
  const result = await c.emails.send({
    from: FROM,
    to,
    subject,
    react: PasswordResetEmail({ name, resetUrl, locale }),
  });
  if (result.error) {
    console.error("[email] password reset send failed:", result.error);
    await recordSentByEmail(to, "password_reset", subject, "failed", result.error.message);
    throw new Error(result.error.message ?? "password reset send failed");
  }
  await recordSentByEmail(to, "password_reset", subject, "sent");
}

// ─────────────────────────────────────────────────────────────────────
// Lifecycle / notification emails — welcome, friend-request, message.
// All three are fire-and-forget from the call site (typically wrapped in
// `after()`) and never throw. They guard against:
//   - missing RESEND_API_KEY (early-return with warn)
//   - duplicate welcome (one-shot per user via email_send_log)
//   - notification spam (1h throttle per user per kind)
//   - sending while user is actively using the app (lastLoginAt < 1h ago)
// ─────────────────────────────────────────────────────────────────────

const ABSENCE_THRESHOLD_MIN = 60;
const NOTIFICATION_THROTTLE_MIN = 60;

/** Has any send for this (userId, kind) ever happened? Welcome guard. */
async function hasSentBefore(
  userId: string,
  kind: string
): Promise<boolean> {
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
  minutes: number
): Promise<boolean> {
  const cutoff = new Date(Date.now() - minutes * 60_000);
  const [row] = await db
    .select({ id: emailSendLog.id })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.userId, userId),
        eq(emailSendLog.kind, kind),
        gt(emailSendLog.sentAt, cutoff)
      )
    )
    .orderBy(desc(emailSendLog.sentAt))
    .limit(1);
  return !!row;
}

async function recordSent(
  userId: string,
  kind: string,
  extra?: { email?: string | null; subject?: string; status?: string; error?: string }
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
  error?: string
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
  minutes: number
): Promise<boolean> {
  const [row] = await db
    .select({ lastLoginAt: users.lastLoginAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return false;
  if (!row.lastLoginAt) return true; // never seen — treat as absent
  return Date.now() - row.lastLoginAt.getTime() > minutes * 60_000;
}

/**
 * Welcome email — sent once, on first signup, from the profile-save hooks
 * (sendWelcomeIfEligible) once the user has verified their email and filled
 * birth data. The site runs on credits (no paid plans), so the copy is a
 * neutral "your cosmic journey begins" framing — no trial pitch.
 *
 * Idempotent at the email_send_log level — a second call after the
 * first success is a no-op. Always sends regardless of email
 * preferences (transactional).
 */
export async function sendWelcomeEmail({
  userId,
  to,
  name,
}: {
  userId: string;
  to: string;
  name: string | null;
}): Promise<void> {
  const c = client();
  if (!c) {
    console.warn("[email] RESEND_API_KEY missing — skipping welcome to", to);
    return;
  }
  if (await hasSentBefore(userId, "welcome")) return;

  const dashboardUrl = absUrl("/dashboard");

  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to,
        subject: "შენი კოსმიური მოგზაურობა იწყება · Vivida",
        react: WelcomeEmail({
          name,
          dashboardUrl,
        }),
      },
      { idempotencyKey: `welcome:${userId}` }
    );
    if (result.error) {
      console.error("[email] welcome send failed:", result.error);
      return;
    }
    await recordSent(userId, "welcome", {
      email: to,
      subject: "შენი კოსმიური მოგზაურობა იწყება · Vivida",
    });
  } catch (err) {
    console.error("[email] welcome threw:", (err as Error).message);
  }
}

/**
 * Send an Astro-MBTI result email. Transactional (not deduped — a user can
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
  locale?: "ka" | "en";
  origin?: string;
}): Promise<void> {
  const c = client();
  if (!c) {
    console.warn("[email] RESEND_API_KEY missing — skipping MBTI result to", to);
    return;
  }
  const subject = locale === "en"
    ? `Your type is ${mbtiType} — ${archetypeNameGe} · Vivida`
    : `შენი ტიპია ${mbtiType} — ${archetypeNameGe} · Vivida`;
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
      { idempotencyKey: `mbti:${resultId}` }
    );
    if (result.error) {
      console.error("[email] mbti result send failed:", result.error);
      await recordSent(userId, "mbti_result", { email: to, subject, status: "failed" });
      return;
    }
    await recordSent(userId, "mbti_result", { email: to, subject });
  } catch (err) {
    console.error("[email] mbti result threw:", (err as Error).message);
  }
}

/**
 * Send the welcome email only once the account is a fully onboarded member:
 * email verified AND birth data (a profile row) present. Called from the
 * profile-save background hooks (web + mobile) — the moment onboarding
 * finishes — NOT at registration, so a signup that stops at "check your
 * inbox" never gets a premature "your cosmic journey begins."
 *
 * "Email verified" = a verified password account (emailVerified set) OR an
 * OAuth account (no passwordHash — Google already proved the address). NB:
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
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!row?.email || !row.hasProfile) return;
  const emailProven = row.emailVerified !== null || row.passwordHash === null;
  if (!emailProven) return;
  await sendWelcomeEmail({ userId, to: row.email, name: row.name });
}

/**
 * Friend-request email — sent only when the recipient has been absent
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
      NOTIFICATION_THROTTLE_MIN
    )
  ) {
    return;
  }

  const token = await getOrCreateUnsubscribeToken(recipientUserId);
  const unsubUrl = absUrl(`/unsubscribe?token=${token}&type=nudges`);
  const friendsUrl = absUrl("/friends");

  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to: recipient.email,
        subject: `${fromName}-მ მეგობრობა გთხოვა · Vivida`,
        react: FriendRequestEmail({
          recipientName: recipient.name?.split(" ")[0] ?? null,
          fromName,
          fromUsername,
          friendsUrl,
          unsubscribeUrl: unsubUrl,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      // Hour-bucketed key — within the same hour, the throttle already
      // suppresses duplicates; key just guards against races.
      {
        idempotencyKey: `friend_request:${recipientUserId}:${Math.floor(
          Date.now() / 3600_000
        )}`,
      }
    );
    if (result.error) {
      console.error("[email] friend-request send failed:", result.error);
      return;
    }
    await recordSent(recipientUserId, "friend_request", {
      email: recipient.email,
      subject: `${fromName}-მ მეგობრობა გთხოვა · Vivida`,
    });
  } catch (err) {
    console.error("[email] friend-request threw:", (err as Error).message);
  }
}

/**
 * Message-received email — same gating as friend-request. Includes the
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
  const unsubUrl = absUrl(`/unsubscribe?token=${token}&type=nudges`);
  // The chat page reads `?with=<partnerId>` — see components/chat/message-button.tsx.
  const conversationUrl = absUrl(
    `/messages?with=${encodeURIComponent(fromUserId)}`
  );

  const snippet =
    body.length > 140 ? `${body.slice(0, 140).trimEnd()}…` : body;

  try {
    const result = await c.emails.send(
      {
        from: FROM,
        to: recipient.email,
        subject: `${fromName}-მ წერილი მოგწერა · Vivida`,
        react: MessageEmail({
          recipientName: recipient.name?.split(" ")[0] ?? null,
          fromName,
          fromUsername: senderProfile?.username ?? null,
          snippet,
          conversationUrl,
          unsubscribeUrl: unsubUrl,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      {
        idempotencyKey: `message:${recipientUserId}:${Math.floor(
          Date.now() / 3600_000
        )}`,
      }
    );
    if (result.error) {
      console.error("[email] message send failed:", result.error);
      return;
    }
    await recordSent(recipientUserId, "message", {
      email: recipient.email,
      subject: `${fromName}-მ წერილი მოგწერა · Vivida`,
    });
  } catch (err) {
    console.error("[email] message threw:", (err as Error).message);
  }
}
