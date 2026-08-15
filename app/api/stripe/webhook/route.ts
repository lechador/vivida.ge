import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { constructWebhookEvent } from "@/lib/stripe";
import { generateAndStoreReport } from "@/lib/reports/generate";
import { grantPurchaseCredits } from "@/lib/credits";
import {
  activatePremiumFromCheckout,
  syncPremiumSubscription,
} from "@/lib/premium";

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

    if (sessionObj.metadata?.kind === "premium") {
      try {
        await activatePremiumFromCheckout(sessionObj);
      } catch (err) {
        console.error("[stripe/webhook] premium activation failed:", err);
        return new Response("premium sync failed", { status: 500 });
      }
      return new Response("ok", { status: 200 });
    }

    // Credit top-up → award the pack's credits (idempotent on session id).
    if (sessionObj.metadata?.kind === "credits") {
      const uid = sessionObj.metadata.userId as string | undefined;
      const credits = Number(sessionObj.metadata.credits);
      if (uid && Number.isFinite(credits) && credits > 0) {
        try {
          await grantPurchaseCredits(uid, credits, sessionObj.id);
        } catch (err) {
          console.error("[stripe/webhook] credit grant failed:", err);
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

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    try {
      await syncPremiumSubscription(event.data.object as Stripe.Subscription);
    } catch (err) {
      console.error("[stripe/webhook] subscription sync failed:", err);
      return new Response("subscription sync failed", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
}
