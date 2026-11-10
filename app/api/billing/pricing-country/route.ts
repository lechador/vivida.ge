import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getBillingIdentity } from "@/lib/premium";
import { pricingCountryForRequest } from "@/lib/pricing-country";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET → the market this request is priced in. Same helper the checkout routes
 * use, so client-rendered price labels (paywalls) match what is charged.
 */
export async function GET(req: Request) {
  const session = await auth();
  const identity = session?.user?.id
    ? await getBillingIdentity(session.user.id)
    : null;
  return NextResponse.json(
    { country: pricingCountryForRequest(req.headers, identity) },
    { headers: { "cache-control": "private, no-store" } },
  );
}
