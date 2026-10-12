import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { listMessages } from "@/lib/messages";

/**
 * GET /api/messages?with={userId}&since={iso}
 * Returns messages between viewer and partner. `since` filters to only
 * messages newer than the given timestamp, used by the active chat
 * window for incremental polling.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("with");
  if (!partnerId) {
    return NextResponse.json({ error: "missing_partner" }, { status: 400 });
  }
  const sinceParam = searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : undefined;
  if (since && Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: "bad_since" }, { status: 400 });
  }

  const items = await listMessages(session.user.id, partnerId, {
    since,
    limit: 100,
  });

  return NextResponse.json({ messages: items });
}
