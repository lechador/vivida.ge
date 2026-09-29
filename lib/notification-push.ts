import { after } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  type NotificationKind,
  type NotificationPayload,
} from "@/db/schema";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import type { NativePushCategory } from "@/lib/native-push";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isBlockedEitherWay } from "@/lib/block";

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

const REACTION_EN: Record<string, string> = {
  like: "liked your post",
  funny: "found your post funny",
  sad: "reacted sadly to your post",
  dislike: "disliked your post",
};

function copyFor(
  kind: NotificationKind,
  payload: NotificationPayload,
  locale: UserLocale,
): { title: string; body: string; url: string; tag: string } | null {
  const en = locale === "en";
  const name =
    payload.fromName ??
    payload.fromUsername ??
    (en ? "A Vivida member" : "Vivida-ის წევრი");
  // Single-post route, not /feed#post-<id>: the anchor only exists while the
  // post is inside the feed's first page.
  const postUrl = payload.postId ? `/feed/${payload.postId}` : "/feed";
  switch (kind) {
    case "friend_request":
      return {
        title: en ? "Friend request ➕" : "მეგობრობის თხოვნა ➕",
        body: en
          ? `${name} sent you a friend request`
          : `${name} გთხოვს დამეგობრებას`,
        url: "/friends?tab=incoming",
        tag: "friend-request",
      };
    case "friend_accepted":
      return {
        title: en ? "Request accepted ✨" : "მოთხოვნა მიღებულია ✨",
        body: en
          ? `${name} accepted your friend request`
          : `${name}-მ მიიღო შენი მეგობრობის თხოვნა`,
        url: payload.fromUsername ? `/u/${payload.fromUsername}` : "/friends",
        tag: "friend-accepted",
      };
    case "post_comment":
      return {
        title: en
          ? `💬 ${name} commented on your post`
          : `💬 ${name} დააკომენტარა შენს პოსტს`,
        body: payload.preview ?? "",
        url: postUrl,
        tag: `post-${payload.postId ?? "x"}`,
      };
    case "post_reaction":
      return {
        title: en ? "New reaction to your post" : "შენს პოსტს გამოეხმაურნენ",
        body: en
          ? `${name} ${REACTION_EN[payload.reaction ?? ""] ?? "reacted to your post"}`
          : `${name} — ${REACTION_KA[payload.reaction ?? ""] ?? "გამოეხმაურა შენს პოსტს"}`,
        url: postUrl,
        // Collapse repeated reactions on the same post into one banner.
        tag: `reactions-${payload.postId ?? "x"}`,
      };
    case "mention":
      return {
        title: en
          ? payload.mentionContext === "comment"
            ? `@ ${name} mentioned you in a comment`
            : `@ ${name} mentioned you in a post`
          : payload.mentionContext === "comment"
            ? `@ ${name} მოგიხსენია კომენტარში`
            : `@ ${name} მოგიხსენია პოსტში`,
        body: payload.preview ?? "",
        url: postUrl,
        tag: `mention-${payload.postId ?? "x"}`,
      };
    case "new_match":
      return {
        title: en ? "New match ✨" : "ახალი მეჩი ✨",
        body: en
          ? `You and ${name} liked each other`
          : `თქვენ და ${name} მოეწონეთ ერთმანეთს`,
        url: "/messages",
        tag: "new-match",
      };
    case "relationship_connected":
      return {
        title: en ? "Partner connected 💞" : "პარტნიორი დაკავშირებულია 💞",
        body: en
          ? `${name} accepted your relationship invitation`
          : `${name}-მ მიიღო შენი ურთიერთობის მოწვევა`,
        url:
          payload.reminderUrl ??
          (payload.partnerId ? `/synastry/${payload.partnerId}` : "/synastry"),
        tag: `relationship-connected-${payload.partnerId ?? "x"}`,
      };
    case "relationship_weekly":
      return {
        title: en
          ? "Your weekly relationship update"
          : "ურთიერთობის ახალი კვირა",
        body:
          payload.relationshipHeadline ??
          (en
            ? "See what this week brings for both of you"
            : "ნახე, რას გთავაზობთ ეს კვირა ორივეს"),
        url:
          payload.reminderUrl ??
          (payload.partnerId ? `/synastry/${payload.partnerId}` : "/synastry"),
        tag: `relationship-weekly-${payload.partnerId ?? "x"}`,
      };
    case "relationship_transit":
      return {
        title: en
          ? "Important relationship transit"
          : "ურთიერთობის მნიშვნელოვანი ტრანზიტი",
        body:
          payload.transitTitle ??
          (en
            ? "A meaningful moment is approaching"
            : "მნიშვნელოვანი მომენტი ახლოვდება"),
        url: payload.partnerId ? `/synastry/${payload.partnerId}` : "/synastry",
        tag: `relationship-transit-${payload.partnerId ?? "x"}`,
      };
    case "timing_reminder":
    case "forecast_reminder":
    case "ask_nudge":
      return payload.reminderTitle && payload.reminderBody
        ? {
            title: payload.reminderTitle,
            body: payload.reminderBody,
            url: payload.reminderUrl ?? "/dashboard",
            tag: kind,
          }
        : null;
    default:
      return null; // e.g. "credit" — bell-only by design
  }
}

function categoryFor(kind: NotificationKind): NativePushCategory | undefined {
  if (kind === "post_comment") return "comments";
  if (kind === "post_reaction") return "reactions";
  return undefined;
}

/**
 * Queue a push mirroring a just-inserted notification row. Never throws and
 * never blocks: the send runs after the response via after(), falling back to
 * a detached promise if we're outside a request scope (e.g. scripts).
 */
export function queueNotificationPush(
  recipientId: string,
  kind: NotificationKind,
  payload: NotificationPayload,
): void {
  if (!isPushConfigured()) return;
  const task = async () => {
    try {
      if (
        payload.fromUserId &&
        (await isBlockedEitherWay(recipientId, payload.fromUserId))
      ) {
        return;
      }
      const [recipient] = await db
        .select({ locale: users.interfaceLanguage })
        .from(users)
        .where(eq(users.id, recipientId))
        .limit(1);
      const copy = copyFor(
        kind,
        payload,
        normalizeUserLocale(recipient?.locale),
      );
      if (!copy) return;
      await sendPushToUser(recipientId, copy, categoryFor(kind));
    } catch (err) {
      console.warn("[notification-push] send failed:", (err as Error).message);
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
  await sendPushToUser(
    opts.recipientUserId,
    {
      title: `💬 ${opts.fromName}`,
      body: opts.body.slice(0, 120),
      url: `/messages?with=${encodeURIComponent(opts.fromUserId)}`,
      tag: `msg-${opts.fromUserId}`,
    },
    "messages",
  );
}
