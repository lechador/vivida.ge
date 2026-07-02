/**
 * Web Push sender. Wraps the `web-push` library with our VAPID config and a
 * self-healing send that prunes dead subscriptions (HTTP 404/410). Presence
 * of a `push_subscription` row means the user opted into notifications.
 */

import webpush from "web-push";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { pushSubscriptions, dailyHoroscopes } from "@/db/schema";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@vivida.ge";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  );
}

export type PushPayload = {
  title: string;
  body: string;
  /** Path to open on click, e.g. "/dashboard". */
  url?: string;
  /** Collapse key so repeated daily pushes replace rather than stack. */
  tag?: string;
};

type SubRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

async function sendToSubs(
  subs: SubRow[],
  payload: PushPayload
): Promise<number> {
  const data = JSON.stringify(payload);
  const expired: string[] = [];
  let ok = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          data,
          { TTL: 12 * 60 * 60 }
        );
        ok++;
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        // 404 gone / 410 expired → the endpoint is dead; drop it.
        if (code === 404 || code === 410) expired.push(s.id);
      }
    })
  );
  if (expired.length) {
    await db
      .delete(pushSubscriptions)
      .where(inArray(pushSubscriptions.id, expired));
  }
  return ok;
}

/** Send a push to every device a user has subscribed. Returns # delivered. */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<number> {
  if (!ensureConfigured()) return 0;
  const subs = await db
    .select({
      id: pushSubscriptions.id,
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
  if (subs.length === 0) return 0;
  return sendToSubs(subs, payload);
}

const GENERIC_BODY = "შენი დღევანდელი ჰოროსკოპი მზადაა — გახსენი და ნახე ✨";

/**
 * Daily push blast. One notification per subscribed user, using today's
 * personalized headline when it's already generated (the email blast on the
 * same cron generates them), otherwise a generic nudge. Deep-links to the
 * dashboard.
 */
export async function sendDailyPushBlast(opts: {
  sendDate: string;
}): Promise<{ recipients: number; sent: number }> {
  if (!ensureConfigured()) return { recipients: 0, sent: 0 };

  const users = await db
    .selectDistinct({ userId: pushSubscriptions.userId })
    .from(pushSubscriptions);

  let sent = 0;
  for (const { userId } of users) {
    const [h] = await db
      .select({ headline: dailyHoroscopes.headline })
      .from(dailyHoroscopes)
      .where(
        and(
          eq(dailyHoroscopes.userId, userId),
          eq(dailyHoroscopes.date, opts.sendDate)
        )
      )
      .limit(1);
    sent += await sendPushToUser(userId, {
      title: "Vivida ✨",
      body: h?.headline ?? GENERIC_BODY,
      url: "/dashboard",
      tag: `daily-${opts.sendDate}`,
    });
  }
  return { recipients: users.length, sent };
}
