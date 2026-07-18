import { after } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, type NotificationKind, type NotificationPayload } from "@/db/schema";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Web-push mirrors for social notifications. Until now push fired exactly
 * once a day (the morning horoscope blast) — social events (comments,
 * reactions, mentions, friend requests, matches, messages) only reached the
 * in-app bell, so nobody learned about a reply until their next visit. This
 * turns those events into return visits.
 *
 * Design:
 *  - queueNotificationPush(): call right after inserting a `notification` row.
 *    Fire-and-forget via after() so it never adds latency or failure risk to
 *    the write path. Copy mirrors the bell dropdown's Georgian labels.
 *  - sendMessagePush(): chat messages don't create notification rows (they're
 *    SSE-driven in-app), so they get their own path — gated on the recipient
 *    being away from the app and throttled per sender→recipient pair so a
 *    rapid-fire conversation doesn't spam the lockscreen.
 *  - The `credit` notification kind is deliberately NOT pushed — balance
 *    changes are ambient info, not something to interrupt someone's day for.
 */

const REACTION_KA: Record<string, string> = {
  like: "მოეწონა შენი პოსტი",
  funny: "გაეცინა შენი პოსტი",
  sad: "დაამწუხრე",
  dislike: "არ მოეწონა შენი პოსტი",
};

function copyFor(
  kind: NotificationKind,
  payload: NotificationPayload
): { title: string; body: string; url: string; tag: string } | null {
  const name = payload.fromName ?? payload.fromUsername ?? "Vivida-ის წევრი";
  const postUrl = payload.postId ? `/feed#post-${payload.postId}` : "/feed";
  switch (kind) {
    case "friend_request":
      return {
        title: "მეგობრობის თხოვნა ➕",
        body: `${name} გთხოვს დამეგობრებას`,
        url: "/friends?tab=incoming",
        tag: "friend-request",
      };
    case "friend_accepted":
      return {
        title: "მოთხოვნა მიღებულია ✨",
        body: `${name}-მ მიიღო შენი მეგობრობის თხოვნა`,
        url: payload.fromUsername ? `/u/${payload.fromUsername}` : "/friends",
        tag: "friend-accepted",
      };
    case "post_comment":
      return {
        title: `💬 ${name} დააკომენტარა შენს პოსტს`,
        body: payload.preview ?? "",
        url: postUrl,
        tag: `post-${payload.postId ?? "x"}`,
      };
    case "post_reaction":
      return {
        title: "შენს პოსტს გამოეხმაურნენ",
        body: `${name} — ${REACTION_KA[payload.reaction ?? ""] ?? "გამოეხმაურა შენს პოსტს"}`,
        url: postUrl,
        // Collapse repeated reactions on the same post into one banner.
        tag: `reactions-${payload.postId ?? "x"}`,
      };
    case "mention":
      return {
        title:
          payload.mentionContext === "comment"
            ? `@ ${name} მოგიხსენია კომენტარში`
            : `@ ${name} მოგიხსენია პოსტში`,
        body: payload.preview ?? "",
        url: postUrl,
        tag: `mention-${payload.postId ?? "x"}`,
      };
    case "new_match":
      return {
        title: "ახალი მეჩი ✨",
        body: `თქვენ და ${name} მოეწონეთ ერთმანეთს`,
        url: "/messages",
        tag: "new-match",
      };
    default:
      return null; // e.g. "credit" — bell-only by design
  }
}

/**
 * Queue a push mirroring a just-inserted notification row. Never throws and
 * never blocks: the send runs after the response via after(), falling back to
 * a detached promise if we're outside a request scope (e.g. scripts).
 */
export function queueNotificationPush(
  recipientId: string,
  kind: NotificationKind,
  payload: NotificationPayload
): void {
  if (!isPushConfigured()) return;
  const copy = copyFor(kind, payload);
  if (!copy) return;
  const task = async () => {
    try {
      await sendPushToUser(recipientId, copy);
    } catch (err) {
      console.warn(
        "[notification-push] send failed:",
        (err as Error).message
      );
    }
  };
  try {
    after(task);
  } catch {
    void task();
  }
}

/** Is the user away from the app (no authed page view for `minutes`)? */
async function isAway(userId: string, minutes: number): Promise<boolean> {
  const [row] = await db
    .select({ lastLoginAt: users.lastLoginAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.lastLoginAt) return true;
  return Date.now() - row.lastLoginAt.getTime() > minutes * 60_000;
}

/**
 * Push for a new chat message. Only fires when the recipient is away from the
 * app (in-app they already see the SSE toast/bell), and at most once per
 * sender→recipient pair per 10 minutes so an active conversation delivers one
 * "you have messages" nudge, not a banner per line. `tag` collapses banners
 * from the same sender.
 */
export async function sendMessagePush(opts: {
  recipientUserId: string;
  fromUserId: string;
  fromName: string;
  body: string;
}): Promise<void> {
  if (!isPushConfigured()) return;
  if (!(await isAway(opts.recipientUserId, 3))) return;
  try {
    await enforceRateLimit({
      bucket: "push_msg",
      identifier: `${opts.recipientUserId}:${opts.fromUserId}`,
      limit: 1,
      windowMs: 10 * 60 * 1000,
    });
  } catch {
    return; // already nudged for this conversation recently
  }
  await sendPushToUser(opts.recipientUserId, {
    title: `💬 ${opts.fromName}`,
    body: opts.body.slice(0, 120),
    url: `/messages?with=${encodeURIComponent(opts.fromUserId)}`,
    tag: `msg-${opts.fromUserId}`,
  });
}
