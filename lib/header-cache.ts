import { unstable_cache, revalidateTag } from "next/cache";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profilePhotos, profiles, users } from "@/db/schema";
import { countUnreadMessages } from "@/lib/messages";
import {
  countUnreadNotifications,
  listRecentNotifications,
  type NotificationView,
} from "@/lib/notifications";
import { countPendingAskNudges } from "@/lib/ask-nudges";

export type HeaderData = {
  username: string | null;
  notifications: NotificationView[];
  unread: number;
  /** First ready profile photo (sortOrder=0). Overrides the OAuth
   *  avatar so users see their chosen "main" photo in the navbar. */
  avatarUrl: string | null;
  /** Unread chat messages — drives the bottom-bar messages tab badge. */
  unreadMessages: number;
  /** Unopened proactive astrologer nudges — dot on the ask tab. */
  pendingAskNudges: number;
  isPremium: boolean;
  residenceCountryCode: string | null;
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
      const [
        profileRow,
        notifications,
        unread,
        avatarRow,
        unreadMessages,
        userRow,
        pendingAskNudges,
      ] = await Promise.all([
        db
          .select({ username: profiles.username })
          .from(profiles)
          .where(eq(profiles.userId, userId))
          .limit(1),
        listRecentNotifications(userId),
        countUnreadNotifications(userId),
        db
          .select({ url: profilePhotos.url })
          .from(profilePhotos)
          .where(
            and(
              eq(profilePhotos.userId, userId),
              eq(profilePhotos.ready, true),
            ),
          )
          .orderBy(asc(profilePhotos.sortOrder))
          .limit(1),
        countUnreadMessages(userId),
        db
          .select({
            isPremium: users.isPremium,
            premiumUntil: users.premiumUntil,
            residenceCountryCode: users.residenceCountryCode,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1),
        countPendingAskNudges(userId),
      ]);
      const premiumUntil = userRow[0]?.premiumUntil;
      return {
        username: profileRow[0]?.username ?? null,
        notifications,
        unread,
        avatarUrl: avatarRow[0]?.url ?? null,
        unreadMessages,
        pendingAskNudges,
        isPremium: Boolean(
          userRow[0]?.isPremium &&
          premiumUntil &&
          premiumUntil.getTime() > Date.now(),
        ),
        residenceCountryCode: userRow[0]?.residenceCountryCode ?? null,
      };
    },
    ["header-data", userId],
    {
      revalidate: 30,
      tags: [`header:${userId}`, `profile:${userId}`],
    },
  )();
}

/**
 * Bust the header cache after a notification is created, dismissed, or
 * marked read. Uses `revalidateTag` rather than `updateTag` because Next
 * 16's `updateTag` only works inside Server Actions; this helper is also
 * called from Route Handlers (the photo upload / promote / delete
 * endpoints). The "max" profile gives stale-while-revalidate semantics
 * — the next page that reads the tag serves the cached value while the
 * fresh one regenerates in the background, which is exactly what we
 * want for a 30s-cached header strip.
 */
export function invalidateHeaderForUser(userId: string) {
  revalidateTag(`header:${userId}`, "max");
}

/** Bust the profile portion (username) when the user updates it. */
export function invalidateProfileForUser(userId: string) {
  revalidateTag(`profile:${userId}`, "max");
}
