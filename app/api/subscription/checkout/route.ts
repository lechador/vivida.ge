import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Subscriptions are discontinued — Vivida is credit-based now. Kept as a 410
 * stub so any stale client that still calls it fails cleanly (existing paid
 * subscriptions continue to resolve and can be cancelled via the Stripe portal
 * / webhook). New purchases go through /api/credits/checkout.
 */
export async function POST() {
  return NextResponse.json({ error: "discontinued" }, { status: 410 });
}
