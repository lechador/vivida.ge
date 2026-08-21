import { handleRevenueCatEvent, type RcEvent } from "@/lib/revenuecat-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/revenuecat/webhook
 *
 * Server-to-server events from RevenueCat: the only thing allowed to grant a
 * store purchase. The client's own purchase callback is never trusted — it
 * runs on the buyer's device.
 *
 * RevenueCat cannot sign requests the way Stripe does, so the gate is a shared
 * secret sent verbatim in the Authorization header and configured identically
 * in the RevenueCat dashboard (REVENUECAT_WEBHOOK_AUTH).
 */
export async function POST(req: Request) {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected) {
    // Refuse rather than accept. An unset secret must never degrade into an
    // open endpoint that writes entitlements and mints credits.
    console.error(
      "[revenuecat] REVENUECAT_WEBHOOK_AUTH is not set — rejecting the webhook"
    );
    return new Response("not configured", { status: 503 });
  }
  if (req.headers.get("authorization") !== expected) {
    return new Response("forbidden", { status: 403 });
  }

  let body: { event?: RcEvent } & RcEvent;
  try {
    body = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }

  try {
    // RevenueCat wraps the payload as `{ event: {...}, api_version }`.
    const outcome = await handleRevenueCatEvent(body?.event ?? body);
    return Response.json({ ok: true, outcome });
  } catch (err) {
    console.error("[revenuecat] event handling failed:", err);
    // 500 makes RevenueCat redeliver. Every write in the handler is idempotent,
    // so a redelivery cannot double-grant — but answering 200 here would drop a
    // purchase the customer has paid for.
    return new Response("event handling failed", { status: 500 });
  }
}
