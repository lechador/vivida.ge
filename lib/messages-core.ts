import { and, eq, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import { friendships, messages, type Message } from "@/db/schema";
import { recordTyping } from "@/lib/messages";
import { isBlockedEitherWay } from "@/lib/block";
import { isAccountRestricted, RESTRICTED_MESSAGE } from "@/lib/restriction";

/**
 * Messaging *write* logic used by website Server Actions in
 * actions/messages.ts.
 * Callers do their own auth and pass the resolved user id in; these functions
 * never touch sessions, send email, or revalidate Next's cache (those stay in
 * the wrappers). Read logic lives in lib/messages.ts.
 */

const MAX_BODY = 2000;

export type SendMessageResult =
  { ok: true; message: Message } | { ok: false; error: string };

/**
 * Whether `a` may message `b`, message gating. Restricted to MUTUAL
 * (accepted) friends only. The match-deck path was intentionally removed as
 * part of the low-density safety cleanup: with the deck flagged off, matches
 * no longer form, and any pre-existing match-only threads are now locked
 * (message history is preserved, only sending is blocked). A `blocked`
 * friendship row is a hard deny. To re-open match-based chat later, restore
 * the `areMatched(a, b)` fallback here (and re-enable the deck flag).
 */
async function canMessage(a: string, b: string): Promise<boolean> {
  // A restricted account (under-age, or manually restricted) on either side
  // closes the conversation in both directions.
  if (await isAccountRestricted(a)) return false;
  if (await isAccountRestricted(b)) return false;
  // A block in either direction always wins, regardless of friendship.
  if (await isBlockedEitherWay(a, b)) return false;
  const [link] = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, a), eq(friendships.recipientId, b)),
        and(eq(friendships.requesterId, b), eq(friendships.recipientId, a)),
      ),
    )
    .limit(1);
  // A block always wins; otherwise only an accepted friendship unlocks chat.
  if (link?.status === "blocked") return false;
  return link?.status === "accepted";
}

/**
 * Send a message to another user. Restricted to mutual (accepted) friends,
 * enforced server-side regardless of UI state. Returns the inserted row; the
 * caller handles the (fire-and-forget) notification email.
 */
export async function sendMessageCore(
  senderId: string,
  recipientId: string,
  body: string,
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

  // Restricted senders get the specific reason; canMessage also covers the
  // recipient side and is the authoritative gate.
  if (await isAccountRestricted(senderId)) {
    return { ok: false, error: RESTRICTED_MESSAGE };
  }

  if (!(await canMessage(senderId, recipientId))) {
    return { ok: false, error: "წერა მხოლოდ მეგობრებთან შეგიძლია" };
  }

  const [inserted] = await db
    .insert(messages)
    .values({ senderId, recipientId, body: trimmed })
    .returning();

  return { ok: true, message: inserted };
}

/**
 * Sender pings while typing. Friendship-checked, idempotent, each ping
 * refreshes the typing-indicator TTL.
 */
export async function pingTypingCore(
  senderId: string,
  recipientId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (recipientId === senderId) return { ok: false, error: "self" };
  if (!(await canMessage(senderId, recipientId))) {
    return { ok: false, error: "not_allowed" };
  }
  await recordTyping(senderId, recipientId);
  return { ok: true };
}

/** Mark all messages from a partner to me as read. */
export async function markConversationReadCore(
  viewerId: string,
  partnerId: string,
): Promise<{ ok: true }> {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.senderId, partnerId),
        eq(messages.recipientId, viewerId),
        isNull(messages.readAt),
      ),
    );
  return { ok: true };
}
