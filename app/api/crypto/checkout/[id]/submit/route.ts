import { after, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  confirmCryptoPurchase,
  getCryptoPurchase,
  trackCryptoPurchaseCompletedBestEffort,
} from "@/lib/crypto-pay";
import { checkoutTrackingFromRequest } from "@/lib/checkout-tracking";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/crypto/checkout/[id]/submit { signature }
 *
 * Explicit verification for a signature the buyer's wallet just returned (or
 * they pasted). The server confirms a finalized USDC credit to the
 * snapshotted recipient for at least the snapshotted price, in a transaction
 * carrying this purchase's reference account, then grants exactly once.
 *
 * Status mapping matches the bazaar's verify route: 202/503 keep the client
 * retrying (not indexed yet / RPC outage); 409 = the signature funds another
 * purchase; 402 = the payment itself is the problem.
 */
export async function POST(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const purchase = await getCryptoPurchase(id, userId);
  if (!purchase)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    await enforceRateLimit({
      bucket: "crypto_verify_submit",
      identifier: `${userId}:${id}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    signature?: unknown;
  } | null;
  const signature =
    typeof body?.signature === "string" ? body.signature.trim() : "";
  if (!signature) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const outcome = await confirmCryptoPurchase({ purchase, signature });

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
      already: outcome.already,
      kind: outcome.purchase.kind,
      credits: outcome.purchase.credits,
      days: outcome.purchase.days,
      returnTo: outcome.purchase.returnTo,
    });
  }

  if (outcome.status === "pending") {
    // Auto-detect-only path; an explicit submit always carries a signature,
    // so this is just defensive.
    return NextResponse.json({ status: "pending" }, { status: 202 });
  }

  const status =
    outcome.reason === "bad_signature"
      ? 400
      : outcome.reason === "not_found"
        ? 202
        : outcome.reason === "unavailable"
          ? 503
          : outcome.reason === "already_used"
            ? 409
            : 402;
  return NextResponse.json(
    {
      ok: false,
      reason: outcome.reason,
      shortfallUsdcCents: outcome.shortfallUsdcCents,
    },
    { status },
  );
}
