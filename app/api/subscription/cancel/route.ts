import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateSubscriptionCancellation } from "@/lib/premium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { cancel?: unknown };
  if (typeof body.cancel !== "boolean") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const subscription = await updateSubscriptionCancellation(userId, body.cancel);
    if (!subscription) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (err) {
    console.error("[subscription/cancel] failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
