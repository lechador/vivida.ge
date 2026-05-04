"use server";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { invalidateHeaderForUser } from "@/lib/header-cache";

/** Mark all unread notifications for the current user as read. */
export async function markAllNotificationsRead(): Promise<{ ok: true }> {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, user.id),
        isNull(notifications.readAt)
      )
    );
  invalidateHeaderForUser(user.id);
  return { ok: true };
}

/** Delete a single notification (e.g. user dismissed it). */
export async function dismissNotification(
  id: string
): Promise<{ ok: true }> {
  const user = await requireUser();
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, user.id)
      )
    );
  invalidateHeaderForUser(user.id);
  return { ok: true };
}
