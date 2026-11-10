import { after } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  type NotificationKind,
  type NotificationPayload,
} from "@/db/schema";
import { pickCopy } from "@/lib/email-templates/_copy";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isBlockedEitherWay } from "@/lib/block";

/**
 * Web-push mirrors for social notifications. Until now push fired exactly
 * once a day (the morning horoscope blast), social events (comments,
 * reactions, mentions, friend requests, matches, messages) only reached the
 * in-app bell, so nobody learned about a reply until their next visit. This
 * turns those events into return visits.
 *
 * Design:
 *  - queueNotificationPush(): call right after inserting a `notification` row.
 *    Fire-and-forget via after() so it never adds latency or failure risk to
 *    the write path. Copy is per recipient locale (ka/en/pl).
 *  - sendMessagePush(): chat messages don't create notification rows (they're
 *    SSE-driven in-app), so they get their own path, gated on the recipient
 *    being away from the app and throttled per sender→recipient pair so a
 *    rapid-fire conversation doesn't spam the lockscreen.
 *  - The `credit` notification kind is deliberately NOT pushed, balance
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

// Present tense on purpose: Polish past tense is gendered (polubił/polubiła)
// and we don't know the sender's gender.
const REACTION_PL: Record<string, string> = {
  like: "lubi Twój post",
  funny: "śmieje się z Twojego posta",
  sad: "smuci się z powodu Twojego posta",
  dislike: "nie lubi Twojego posta",
};

export function copyFor(
  kind: NotificationKind,
  payload: NotificationPayload,
  locale: UserLocale,
): { title: string; body: string; url: string; tag: string } | null {
  const t = <T>(copy: { ka: T; en: T; pl: T }) => pickCopy(locale, copy);
  const name =
    payload.fromName ??
    payload.fromUsername ??
    t({ ka: "Vivida-ის წევრი", en: "A Vivida member", pl: "Ktoś z Vivida" });
  // Single-post route, not /feed#post-<id>: the anchor only exists while the
  // post is inside the feed's first page.
  const postUrl = payload.postId ? `/feed/${payload.postId}` : "/feed";
  const synastryUrl = payload.partnerId
    ? `/synastry/${payload.partnerId}`
    : "/synastry";
  switch (kind) {
    case "friend_request":
      return {
        title: t({
          ka: "მეგობრობის თხოვნა ➕",
          en: "Friend request ➕",
          pl: "Zaproszenie do znajomych ➕",
        }),
        body: t({
          ka: `${name} გთხოვს დამეგობრებას`,
          en: `${name} sent you a friend request`,
          pl: `${name} zaprasza Cię do znajomych`,
        }),
        url: "/friends?tab=incoming",
        tag: "friend-request",
      };
    case "friend_accepted":
      return {
        title: t({
          ka: "მოთხოვნა მიღებულია ✨",
          en: "Request accepted ✨",
          pl: "Zaproszenie przyjęte ✨",
        }),
        body: t({
          ka: `${name}-მ მიიღო შენი მეგობრობის თხოვნა`,
          en: `${name} accepted your friend request`,
          pl: `${name} przyjmuje Twoje zaproszenie do znajomych`,
        }),
        url: payload.fromUsername ? `/u/${payload.fromUsername}` : "/friends",
        tag: "friend-accepted",
      };
    case "post_comment":
      return {
        title: t({
          ka: `💬 ${name} დააკომენტარა შენს პოსტს`,
          en: `💬 ${name} commented on your post`,
          pl: `💬 ${name} komentuje Twój post`,
        }),
        body: payload.preview ?? "",
        url: postUrl,
        tag: `post-${payload.postId ?? "x"}`,
      };
    case "post_reaction": {
      const reaction = payload.reaction ?? "";
      return {
        title: t({
          ka: "შენს პოსტს გამოეხმაურნენ",
          en: "New reaction to your post",
          pl: "Nowa reakcja na Twój post",
        }),
        body: t({
          ka: `${name}, ${REACTION_KA[reaction] ?? "გამოეხმაურა შენს პოსტს"}`,
          en: `${name} ${REACTION_EN[reaction] ?? "reacted to your post"}`,
          pl: `${name} ${REACTION_PL[reaction] ?? "reaguje na Twój post"}`,
        }),
        url: postUrl,
        // Collapse repeated reactions on the same post into one banner.
        tag: `reactions-${payload.postId ?? "x"}`,
      };
    }
    case "mention":
      return {
        title:
          payload.mentionContext === "comment"
            ? t({
                ka: `@ ${name} მოგიხსენია კომენტარში`,
                en: `@ ${name} mentioned you in a comment`,
                pl: `@ ${name} wspomina o Tobie w komentarzu`,
              })
            : t({
                ka: `@ ${name} მოგიხსენია პოსტში`,
                en: `@ ${name} mentioned you in a post`,
                pl: `@ ${name} wspomina o Tobie w poście`,
              }),
        body: payload.preview ?? "",
        url: postUrl,
        tag: `mention-${payload.postId ?? "x"}`,
      };
    case "new_match":
      return {
        title: t({
          ka: "ახალი მეჩი ✨",
          en: "New match ✨",
          pl: "Nowe dopasowanie ✨",
        }),
        body: t({
          ka: `თქვენ და ${name} მოეწონეთ ერთმანეთს`,
          en: `You and ${name} liked each other`,
          pl: `Ty i ${name} lubicie się nawzajem`,
        }),
        url: "/messages",
        tag: "new-match",
      };
    case "relationship_connected":
      return {
        title: t({
          ka: "პარტნიორი დაკავშირებულია 💞",
          en: "Partner connected 💞",
          pl: "Partner połączony 💞",
        }),
        body: t({
          ka: `${name}-მ მიიღო შენი ურთიერთობის მოწვევა`,
          en: `${name} accepted your relationship invitation`,
          pl: `${name} przyjmuje Twoje zaproszenie do związku`,
        }),
        url: payload.reminderUrl ?? synastryUrl,
        tag: `relationship-connected-${payload.partnerId ?? "x"}`,
      };
    case "relationship_weekly":
      return {
        title: t({
          ka: "ურთიერთობის ახალი კვირა",
          en: "Your weekly relationship update",
          pl: "Twój tygodniowy przegląd związku",
        }),
        body:
          payload.relationshipHeadline ??
          t({
            ka: "ნახე, რას გთავაზობთ ეს კვირა ორივეს",
            en: "See what this week brings for both of you",
            pl: "Zobacz, co ten tydzień przyniesie Wam obojgu",
          }),
        url: payload.reminderUrl ?? synastryUrl,
        tag: `relationship-weekly-${payload.partnerId ?? "x"}`,
      };
    case "relationship_transit":
      return {
        title: t({
          ka: "ურთიერთობის მნიშვნელოვანი ტრანზიტი",
          en: "Important relationship transit",
          pl: "Ważny tranzyt w Twoim związku",
        }),
        body:
          payload.transitTitle ??
          t({
            ka: "მნიშვნელოვანი მომენტი ახლოვდება",
            en: "A meaningful moment is approaching",
            pl: "Zbliża się ważny moment",
          }),
        url: synastryUrl,
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
      return null; // e.g. "credit", bell-only by design
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
      await sendPushToUser(recipientId, copy);
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
  await sendPushToUser(opts.recipientUserId, {
    title: `💬 ${opts.fromName}`,
    body: opts.body.slice(0, 120),
    url: `/messages?with=${encodeURIComponent(opts.fromUserId)}`,
    tag: `msg-${opts.fromUserId}`,
  });
}
