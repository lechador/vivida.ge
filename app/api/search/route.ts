import { NextResponse } from "next/server";

import { searchPages, searchPublicUsers } from "@/lib/search/site-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=, site-wide search for the public homepage. Returns
 * matching pages (from the static catalog, instant, no DB) plus public
 * profiles (discoverable users only). Short/empty queries return nothing.
 */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 60);
  if (q.trim().length < 2) {
    return NextResponse.json({ pages: [], users: [] });
  }

  const pages = searchPages(q, 8).map((p) => ({
    title: p.title,
    sub: p.sub,
    url: p.url,
    category: p.category,
    icon: p.icon ?? null,
  }));

  // User search hits the DB; degrade gracefully so a DB blip never breaks the
  // (already-useful) page results.
  let usersHits: Awaited<ReturnType<typeof searchPublicUsers>> = [];
  try {
    usersHits = await searchPublicUsers(q, 5);
  } catch (err) {
    console.warn("[api/search] user search failed:", (err as Error).message);
  }

  return NextResponse.json(
    { pages, users: usersHits },
    {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
