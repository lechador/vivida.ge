import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  notifications,
  type Notification,
} from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";

export type NotificationView = Notification;

/** Most recent notifications for a user. Capped to keep the dropdown lean. */
export async function listRecentNotifications(
  userId: string,
  limit = 15
): Promise<NotificationView[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/** Count of unread notifications — used for the bell badge. */
export async function countUnreadNotifications(
  userId: string
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        isNull(notifications.readAt)
      )
    );
  return Number(row?.value ?? 0);
}

/**
 * Mark all of a user's unread notifications as read. Framework-agnostic —
 * shared by the website's Server Action and the mobile API. Invalidates the
 * in-memory header cache so the bell badge refreshes.
 */
export async function markAllNotificationsReadCore(
  userId: string
): Promise<{ ok: true }> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt))
    );
  invalidateHeaderForUser(userId);
  return { ok: true };
}

/** Delete a single notification, scoped to the owner. */
export async function dismissNotificationCore(
  userId: string,
  id: string
): Promise<{ ok: true }> {
  await db
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  invalidateHeaderForUser(userId);
  return { ok: true };
}
