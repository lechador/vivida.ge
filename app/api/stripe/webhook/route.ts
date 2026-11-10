import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { generateAndStoreReport } from "@/lib/reports/generate";
import { grantPurchaseCredits } from "@/lib/credits";
import {
  activatePremiumFromCheckout,
  findUserIdForStripeSubscription,
  getBillingIdentity,
  syncPremiumSubscription,
} from "@/lib/premium";
import {
  trackCheckoutCompleted,
  trackInvoicePaid,
} from "@/lib/checkout-tracking";
import { sendPaymentFailedNotice } from "@/lib/payment-failed-notice";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import { recordExperimentOutcomesBestEffort } from "@/lib/experiment-outcomes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// after() runs the ~60-120s generation once we 200 the webhook.
export const maxDuration = 300;

function refOf(ref: string | { id: string } | null | undefined): string | null {
  return typeof ref === "string" ? ref : (ref?.id ?? null);
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  return refOf(invoice.parent?.subscription_details?.subscription ?? null);
}

/**
 * Structured money-risk log (+ Sentry when available) for refunds and
 * disputes. Credits are never clawed back automatically; a human decides.
 */
async function reportBillingRisk(
  kind: "refund" | "dispute",
  details: Record<string, unknown>,
) {
  console.warn(
    `[stripe/webhook] billing risk: ${kind}`,
    JSON.stringify(details),
  );
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureMessage(`Stripe ${kind}`, {
      level: "warning",
      extra: details,
    });
  } catch {
    /* Sentry is optional */
  }
}

async function userIdForCustomer(customerId: string | null) {
  if (!customerId) return null;
  try {
    const { users } = await import("@/db/schema");
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);
    return row?.id ?? null;
  } catch {
    return null;
  }
}

/** Stripe events can be stale or out of order: always act on the live object. */
async function liveSubscription(
  payload: Stripe.Subscription,
): Promise<Stripe.Subscription> {
  try {
    return await stripe().subscriptions.retrieve(payload.id);
  } catch (err) {
    if ((err as { code?: string }).code === "resource_missing") return payload;
    throw err;
  }
}

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

  if (event.type === "checkout.session.async_payment_failed") {
    const failed = event.data.object as Stripe.Checkout.Session;
    console.warn(
      `[stripe/webhook] async payment failed for session ${failed.id} (${failed.metadata?.kind ?? "unknown"}, user ${failed.metadata?.userId ?? "?"}); nothing was granted`,
    );
    return new Response("ok", { status: 200 });
  }

  if (
    event.type === "charge.refunded" ||
    event.type === "charge.dispute.created"
  ) {
    const obj = event.data.object as Stripe.Charge | Stripe.Dispute;
    const isDispute = event.type === "charge.dispute.created";
    const customerId = isDispute
      ? null
      : refOf((obj as Stripe.Charge).customer);
    await reportBillingRisk(isDispute ? "dispute" : "refund", {
      eventId: event.id,
      objectId: obj.id,
      userId: await userIdForCustomer(customerId),
      customerId,
      amountMinor: isDispute
        ? (obj as Stripe.Dispute).amount
        : (obj as Stripe.Charge).amount_refunded,
      currency: obj.currency,
      reason: isDispute ? (obj as Stripe.Dispute).reason : undefined,
      paymentIntent: refOf(
        obj.payment_intent as string | { id: string } | null,
      ),
    });
    return new Response("ok", { status: 200 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const sessionObj = event.data.object as Stripe.Checkout.Session;

    if (sessionObj.metadata?.kind === "premium") {
      const uid = sessionObj.metadata?.userId ?? "";
      try {
        await activatePremiumFromCheckout(sessionObj);
        // A trial checkout completes with no payment due, so it must not be
        // booked as a purchase: the payer event fires on the first paid
        // invoice instead (see `invoice.paid` below).
        if (uid && sessionObj.payment_status === "paid") {
          await recordExperimentOutcomesBestEffort(
            uid,
            [
              EXPERIMENTS.pricingPresentation,
              EXPERIMENTS.contextualPaywall,
              EXPERIMENTS.firstPurchaseOffer,
            ],
            "purchase_completed",
            `stripe_webhook:${sessionObj.metadata?.purchase_context ?? "premium"}`,
            sessionObj.id,
          );
        }
      } catch (err) {
        console.error("[stripe/webhook] premium activation failed:", err);
        return new Response("premium sync failed", { status: 500 });
      }
      after(async () => {
        const identity = await getBillingIdentity(
          sessionObj.metadata?.userId ?? "",
        );
        await trackCheckoutCompleted({
          session: sessionObj,
          email: identity?.email,
          countryCode: identity?.countryCode,
        });
      });
      return new Response("ok", { status: 200 });
    }

    // Credit top-up → award the pack's credits (idempotent on session id).
    if (sessionObj.metadata?.kind === "credits") {
      // A delayed-payment method completes the session before money clears.
      // Grant only when paid; `async_payment_succeeded` re-delivers this
      // same session (same idempotency key) once it settles.
      if (sessionObj.payment_status !== "paid") {
        console.warn(
          `[stripe/webhook] credits session ${sessionObj.id} not paid yet (${sessionObj.payment_status}); deferring grant`,
        );
        return new Response("ok", { status: 200 });
      }
      const uid = sessionObj.metadata.userId as string | undefined;
      const credits = Number(sessionObj.metadata.credits);
      if (uid && Number.isFinite(credits) && credits > 0) {
        try {
          await grantPurchaseCredits(uid, credits, sessionObj.id);
          await recordExperimentOutcomesBestEffort(
            uid,
            [
              EXPERIMENTS.pricingPresentation,
              EXPERIMENTS.contextualPaywall,
              EXPERIMENTS.firstPurchaseOffer,
            ],
            "purchase_completed",
            `stripe_webhook:${sessionObj.metadata?.purchase_context ?? "credits"}`,
            sessionObj.id,
          );
        } catch (err) {
          console.error("[stripe/webhook] credit grant failed:", err);
          // 500 so Stripe redelivers, the grant is idempotent on the session
          // id, so a paid top-up can never be lost nor granted twice.
          return new Response("credit grant failed", { status: 500 });
        }
        after(async () => {
          const identity = await getBillingIdentity(uid);
          await trackCheckoutCompleted({
            session: sessionObj,
            email: identity?.email,
            countryCode: identity?.countryCode,
          });
        });
      }
      return new Response("ok", { status: 200 });
    }

    if (sessionObj.payment_status !== "paid") {
      console.warn(
        `[stripe/webhook] report session ${sessionObj.id} not paid yet (${sessionObj.payment_status})`,
      );
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

  // First real money for a subscription: a trial conversion or a renewal.
  // Renewals also land here; the payer outcome is keyed by invoice id and
  // recorded at most once per user+experiment by the outcome ledger, and the
  // subscription sync is the same one the subscription events perform.
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionRef =
      invoice.parent?.subscription_details?.subscription ?? null;
    const subscriptionId =
      typeof subscriptionRef === "string"
        ? subscriptionRef
        : (subscriptionRef?.id ?? null);
    if (subscriptionId) {
      try {
        const subscription =
          await stripe().subscriptions.retrieve(subscriptionId);
        await syncPremiumSubscription(subscription);
        const uid = subscription.metadata?.userId ?? "";
        if (uid && subscription.metadata?.kind === "premium") {
          after(async () => {
            try {
              const identity = await getBillingIdentity(uid);
              await trackInvoicePaid({
                invoice,
                subscription,
                email: identity?.email,
                countryCode: identity?.countryCode,
              });
            } catch (err) {
              console.warn("[stripe/webhook] invoice tracking failed:", err);
            }
          });
          await recordExperimentOutcomesBestEffort(
            uid,
            [
              EXPERIMENTS.pricingPresentation,
              EXPERIMENTS.contextualPaywall,
              EXPERIMENTS.firstPurchaseOffer,
            ],
            "purchase_completed",
            "stripe_webhook:invoice_paid",
            invoice.id,
          );
        }
      } catch (err) {
        console.error("[stripe/webhook] invoice sync failed:", err);
        return new Response("invoice sync failed", { status: 500 });
      }
    }
  }

  // Renewal failed: tell the subscriber once per invoice so they can fix the
  // card before Stripe gives up. Never fails the webhook (email is best
  // effort and idempotent), so a Resend outage cannot cause retry storms.
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoiceSubscriptionId(invoice);
    if (subscriptionId) {
      try {
        const subscription =
          await stripe().subscriptions.retrieve(subscriptionId);
        if (subscription.metadata?.kind === "premium") {
          const uid =
            subscription.metadata.userId ||
            (await findUserIdForStripeSubscription(subscription));
          if (uid) {
            const outcome = await sendPaymentFailedNotice({
              invoice,
              userId: uid,
            });
            console.warn(
              `[stripe/webhook] payment failed for invoice ${invoice.id} user ${uid}: notice ${outcome}`,
            );
          }
        }
      } catch (err) {
        console.error("[stripe/webhook] payment-failed notice error:", err);
      }
    }
    return new Response("ok", { status: 200 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    try {
      await syncPremiumSubscription(
        await liveSubscription(event.data.object as Stripe.Subscription),
      );
    } catch (err) {
      console.error("[stripe/webhook] subscription sync failed:", err);
      return new Response("subscription sync failed", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
}
