import { Resend } from "resend";
import { and, desc, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog, profiles, users } from "@/db/schema";
import { VerificationEmail } from "@/lib/email-templates/verification";
import { PasswordResetEmail } from "@/lib/email-templates/password-reset";
import { WelcomeEmail } from "@/lib/email-templates/welcome";
import { FriendRequestEmail } from "@/lib/email-templates/friend-request";
import { MessageEmail } from "@/lib/email-templates/message";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";

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

const FROM = process.env.RESEND_FROM ?? "Vivida <onboarding@resend.dev>";
const ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Build an absolute URL inside an email. Relative paths break in some
 * mail clients, so every link must include scheme + host.
 */
function absUrl(path: string): string {
  return `${ORIGIN.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
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
}: {
  to: string;
  name: string | null;
  token: string;
}): Promise<void> {
  const c = client();
  const verifyUrl = absUrl(`/api/auth/verify-email?token=${token}`);
  if (!c) {
    console.warn(
      "[email] RESEND_API_KEY missing — would have sent verification to",
      to,
      "→",
      verifyUrl
    );
    return;
  }
  const result = await c.emails.send({
    from: FROM,
    to,
    subject: "დაადასტურე შენი ელფოსტა · Vivida",
    react: VerificationEmail({ name, verifyUrl }),
  });
  if (result.error) {
    console.error("[email] verification send failed:", result.error);
    throw new Error(result.error.message ?? "verification send failed");
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string | null;
  token: string;
}): Promise<void> {
  const c = client();
  const resetUrl = absUrl(`/reset-password?token=${token}`);
  if (!c) {
    console.warn(
      "[email] RESEND_API_KEY missing — would have sent reset to",
      to,
      "→",
      resetUrl
    );
    return;
  }
  const result = await c.emails.send({
    from: FROM,
    to,
    subject: "პაროლის აღდგენა · Vivida",
    react: PasswordResetEmail({ name, resetUrl }),
  });
  if (result.error) {
    console.error("[email] password reset send failed:", result.error);
    throw new Error(result.error.message ?? "password reset send failed");
  }
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

async function recordSent(userId: string, kind: string): Promise<void> {
  await db.insert(emailSendLog).values({ userId, kind });
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
 * Welcome email — sent once, on first signup. Triggered from
 * `provisionTrialIfMissing` for both Google OAuth (lazy on first
 * dashboard load) and email signup (inline after account creation).
 * The site is currently 100% free, so the copy is neutral
 * "your cosmic journey begins" framing — no trial pitch. When paid
 * plans return, swap the template body but keep this trigger path.
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
    await recordSent(userId, "welcome");
  } catch (err) {
    console.error("[email] welcome threw:", (err as Error).message);
  }
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
    await recordSent(recipientUserId, "friend_request");
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
    await recordSent(recipientUserId, "message");
  } catch (err) {
    console.error("[email] message threw:", (err as Error).message);
  }
}
