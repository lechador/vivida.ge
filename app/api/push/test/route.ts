import { auth } from "@/auth";
import { sendPushToUser, isPushConfigured } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Send a test push to the current user's devices (used by the opt-in UI). */
export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!isPushConfigured()) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const sent = await sendPushToUser(
    userId,
    {
      title: "Vivida ✨",
      body: "შეტყობინებები ჩართულია, აქ მიიღებ დღიურ ჰოროსკოპს.",
      url: "/dashboard",
      tag: "test",
    },
    { bypassDailyCap: true },
  );

  return Response.json({ ok: true, sent });
}
