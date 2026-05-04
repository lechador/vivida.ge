import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  notifications,
  type Notification,
} from "@/db/schema";

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
