import { NextResponse } from "next/server";

import { getPublicProvider } from "@/lib/bazaar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/bazaar/providers/[id], public reader profile + reviews. */
export async function GET(_req: Request, ctx: Params) {
  const { id } = await ctx.params;
  const provider = await getPublicProvider(id);
  if (!provider) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ provider });
}
