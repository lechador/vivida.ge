import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { reminderDeliveries } from "@/db/schema";

export async function claimReminderDelivery(input: {
  userId: string;
  topic: string;
  channel: string;
  deliveryKey: string;
  destination: string;
}): Promise<string | null> {
  const [row] = await db.insert(reminderDeliveries).values(input)
    .onConflictDoNothing().returning({ id: reminderDeliveries.id });
  return row?.id ?? null;
}

export async function finishReminderDelivery(id: string, sent: boolean): Promise<void> {
  await db.update(reminderDeliveries).set(sent
    ? { status: "sent", sentAt: new Date() }
    : { status: "failed", failedAt: new Date() }
  ).where(eq(reminderDeliveries.id, id));
}

export function trackedReminderPath(id: string): string {
  return `/reminders/${encodeURIComponent(id)}`;
}

