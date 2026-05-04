import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { createCheckoutUrl, isFlittConfigured } from "@/lib/flitt";
import { PLANS, type IntervalId, type PlanId } from "@/lib/pricing";

/**
 * POST body: { plan: 'pro', interval: 'month' | 'year' }
 * Returns: { checkoutUrl: string }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isFlittConfigured()) {
    return NextResponse.json(
      {
        error: "flitt_not_configured",
        message:
          "Payments are not yet enabled. Set FLITT_MERCHANT_ID and FLITT_SECRET_KEY in .env.local.",
      },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    plan?: PlanId;
    interval?: IntervalId;
  };

  if (body.plan !== "pro") {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }
  if (body.interval !== "month" && body.interval !== "year") {
    return NextResponse.json({ error: "invalid_interval" }, { status: 400 });
  }

  const amountMinor = PLANS.pro.price[body.interval];
  if (amountMinor <= 0) {
    return NextResponse.json({ error: "invalid_price" }, { status: 400 });
  }

  // Persist the pending payment so we can correlate the webhook
  const [payment] = await db
    .insert(payments)
    .values({
      userId: session.user.id,
      flittOrderId: `viv_${session.user.id.slice(0, 8)}_${Date.now()}`,
      amountCents: amountMinor,
      currency: "GEL",
      status: "pending",
      description: `Vivida Pro · ${body.interval === "year" ? "წლიური" : "თვიური"}`,
    })
    .returning();

  const origin = new URL(req.url).origin;

  const result = await createCheckoutUrl({
    orderId: payment.flittOrderId,
    amountMinor,
    currency: "GEL",
    description: payment.description ?? "Vivida Pro",
    email: session.user.email,
    serverCallbackUrl: `${origin}/api/flitt/webhook`,
    responseUrl: `${origin}/billing/success?order=${payment.flittOrderId}`,
    language: "ka",
    recurring: true,
    subscriptionCallbackUrl: `${origin}/api/flitt/webhook`,
  });

  return NextResponse.json({ checkoutUrl: result.checkoutUrl });
}
