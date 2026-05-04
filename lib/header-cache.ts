import { unstable_cache, updateTag } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import {
  countUnreadNotifications,
  listRecentNotifications,
  type NotificationView,
} from "@/lib/notifications";

export type HeaderData = {
  username: string | null;
  notifications: NotificationView[];
  unread: number;
};

/**
 * AppHeader runs on every authed page render — three DB calls (profile,
 * recent notifications, unread count). We combine them and cache for 30s
 * keyed by userId so navigation between pages doesn't re-hit Neon.
 *
 * Tags:
 *  - `header:${userId}` — busted when a notification arrives or is read
 *  - `profile:${userId}` — busted when the user changes username
 */
export async function getHeaderData(userId: string): Promise<HeaderData> {
  return unstable_cache(
    async () => {
      const [profileRow, notifications, unread] = await Promise.all([
        db
          .select({ username: profiles.username })
          .from(profiles)
          .where(eq(profiles.userId, userId))
          .limit(1),
        listRecentNotifications(userId),
        countUnreadNotifications(userId),
      ]);
      return {
        username: profileRow[0]?.username ?? null,
        notifications,
        unread,
      };
    },
    ["header-data", userId],
    {
      revalidate: 30,
      tags: [`header:${userId}`, `profile:${userId}`],
    }
  )();
}

/**
 * Bust the header cache after a notification is created, dismissed, or
 * marked read. Call from a Server Action — `updateTag` is the Next 16 API
 * for read-your-own-writes (immediate, blocks next read for fresh data).
 */
export function invalidateHeaderForUser(userId: string) {
  updateTag(`header:${userId}`);
}

/** Bust the profile portion (username) when the user updates it. */
export function invalidateProfileForUser(userId: string) {
  updateTag(`profile:${userId}`);
}
