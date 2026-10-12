import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarServices } from "@/db/schema";
import { getOwnedService, getPublicService } from "@/lib/bazaar";
import { validateServiceInput } from "@/lib/bazaar-pure";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/bazaar/services/[id], public service detail + provider wallet. */
export async function GET(_req: Request, ctx: Params) {
  const { id } = await ctx.params;
  const service = await getPublicService(id);
  if (!service) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ service });
}

/**
 * PATCH /api/bazaar/services/[id], the owning reader edits their service.
 * Partial body; provided fields re-validate against the same rules as
 * creation. `status` toggles active/paused. Price edits never rewrite past
 * bookings (each booking snapshots its price).
 */
export async function PATCH(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const owned = await getOwnedService(id, userId);
  if (!owned) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    await enforceRateLimit({
      bucket: "bazaar_service_edit",
      identifier: `${userId}:${id}`,
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    title?: unknown;
    description?: unknown;
    category?: unknown;
    priceUsdcCents?: unknown;
    deliveryPromise?: unknown;
    status?: unknown;
  } | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const merged = {
    title: body.title ?? owned.service.title,
    description: body.description ?? owned.service.description,
    category: body.category ?? owned.service.category,
    priceUsdcCents: body.priceUsdcCents ?? owned.service.priceUsdcCents,
    deliveryPromise: body.deliveryPromise ?? owned.service.deliveryPromise,
  };
  const parsed = validateServiceInput(merged);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  let status = owned.service.status;
  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "paused") {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    status = body.status;
  }

  await db
    .update(bazaarServices)
    .set({
      title: parsed.value.title,
      description: parsed.value.description,
      category: parsed.value.category,
      priceUsdcCents: parsed.value.priceUsdcCents,
      deliveryPromise: parsed.value.deliveryPromise,
      status,
      updatedAt: new Date(),
    })
    .where(eq(bazaarServices.id, owned.service.id));
  return NextResponse.json({ ok: true, status });
}
