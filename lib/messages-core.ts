import { and, eq, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import { friendships, messages, type Message } from "@/db/schema";
import { recordTyping } from "@/lib/messages";

/**
 * Framework-agnostic messaging *write* logic, shared by the website (Server
 * Actions in actions/messages.ts) and the mobile API (app/api/v1/messages/*).
 * Callers do their own auth and pass the resolved user id in; these functions
 * never touch sessions, send email, or revalidate Next's cache (those stay in
 * the wrappers). Read logic lives in lib/messages.ts.
 */

const MAX_BODY = 2000;

export type SendMessageResult =
  | { ok: true; message: Message }
  | { ok: false; error: string };

/** Whether two users are mutual (accepted) friends — message gating. */
async function areFriends(a: string, b: string): Promise<boolean> {
  const [link] = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, a), eq(friendships.recipientId, b)),
        and(eq(friendships.requesterId, b), eq(friendships.recipientId, a))
      )
    )
    .limit(1);
  return !!link && link.status === "accepted";
}

/**
 * Send a message to another user. Restricted to mutual friends — enforced
 * server-side regardless of UI state. Returns the inserted row; the caller
 * handles the (fire-and-forget) notification email.
 */
export async function sendMessageCore(
  senderId: string,
  recipientId: string,
  body: string
): Promise<SendMessageResult> {
  if (recipientId === senderId) {
    return { ok: false, error: "ვერ აგზავნი საკუთარ თავს" };
  }
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "ცარიელი წერილი ვერ გაიგზავნება" };
  }
  if (trimmed.length > MAX_BODY) {
    return { ok: false, error: "წერილი ძალიან გრძელია" };
  }

  if (!(await areFriends(senderId, recipientId))) {
    return { ok: false, error: "მხოლოდ მეგობრებს შეგიძლია წერო" };
  }

  const [inserted] = await db
    .insert(messages)
    .values({ senderId, recipientId, body: trimmed })
    .returning();

  return { ok: true, message: inserted };
}

/**
 * Sender pings while typing. Friendship-checked, idempotent — each ping
 * refreshes the typing-indicator TTL.
 */
export async function pingTypingCore(
  senderId: string,
  recipientId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (recipientId === senderId) return { ok: false, error: "self" };
  if (!(await areFriends(senderId, recipientId))) {
    return { ok: false, error: "not_friends" };
  }
  await recordTyping(senderId, recipientId);
  return { ok: true };
}

/** Mark all messages from a partner to me as read. */
export async function markConversationReadCore(
  viewerId: string,
  partnerId: string
): Promise<{ ok: true }> {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.senderId, partnerId),
        eq(messages.recipientId, viewerId),
        isNull(messages.readAt)
      )
    );
  return { ok: true };
}
