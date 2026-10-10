import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarServices } from "@/db/schema";
import { getProviderByUser, listActiveServices } from "@/lib/bazaar";
import { validateServiceInput } from "@/lib/bazaar-pure";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/bazaar/services — public marketplace listing (approved only). */
export async function GET() {
  const services = await listActiveServices();
  return NextResponse.json({ services });
}

/**
 * POST /api/bazaar/services — an APPROVED provider lists a new service.
 * Providers apply via /api/bazaar/apply; admin approves via the admin API.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "bazaar_service_create",
      identifier: userId,
      limit: 10,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const provider = await getProviderByUser(userId);
  if (!provider || provider.status !== "approved") {
    return NextResponse.json(
      { error: "provider_not_approved" },
      { status: 403 },
    );
  }

  const parsed = validateServiceInput(await req.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const [service] = await db
    .insert(bazaarServices)
    .values({
      providerId: provider.id,
      title: parsed.value.title,
      description: parsed.value.description,
      category: parsed.value.category,
      priceUsdcCents: parsed.value.priceUsdcCents,
      deliveryPromise: parsed.value.deliveryPromise,
      status: "active",
    })
    .returning({ id: bazaarServices.id });
  return NextResponse.json({ ok: true, id: service.id }, { status: 201 });
}
