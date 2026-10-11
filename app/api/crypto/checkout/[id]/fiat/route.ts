import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { cryptoPurchases } from "@/db/schema";
import { getCryptoPurchase } from "@/lib/crypto-pay";
import { enforceRateLimit } from "@/lib/rate-limit";
import { and, eq, isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/crypto/checkout/[id]/fiat { depositStatus }
 *
 * The client calls this when Privy's fund modal reports `submitted` or
 * `confirmed` for a fiat-direct purchase (card paid straight to the
 * platform wallet — the buyer never touches crypto, and the modal returns
 * no transaction proof). It stamps `fiatConfirmedAt`, which is the moment
 * the status poll starts window-scanning for the incoming USDC transfer.
 * Idempotent: repeat calls are a harmless no-op.
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
  if (purchase.method !== "fiat") {
    return NextResponse.json({ error: "wrong_method" }, { status: 400 });
  }
  if (purchase.status !== "pending") {
    return NextResponse.json({ error: "not_pending" }, { status: 409 });
  }

  try {
    await enforceRateLimit({
      bucket: "crypto_fiat_notify",
      identifier: `${userId}:${id}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    depositStatus?: unknown;
  } | null;
  if (
    body?.depositStatus !== "submitted" &&
    body?.depositStatus !== "confirmed"
  ) {
    return NextResponse.json({ error: "bad_status" }, { status: 400 });
  }

  await db
    .update(cryptoPurchases)
    .set({ fiatConfirmedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(cryptoPurchases.id, purchase.id),
        isNull(cryptoPurchases.fiatConfirmedAt),
      ),
    );

  return NextResponse.json({ status: "watching" });
}
