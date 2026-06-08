"use server";

import { requireUser } from "@/lib/auth-helpers";
import {
  dismissNotificationCore,
  markAllNotificationsReadCore,
} from "@/lib/notifications";

/** Mark all unread notifications for the current user as read. */
export async function markAllNotificationsRead(): Promise<{ ok: true }> {
  const user = await requireUser();
  return markAllNotificationsReadCore(user.id);
}

/** Delete a single notification (e.g. user dismissed it). */
export async function dismissNotification(
  id: string
): Promise<{ ok: true }> {
  const user = await requireUser();
  return dismissNotificationCore(user.id, id);
}
