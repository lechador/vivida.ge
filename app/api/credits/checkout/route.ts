import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { CREDIT_PACKS } from "@/lib/credits";
import { createCreditCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { localeForHost } from "@/lib/i18n/request-locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/credits/checkout { packId } → Stripe Checkout URL for a credit
 * top-up. The webhook awards the credits on completion.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as { packId?: unknown };
  const pack = CREDIT_PACKS.find((p) => p.id === body.packId);
  if (!pack) return NextResponse.json({ error: "bad_pack" }, { status: 400 });

  const origin = new URL(req.url).origin;
  const locale = localeForHost(
    req.headers.get("x-forwarded-host") ?? new URL(req.url).host,
  );
  try {
    const checkout = await createCreditCheckoutSession({
      userId,
      email: session.user?.email ?? null,
      origin,
      credits: pack.credits,
      tetri: pack.tetri,
      gel: pack.gel,
      locale,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[credits/checkout] failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
