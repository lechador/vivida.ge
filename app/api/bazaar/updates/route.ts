import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/bazaar/updates → { bazaarUpdates } — the viewer's marketplace
 * email preference (paid-order / reading-delivered mail, default ON).
 * POST /api/bazaar/updates { enabled } flips it. Bell notifications are
 * unaffected — this toggle is email-only.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [row] = await db
    .select({ bazaarUpdates: users.bazaarUpdates })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return NextResponse.json({ bazaarUpdates: row?.bazaarUpdates ?? true });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    enabled?: unknown;
  } | null;
  if (typeof body?.enabled !== "boolean") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  await db
    .update(users)
    .set({ bazaarUpdates: body.enabled })
    .where(eq(users.id, userId));
  return NextResponse.json({ ok: true, bazaarUpdates: body.enabled });
}
