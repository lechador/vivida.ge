"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { type Message } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { sendMessageEmail } from "@/lib/email";
import { sendMessagePush } from "@/lib/notification-push";
import {
  markConversationReadCore,
  pingTypingCore,
  sendMessageCore,
} from "@/lib/messages-core";

export type SendMessageResult =
  | { ok: true; message: Message }
  | { ok: false; error: string };

/**
 * Send a message to another user. Shared core does the friendship gating +
 * insert; the action adds auth, the fire-and-forget email, and light
 * revalidation.
 */
export async function sendMessage(
  recipientId: string,
  body: string
): Promise<SendMessageResult> {
  const user = await requireUser();
  const result = await sendMessageCore(user.id, recipientId, body);
  if (!result.ok) return result;

  const trimmed = result.message.body;
  after(async () => {
    try {
      await sendMessageEmail({
        recipientUserId: recipientId,
        fromUserId: user.id,
        fromName: user.name ?? "Vivida-ის წევრი",
        body: trimmed,
      });
    } catch (err) {
      console.warn(
        "[messages] message email after-hook failed:",
        (err as Error).message
      );
    }
    // Web push for away recipients — throttled per conversation inside.
    try {
      await sendMessagePush({
        recipientUserId: recipientId,
        fromUserId: user.id,
        fromName: user.name ?? "Vivida-ის წევრი",
        body: trimmed,
      });
    } catch (err) {
      console.warn(
        "[messages] message push after-hook failed:",
        (err as Error).message
      );
    }
  });

  // Light revalidation — chat panel reads fresh data on next mount
  revalidatePath("/dashboard");
  revalidatePath("/report");
  revalidatePath("/friends");

  return result;
}

/**
 * Sender pings while they're typing. Friendship-checked. Idempotent — each
 * ping refreshes the TTL; the recipient's SSE poll picks up the row.
 */
export async function pingTyping(
  recipientId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  return pingTypingCore(user.id, recipientId);
}

/** Mark all messages from a partner to me as read. Called when the user
 *  opens that conversation in the chat panel. */
export async function markConversationRead(
  partnerId: string
): Promise<{ ok: true }> {
  const user = await requireUser();
  return markConversationReadCore(user.id, partnerId);
}
