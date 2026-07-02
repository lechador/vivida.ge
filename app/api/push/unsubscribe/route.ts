import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Remove a browser's push subscription for the current user. */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (typeof body.endpoint !== "string") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, body.endpoint)
      )
    );

  return Response.json({ ok: true });
}
