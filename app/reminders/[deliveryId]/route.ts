import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { reminderDeliveries } from "@/db/schema";
import { normalizeReturnPath } from "@/lib/safe-return-path";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deliveryId: string }> },
) {
  const { deliveryId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    const next = `/reminders/${encodeURIComponent(deliveryId)}`;
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url));
  }

  const [delivery] = await db.select({ destination: reminderDeliveries.destination })
    .from(reminderDeliveries)
    .where(and(
      eq(reminderDeliveries.id, deliveryId),
      eq(reminderDeliveries.userId, session.user.id),
    ))
    .limit(1);
  if (!delivery) return NextResponse.redirect(new URL("/dashboard", request.url));

  await db.update(reminderDeliveries).set({ valueCompletedAt: new Date() }).where(and(
    eq(reminderDeliveries.id, deliveryId),
    eq(reminderDeliveries.userId, session.user.id),
  ));
  return NextResponse.redirect(new URL(normalizeReturnPath(delivery.destination), request.url));
}
