import { auth } from "@/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Save (or refresh) a browser's push subscription for the current user. */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  };
  const sub = body.subscription;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const authKey = sub?.keys?.auth;
  if (
    typeof endpoint !== "string" ||
    typeof p256dh !== "string" ||
    typeof authKey !== "string"
  ) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;

  // Endpoint is unique, reclaim it for this user + refresh keys if it moved.
  await db
    .insert(pushSubscriptions)
    .values({ userId, endpoint, p256dh, auth: authKey, userAgent })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId, p256dh, auth: authKey, userAgent },
    });

  return Response.json({ ok: true });
}
