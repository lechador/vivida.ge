import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  bazaarBookings,
  bazaarProviders,
  bazaarReviews,
  bazaarServices,
} from "@/db/schema";
import { refreshProviderRating } from "@/lib/bazaar";
import { isAdminEmail } from "@/lib/admin-auth";
import { isValidSolanaAddress } from "@/lib/bazaar-pure";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/bazaar/approve, full operator control over the Bazaar.
 * Consumed by the separate vivida-admin app (x-admin-token) and by founder
 * sessions (admin email).
 *
 * { providerId, action: "approve" | "suspend" }
 * { providerId, action: "pause_services" | "unpause_services" }
 * { providerId, action: "update_wallet", wallet }
 * { serviceId, action: "pause_service" | "unpause_service" }
 * { bookingId, action: "cancel_booking" }
 * { reviewId, action: "delete_review" }
 */
export async function POST(req: Request) {
  const session = await auth();
  const sharedToken = process.env.ADMIN_API_TOKEN;
  const panelAuthorized = Boolean(
    sharedToken && req.headers.get("x-admin-token") === sharedToken,
  );
  if (!panelAuthorized && !isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    providerId?: unknown;
    serviceId?: unknown;
    bookingId?: unknown;
    reviewId?: unknown;
    wallet?: unknown;
    action?: unknown;
  } | null;
  const action = body?.action;
  if (typeof action !== "string") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  if (action === "approve" || action === "suspend") {
    if (typeof body?.providerId !== "string" || !body.providerId) {
      return NextResponse.json({ error: "missing_provider" }, { status: 400 });
    }
    const status = action === "approve" ? "approved" : "suspended";
    await db
      .update(bazaarProviders)
      .set({ status, updatedAt: new Date() })
      .where(eq(bazaarProviders.id, body.providerId));
    if (status === "suspended") {
      await db
        .update(bazaarServices)
        .set({ status: "paused", updatedAt: new Date() })
        .where(eq(bazaarServices.providerId, body.providerId));
    }
    return NextResponse.json({ ok: true, status });
  }

  if (action === "pause_services" || action === "unpause_services") {
    if (typeof body?.providerId !== "string" || !body.providerId) {
      return NextResponse.json({ error: "missing_provider" }, { status: 400 });
    }
    const status = action === "pause_services" ? "paused" : "active";
    await db
      .update(bazaarServices)
      .set({ status, updatedAt: new Date() })
      .where(eq(bazaarServices.providerId, body.providerId));
    return NextResponse.json({ ok: true, services: status });
  }

  if (action === "pause_service" || action === "unpause_service") {
    if (typeof body?.serviceId !== "string" || !body.serviceId) {
      return NextResponse.json({ error: "missing_service" }, { status: 400 });
    }
    const status = action === "pause_service" ? "paused" : "active";
    await db
      .update(bazaarServices)
      .set({ status, updatedAt: new Date() })
      .where(eq(bazaarServices.id, body.serviceId));
    return NextResponse.json({ ok: true, status });
  }

  if (action === "update_wallet") {
    if (typeof body?.providerId !== "string" || !body.providerId) {
      return NextResponse.json({ error: "missing_provider" }, { status: 400 });
    }
    const wallet = typeof body?.wallet === "string" ? body.wallet.trim() : "";
    if (!isValidSolanaAddress(wallet)) {
      return NextResponse.json(
        { error: "invalid_solana_wallet" },
        { status: 400 },
      );
    }
    await db
      .update(bazaarProviders)
      .set({ solanaWallet: wallet, updatedAt: new Date() })
      .where(eq(bazaarProviders.id, body.providerId));
    return NextResponse.json({ ok: true });
  }

  if (action === "cancel_booking") {
    if (typeof body?.bookingId !== "string" || !body.bookingId) {
      return NextResponse.json({ error: "missing_booking" }, { status: 400 });
    }
    const rows = await db
      .select({ status: bazaarBookings.status })
      .from(bazaarBookings)
      .where(eq(bazaarBookings.id, body.bookingId))
      .limit(1);
    if (!rows[0]) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (rows[0].status === "delivered") {
      return NextResponse.json({ error: "cancel_closed" }, { status: 409 });
    }
    await db
      .update(bazaarBookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bazaarBookings.id, body.bookingId));
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  if (action === "delete_review") {
    if (typeof body?.reviewId !== "string" || !body.reviewId) {
      return NextResponse.json({ error: "missing_review" }, { status: 400 });
    }
    const rows = await db
      .select({ providerId: bazaarReviews.providerId })
      .from(bazaarReviews)
      .where(eq(bazaarReviews.id, body.reviewId))
      .limit(1);
    if (!rows[0]) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    await db.delete(bazaarReviews).where(eq(bazaarReviews.id, body.reviewId));
    await refreshProviderRating(rows[0].providerId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 });
}
