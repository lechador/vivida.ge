import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export type NativePushCategory =
  | "messages"
  | "horoscope"
  | "comments"
  | "reactions";

export type NativePushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type NativePreferences = {
  enabled: boolean;
  messages: boolean;
  horoscope: boolean;
  comments: boolean;
  reactions: boolean;
};

export function isNativePushConfigured(): boolean {
  return Boolean(process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_API_KEY);
}

export async function nativePushPreferences(
  userId: string,
): Promise<NativePreferences | null> {
  const [row] = await db
    .select({
      enabled: users.pushEnabled,
      messages: users.pushMessages,
      horoscope: users.pushHoroscope,
      comments: users.pushComments,
      reactions: users.pushReactions,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

export function categoryAllowed(
  preferences: NativePreferences | null,
  category?: NativePushCategory,
): boolean {
  if (!preferences?.enabled) return false;
  return category ? preferences[category] : true;
}

/**
 * Send to every iOS/Android subscription OneSignal has associated with the
 * authenticated Vivida user. The app calls OneSignal.login(userId), so the
 * database user id is also the provider's external_id alias.
 */
export async function sendNativePushToUser(
  userId: string,
  payload: NativePushPayload,
  category?: NativePushCategory,
): Promise<number> {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;
  if (!appId || !apiKey) return 0;

  const preferences = await nativePushPreferences(userId);
  if (!categoryAllowed(preferences, category)) return 0;

  const response = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      app_id: appId,
      target_channel: "push",
      include_aliases: { external_id: [userId] },
      headings: { en: payload.title },
      contents: { en: payload.body || "Vivida" },
      data: {
        url: payload.url ?? "/home",
        tag: payload.tag ?? "vivida",
      },
      ...(payload.tag
        ? { android_group: payload.tag, thread_id: payload.tag }
        : {}),
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`OneSignal ${response.status}: ${detail}`);
  }
  const result = (await response.json()) as { recipients?: number };
  return result.recipients ?? 0;
}
