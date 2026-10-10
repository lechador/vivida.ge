import { NextResponse } from "next/server";

import { getPublicService } from "@/lib/bazaar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/bazaar/services/[id] — public service detail + provider wallet. */
export async function GET(_req: Request, ctx: Params) {
  const { id } = await ctx.params;
  const service = await getPublicService(id);
  if (!service) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ service });
}
