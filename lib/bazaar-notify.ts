import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  bazaarBookings,
  bazaarProviders,
  bazaarServices,
  notifications,
  users,
} from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import {
  claimReminderDelivery,
  finishReminderDelivery,
} from "@/lib/reminder-delivery";
import {
  sendBazaarBookingPaidEmail,
  sendBazaarReadingDeliveredEmail,
} from "@/lib/email";

const ORDERS_URL = "/readings?view=bookings";

type NotifyContext = {
  bookingId: string;
  serviceTitle: string;
  priceUsdcCents: number;
  providerUserId: string;
  providerDisplayName: string;
  buyerUserId: string;
  buyerName: string | null;
};

async function loadContext(bookingId: string): Promise<NotifyContext | null> {
  const rows = await db
    .select({
      serviceTitle: bazaarServices.title,
      priceUsdcCents: bazaarBookings.priceUsdcCents,
      providerUserId: bazaarProviders.userId,
      providerDisplayName: bazaarProviders.displayName,
      buyerUserId: bazaarBookings.buyerUserId,
    })
    .from(bazaarBookings)
    .innerJoin(bazaarServices, eq(bazaarBookings.serviceId, bazaarServices.id))
    .innerJoin(
      bazaarProviders,
      eq(bazaarBookings.providerId, bazaarProviders.id),
    )
    .where(eq(bazaarBookings.id, bookingId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const [buyer] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, row.buyerUserId))
    .limit(1);
  return { ...row, bookingId, buyerName: buyer?.name ?? null };
}

async function bell(opts: {
  userId: string;
  kind: "booking_paid" | "reading_delivered";
  deliveryKey: string;
  title: string;
  body: string;
}): Promise<void> {
  const claimId = await claimReminderDelivery({
    userId: opts.userId,
    topic: "bazaar",
    channel: "in_app",
    deliveryKey: opts.deliveryKey,
    destination: ORDERS_URL,
  });
  if (!claimId) return; // already notified — exactly once per booking event
  try {
    await db.insert(notifications).values({
      userId: opts.userId,
      kind: opts.kind,
      payload: {
        reminderTitle: opts.title,
        reminderBody: opts.body,
        reminderUrl: ORDERS_URL,
      },
    });
    // Best-effort: cache invalidation must never fail a paid booking's
    // notifications (and throws outside the Next runtime, e.g. scripts).
    try {
      invalidateHeaderForUser(opts.userId);
    } catch {
      /* badge refreshes on next navigation regardless */
    }
    await finishReminderDelivery(claimId, true);
  } catch (error) {
    await finishReminderDelivery(claimId, false);
    throw error;
  }
}

function firstName(name: string | null): string {
  return name?.split(" ")[0] || "Someone";
}

/**
 * Buyer paid → reader gets a bell + email. Fire-and-forget from the
 * verify-payment route: resolves (never rejects) so notification trouble
 * can never fail a paid booking.
 */
export async function notifyBookingPaid(bookingId: string): Promise<void> {
  try {
    const ctx = await loadContext(bookingId);
    if (!ctx) return;
    const buyer = firstName(ctx.buyerName);
    const amount = (ctx.priceUsdcCents / 100).toFixed(2);
    await bell({
      userId: ctx.providerUserId,
      kind: "booking_paid",
      deliveryKey: `booking-paid:${bookingId}`,
      title: "New paid order",
      body: `${buyer} paid ${amount} USDC for ${ctx.serviceTitle}`,
    });
    const emailId = await claimReminderDelivery({
      userId: ctx.providerUserId,
      topic: "bazaar",
      channel: "email",
      deliveryKey: `booking-paid:${bookingId}`,
      destination: ORDERS_URL,
    });
    if (!emailId) return;
    try {
      await sendBazaarBookingPaidEmail({
        recipientUserId: ctx.providerUserId,
        buyerName: buyer,
        serviceTitle: ctx.serviceTitle,
        amountUsdc: amount,
      });
      await finishReminderDelivery(emailId, true);
    } catch (error) {
      await finishReminderDelivery(emailId, false);
      console.warn(
        "[bazaar-notify] paid email failed:",
        (error as Error).message,
      );
    }
  } catch (error) {
    console.warn(
      "[bazaar-notify] booking-paid failed:",
      (error as Error).message,
    );
  }
}

/**
 * Reading delivered → buyer gets a bell + email. Same exactly-once,
 * never-throws contract as notifyBookingPaid.
 */
export async function notifyReadingDelivered(bookingId: string): Promise<void> {
  try {
    const ctx = await loadContext(bookingId);
    if (!ctx) return;
    await bell({
      userId: ctx.buyerUserId,
      kind: "reading_delivered",
      deliveryKey: `reading-delivered:${bookingId}`,
      title: "Your reading is ready",
      body: `${ctx.providerDisplayName} delivered ${ctx.serviceTitle}`,
    });
    const emailId = await claimReminderDelivery({
      userId: ctx.buyerUserId,
      topic: "bazaar",
      channel: "email",
      deliveryKey: `reading-delivered:${bookingId}`,
      destination: ORDERS_URL,
    });
    if (!emailId) return;
    try {
      await sendBazaarReadingDeliveredEmail({
        recipientUserId: ctx.buyerUserId,
        readerName: ctx.providerDisplayName,
        serviceTitle: ctx.serviceTitle,
      });
      await finishReminderDelivery(emailId, true);
    } catch (error) {
      await finishReminderDelivery(emailId, false);
      console.warn(
        "[bazaar-notify] delivered email failed:",
        (error as Error).message,
      );
    }
  } catch (error) {
    console.warn(
      "[bazaar-notify] reading-delivered failed:",
      (error as Error).message,
    );
  }
}
