import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { generateAndStoreReport } from "@/lib/reports/generate";
import { syncStripeSubscription } from "@/lib/subscription-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// after() runs the ~60-120s generation once we 200 the webhook.
export const maxDuration = 300;

/**
 * Stripe webhook. Source of truth for marking a report paid. On
 * `checkout.session.completed` we flip the row paid and kick off PDF
 * generation. Returns 200 fast; generation runs in after().
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("missing signature", { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(raw, sig);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[stripe/webhook] signature verification failed:", msg);
    return new Response(`bad signature: ${msg}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionObj = event.data.object as Stripe.Checkout.Session;

    // Subscription checkout → sync the Pro subscription and we're done.
    if (sessionObj.mode === "subscription") {
      const subId =
        typeof sessionObj.subscription === "string"
          ? sessionObj.subscription
          : (sessionObj.subscription?.id ?? null);
      if (subId) {
        try {
          const sub = await stripe().subscriptions.retrieve(subId);
          await syncStripeSubscription(sub);
        } catch (err) {
          console.error("[stripe/webhook] subscription sync failed:", err);
        }
      }
      return new Response("ok", { status: 200 });
    }

    const reportId =
      (sessionObj.metadata?.reportId as string | undefined) ??
      (sessionObj.client_reference_id as string | undefined);

    if (!reportId) {
      console.warn("[stripe/webhook] completed session without reportId");
      return new Response("ok", { status: 200 });
    }

    const [report] = await db
      .select()
      .from(pdfReports)
      .where(eq(pdfReports.id, reportId))
      .limit(1);

    if (!report) {
      console.warn(`[stripe/webhook] no report ${reportId}`);
      return new Response("ok", { status: 200 });
    }

    // Idempotent: only act on a still-pending row.
    if (report.status === "pending") {
      const paymentIntentId =
        typeof sessionObj.payment_intent === "string"
          ? sessionObj.payment_intent
          : (sessionObj.payment_intent?.id ?? null);

      await db
        .update(pdfReports)
        .set({
          status: "paid",
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntentId,
        })
        .where(eq(pdfReports.id, reportId));

      after(() => generateAndStoreReport(reportId));
    }
  }

  // Subscription lifecycle (renewals, cancels, card updates) → keep our row
  // in sync so getCurrentPlan/isProActive reflect reality.
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    try {
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
    } catch (err) {
      console.error("[stripe/webhook] subscription event sync failed:", err);
    }
  }

  return new Response("ok", { status: 200 });
}
