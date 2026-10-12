import { after, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { cryptoPurchases } from "@/db/schema";
import {
  confirmCryptoPurchase,
  confirmFiatCryptoPurchase,
  getCryptoPurchase,
  trackCryptoPurchaseCompletedBestEffort,
} from "@/lib/crypto-pay";
import { checkoutTrackingFromRequest } from "@/lib/checkout-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/crypto/checkout/[id], poll a pending purchase.
 *
 * Wallet-method purchases auto-detect by scanning the purchase's reference
 * key; fiat-direct purchases (card paid straight to our wallet) match by
 * time window + tolerance-floored amount once the client reports the fund
 * flow submitted/confirmed. Either way the buyer never pastes anything.
 * Returns:
 *   pending, nothing matched yet (keep polling)
 *   confirmed, verified + granted (idempotent)
 *   problem, a matching payment exists but cannot be credited (underpaid…)
 *   expired, past its window with nothing matched
 */
export async function GET(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const purchase = await getCryptoPurchase(id, userId);
  if (!purchase)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const outcome =
    purchase.method === "fiat"
      ? await confirmFiatCryptoPurchase({ purchase })
      : await confirmCryptoPurchase({ purchase });

  if (outcome.status === "confirmed") {
    if (!outcome.already) {
      const confirmed = outcome.purchase;
      const tracking = checkoutTrackingFromRequest(req);
      after(() =>
        trackCryptoPurchaseCompletedBestEffort({
          purchase: confirmed,
          tracking,
        }),
      );
    }
    return NextResponse.json({
      status: "confirmed",
      kind: outcome.purchase.kind,
      credits: outcome.purchase.credits,
      days: outcome.purchase.days,
      returnTo: outcome.purchase.returnTo,
    });
  }

  if (outcome.status === "failed") {
    if (outcome.reason === "unavailable" || outcome.reason === "not_found") {
      // RPC outage / not-indexed-yet, both resolve on retry; keep polling.
      return NextResponse.json({ status: "pending", warning: outcome.reason });
    }
    return NextResponse.json({
      status: "problem",
      reason: outcome.reason,
      shortfallUsdcCents: outcome.shortfallUsdcCents,
    });
  }

  // Nothing matched yet, lazily expire so the UI can offer a fresh order.
  if (purchase.expiresAt.getTime() < Date.now()) {
    await db
      .update(cryptoPurchases)
      .set({ status: "expired", updatedAt: new Date() })
      .where(
        and(
          eq(cryptoPurchases.id, purchase.id),
          eq(cryptoPurchases.status, "pending"),
        ),
      );
    return NextResponse.json({ status: "expired" });
  }
  return NextResponse.json({ status: "pending" });
}
