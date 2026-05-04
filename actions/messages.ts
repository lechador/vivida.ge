"use server";

import { and, eq, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { friendships, messages, type Message } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { recordTyping } from "@/lib/messages";

const MAX_BODY = 2000;

export type SendMessageResult =
  | { ok: true; message: Message }
  | { ok: false; error: string };

/**
 * Send a message to another user. Restricted to mutual friends —
 * enforces it server-side regardless of UI state.
 */
export async function sendMessage(
  recipientId: string,
  body: string
): Promise<SendMessageResult> {
  const user = await requireUser();
  if (recipientId === user.id) {
    return { ok: false, error: "ვერ აგზავნი საკუთარ თავს" };
  }
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "ცარიელი წერილი ვერ გაიგზავნება" };
  }
  if (trimmed.length > MAX_BODY) {
    return { ok: false, error: "წერილი ძალიან გრძელია" };
  }

  // Friendship check — must be 'accepted' in either direction
  const [link] = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, user.id),
          eq(friendships.recipientId, recipientId)
        ),
        and(
          eq(friendships.requesterId, recipientId),
          eq(friendships.recipientId, user.id)
        )
      )
    )
    .limit(1);
  if (!link || link.status !== "accepted") {
    return { ok: false, error: "მხოლოდ მეგობრებს შეგიძლია წერო" };
  }

  const [inserted] = await db
    .insert(messages)
    .values({
      senderId: user.id,
      recipientId,
      body: trimmed,
    })
    .returning();

  // Light revalidation — chat panel reads fresh data on next mount
  revalidatePath("/dashboard");
  revalidatePath("/report");
  revalidatePath("/friends");

  return { ok: true, message: inserted };
}

/**
 * Sender pings while they're typing. Friendship-checked. Idempotent — each
 * ping refreshes the TTL; the recipient's SSE poll picks up the row within
 * 2s and pushes a 'typing' event.
 */
export async function pingTyping(
  recipientId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  if (recipientId === user.id) {
    return { ok: false, error: "self" };
  }
  const [link] = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, user.id),
          eq(friendships.recipientId, recipientId)
        ),
        and(
          eq(friendships.requesterId, recipientId),
          eq(friendships.recipientId, user.id)
        )
      )
    )
    .limit(1);
  if (!link || link.status !== "accepted") {
    return { ok: false, error: "not_friends" };
  }
  await recordTyping(user.id, recipientId);
  return { ok: true };
}

/** Mark all messages from a partner to me as read. Called when the user
 *  opens that conversation in the chat panel. */
export async function markConversationRead(
  partnerId: string
): Promise<{ ok: true }> {
  const user = await requireUser();
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.senderId, partnerId),
        eq(messages.recipientId, user.id),
        isNull(messages.readAt)
      )
    );
  return { ok: true };
}
