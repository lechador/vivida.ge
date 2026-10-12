import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { USDC_PREMIUM_PASS } from "@/lib/crypto-config";
import {
  createPendingCryptoPurchase,
  isCryptoPayConfigured,
} from "@/lib/crypto-pay";
import { getPremiumSubscription, statusHasPremiumAccess } from "@/lib/premium";
import { enforceRateLimit } from "@/lib/rate-limit";
import { normalizeReturnPath } from "@/lib/safe-return-path";
import { requestHostIsEnglish } from "@/lib/i18n/request-locale";
import { buildSolanaPayUrl } from "@/lib/usdc-pure";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/crypto/checkout { packId, method? } | { kind: "premium_pass", method? }
 *
 * Creates a pending USDC purchase on Solana for the English site and returns
 * everything the payment UI needs: the snapshotted recipient, the per-order
 * reference, and the Solana Pay URL (QR / deep link).
 *
 * `method: "fiat"` marks a card-direct purchase: the buyer pays by card in
 * Privy's fund modal with `destination.wallet` set to the snapshotted
 * recipient, so USDC lands in OUR wallet and the buyer never touches crypto.
 * The reference/URL are still returned (harmless) but unused; verification
 * matches by time window + tolerance-floored amount instead. The Georgian
 * site keeps Stripe, this route refuses non-English hosts.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isCryptoPayConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  if (!requestHostIsEnglish(req)) {
    return NextResponse.json({ error: "english_host_only" }, { status: 403 });
  }

  try {
    await enforceRateLimit({
      bucket: "crypto_checkout_create",
      identifier: userId,
      limit: 15,
      windowMs: 10 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    packId?: unknown;
    kind?: unknown;
    method?: unknown;
    returnTo?: unknown;
    product?: unknown;
  };
  const kind = body.kind === "premium_pass" ? "premium_pass" : "credits";
  const method = body.method === "fiat" ? "fiat" : "wallet";
  const returnTo =
    typeof body.returnTo === "string"
      ? normalizeReturnPath(body.returnTo)
      : null;
  const product =
    typeof body.product === "string" && /^[a-z0-9_-]{1,60}$/i.test(body.product)
      ? body.product
      : null;

  if (kind === "premium_pass") {
    // One PRO row per user: a processor-billed, still-entitled subscription
    // cannot be overwritten by a pass, holders manage what they have.
    const sub = await getPremiumSubscription(userId);
    if (sub && statusHasPremiumAccess(sub.status)) {
      return NextResponse.json({ alreadyPremium: true });
    }
  }

  try {
    const purchase = await createPendingCryptoPurchase({
      userId,
      kind,
      method,
      packId: body.packId,
      product,
      returnTo,
    });
    const solanaPayUrl = buildSolanaPayUrl({
      recipient: purchase.recipientWallet,
      priceUsdcCents: purchase.amountUsdcCents,
      label: "Vivida",
      message:
        purchase.kind === "credits"
          ? `${purchase.credits} Vivida credits`
          : "Vivida PRO, 30-day pass",
      reference: purchase.reference,
    });
    return NextResponse.json({
      id: purchase.id,
      kind: purchase.kind,
      method: purchase.method,
      credits: purchase.credits,
      days: purchase.days,
      amountUsdcCents: purchase.amountUsdcCents,
      currency: "USDC",
      recipient: purchase.recipientWallet,
      reference: purchase.reference,
      solanaPayUrl,
      expiresAt: purchase.expiresAt.toISOString(),
      value: purchase.amountUsdcCents / 100,
      contentId:
        purchase.kind === "credits"
          ? `credits_${purchase.credits}`
          : USDC_PREMIUM_PASS.key,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "bad_pack") {
      return NextResponse.json({ error: "bad_pack" }, { status: 400 });
    }
    console.error("[crypto/checkout] failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
