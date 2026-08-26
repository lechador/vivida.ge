import { eq } from "drizzle-orm";
import { after } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { generateAndStoreReport } from "@/lib/reports/generate";
import { isStripeConfigured, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const STUCK_MS = 5 * 60 * 1000;
const PAID_RETRY_MS = 60 * 1000;

type Params = { params: Promise<{ id: string }> };

/** Poll a report's status (and self-heal a delayed Stripe payment). */
export async function GET(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  let [report] = await db
    .select()
    .from(pdfReports)
    .where(eq(pdfReports.id, id))
    .limit(1);

  if (!report || report.userId !== userId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  let generationQueued = false;

  // Fallback: if the webhook is late, confirm the Stripe session ourselves.
  if (report.status === "pending" && report.stripeSessionId && isStripeConfigured()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(report.stripeSessionId);
      if (s.payment_status === "paid") {
        const pi =
          typeof s.payment_intent === "string"
            ? s.payment_intent
            : (s.payment_intent?.id ?? null);
        await db
          .update(pdfReports)
          .set({ status: "paid", paidAt: new Date(), stripePaymentIntentId: pi })
          .where(eq(pdfReports.id, id));
        after(() => generateAndStoreReport(id));
        generationQueued = true;
        report = { ...report, status: "paid" };
      }
    } catch (err) {
      console.error("[reports/:id] session reconcile failed:", err);
    }
  }

  const stuckGenerating =
    report.status === "generating" &&
    (report.generationStartedAt ?? report.paidAt) != null &&
    Date.now() - (report.generationStartedAt ?? report.paidAt)!.getTime() > STUCK_MS;

  // Credit-funded purchases do not have a Stripe webhook to reconcile. If a
  // deployment ends before its original `after()` callback starts, the row can
  // remain `paid`; similarly, a crashed renderer can leave it `generating`.
  // Polling the status page now repairs both states without charging again.
  if (stuckGenerating) {
    await db
      .update(pdfReports)
      .set({ status: "paid", generationStartedAt: null, error: null })
      .where(eq(pdfReports.id, id));
    report = { ...report, status: "paid", generationStartedAt: null, error: null };
  }
  if (report.status === "paid" && !generationQueued) {
    after(() => generateAndStoreReport(id));
    generationQueued = true;
  }

  const paidLongEnoughToRetry =
    report.status === "paid" &&
    report.paidAt != null &&
    Date.now() - report.paidAt.getTime() > PAID_RETRY_MS;

  return Response.json({
    id: report.id,
    type: report.type,
    status: report.status,
    ready: report.status === "ready",
    comped: report.comped,
    error: report.status === "failed" ? report.error : null,
    retryable: report.status === "failed" || paidLongEnoughToRetry || stuckGenerating,
    recovering: generationQueued,
    createdAt: report.createdAt,
  });
}

/** Retry a failed or stuck generation (owner only, no re-charge). */
export async function POST(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const [report] = await db
    .select()
    .from(pdfReports)
    .where(eq(pdfReports.id, id))
    .limit(1);

  if (!report || report.userId !== userId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const stuck =
    report.status === "generating" &&
    report.paidAt != null &&
    Date.now() - report.paidAt.getTime() > STUCK_MS;
  const retryable = report.status === "failed" || report.status === "paid" || stuck;
  if (!retryable) {
    return Response.json({ error: "not_retryable", status: report.status }, { status: 409 });
  }

  await db
    .update(pdfReports)
    .set({ status: "paid", generationStartedAt: null, error: null })
    .where(eq(pdfReports.id, id));
  after(() => generateAndStoreReport(id));
  return Response.json({ ok: true, status: "paid" });
}
