import { and, desc, eq } from "drizzle-orm";
import { after } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { charts, pdfReports } from "@/db/schema";
import { getCurrentPlan } from "@/lib/plan";
import { generateAndStoreReport } from "@/lib/reports/generate";
import {
  createReportCheckoutSession,
  isStripeConfigured,
  reportCurrency,
  reportPriceCents,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Pro comp path kicks off generation via after() — keep the function alive.
export const maxDuration = 300;

const SUPPORTED_TYPES = new Set(["natal"]);

/**
 * Start a report purchase.
 *  - Pro subscribers: comped → report created as 'paid', generation kicked
 *    off immediately, returns the in-app status page URL.
 *  - Everyone else: returns a Stripe Checkout URL to redirect to.
 * Re-clicking when a paid/generating/ready report already exists returns it
 * instead of charging again.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let type = "natal";
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body.type === "string") type = body.type;
  } catch {
    /* empty body is fine */
  }
  if (!SUPPORTED_TYPES.has(type)) {
    return Response.json({ error: "unsupported_type" }, { status: 400 });
  }

  // Must have a generated chart to report on.
  const [chartRow] = await db
    .select({ userId: charts.userId })
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);
  if (!chartRow) {
    return Response.json({ error: "no_chart" }, { status: 400 });
  }

  // Don't double-charge / double-create: reuse an in-flight or finished one.
  const [existing] = await db
    .select()
    .from(pdfReports)
    .where(and(eq(pdfReports.userId, userId), eq(pdfReports.type, type)))
    .orderBy(desc(pdfReports.createdAt))
    .limit(1);
  // Already paid (incl. failed → retryable on the status page) or done:
  // route back to it, never charge twice.
  if (existing && ["paid", "generating", "ready", "failed"].includes(existing.status)) {
    return Response.json({ reportId: existing.id, url: `/reports/${existing.id}` });
  }

  const plan = await getCurrentPlan(userId);
  const origin =
    process.env.APP_ORIGIN ?? process.env.AUTH_URL ?? new URL(req.url).origin;

  // ── Pro: comped, no payment ──────────────────────────────────────────
  if (plan === "pro") {
    const [row] = await db
      .insert(pdfReports)
      .values({
        userId,
        type,
        status: "paid",
        comped: true,
        amountCents: 0,
        currency: reportCurrency().toUpperCase(),
        paidAt: new Date(),
      })
      .returning({ id: pdfReports.id });

    after(() => generateAndStoreReport(row.id));
    return Response.json({ reportId: row.id, url: `/reports/${row.id}` });
  }

  // ── Everyone else: Stripe Checkout ───────────────────────────────────
  if (!isStripeConfigured()) {
    return Response.json({ error: "payments_unavailable" }, { status: 503 });
  }

  const [row] = await db
    .insert(pdfReports)
    .values({
      userId,
      type,
      status: "pending",
      amountCents: reportPriceCents(),
      currency: reportCurrency().toUpperCase(),
    })
    .returning({ id: pdfReports.id });

  try {
    const checkout = await createReportCheckoutSession({
      reportId: row.id,
      userId,
      type,
      email: session.user.email,
      origin,
    });
    await db
      .update(pdfReports)
      .set({ stripeSessionId: checkout.id })
      .where(eq(pdfReports.id, row.id));
    return Response.json({ reportId: row.id, url: checkout.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[reports/checkout] stripe error:", msg);
    return Response.json({ error: "checkout_failed", detail: msg }, { status: 502 });
  }
}
