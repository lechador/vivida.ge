import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarProviders } from "@/db/schema";
import { getProviderByUser } from "@/lib/bazaar";
import { validateProviderInput } from "@/lib/bazaar-pure";
import { enforceRateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bazaar/apply, signed-in user applies (or re-submits) as a
 * reader. Always lands in `pending`; only the admin API can approve.
 * Re-applying after approval keeps the approved status but updates the
 * profile copy and wallet.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "bazaar_apply",
      identifier: userId,
      limit: 5,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = validateProviderInput(await req.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const existing = await getProviderByUser(userId);
  if (existing) {
    await db
      .update(bazaarProviders)
      .set({
        displayName: parsed.value.displayName,
        headline: parsed.value.headline,
        bio: parsed.value.bio,
        specialties: parsed.value.specialties.join(","),
        solanaWallet: parsed.value.solanaWallet,
        // Suspended readers stay suspended; approved stay live; pending
        // re-enters the queue. Status never self-escalates.
        status: existing.status === "suspended" ? "suspended" : existing.status,
        updatedAt: new Date(),
      })
      .where(eq(bazaarProviders.id, existing.id));
    return NextResponse.json({
      ok: true,
      id: existing.id,
      status: existing.status,
    });
  }

  const [row] = await db
    .insert(bazaarProviders)
    .values({
      userId,
      displayName: parsed.value.displayName,
      headline: parsed.value.headline,
      bio: parsed.value.bio,
      specialties: parsed.value.specialties.join(","),
      solanaWallet: parsed.value.solanaWallet,
      status: "pending",
    })
    .returning({ id: bazaarProviders.id });
  return NextResponse.json(
    { ok: true, id: row.id, status: "pending" },
    { status: 201 },
  );
}
