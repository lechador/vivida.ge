import { and, desc, eq } from "drizzle-orm";
import { after } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { charts, pdfReports } from "@/db/schema";
import { CREDIT_COST, spendCredits } from "@/lib/credits";
import { generateAndStoreReport } from "@/lib/reports/generate";
import { reportCurrency } from "@/lib/stripe";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { archiveLibraryEntry } from "@/lib/library";

async function archiveReport(input: {
  id: string;
  userId: string;
  type: string;
  language: string;
  status: string;
  createdAt: Date;
}) {
  const { language } = input;
  await archiveLibraryEntry({
    userId: input.userId,
    kind: "report",
    sourceId: input.id,
    title:
      language === "en"
        ? "Complete natal report"
        : language === "am"
          ? "Ամբողջական նատալ զեկույց"
          : "სრული ნატალური რეპორტი",
    summary:
      language === "en"
        ? "Your downloadable personal PDF report"
        : language === "am"
          ? "Ձեր ներբեռնվող անձնական PDF զեկույցը"
          : "შენი ჩამოსატვირთი პერსონალური PDF რეპორტი",
    content: { type: "report", reportType: input.type, status: input.status },
    href: `/reports/${input.id}`,
    language,
    occurredAt: input.createdAt,
  });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Generation is kicked off via after() — keep the function alive.
export const maxDuration = 300;

const SUPPORTED_TYPES = new Set(["natal"]);

/**
 * Generate a natal PDF report, paid with credits. Spends CREDIT_COST.pdfReport
 * once, creates the report row as 'paid', and kicks off generation, returning
 * the in-app status page URL. Re-clicking when a paid/generating/ready report
 * already exists returns it instead of charging again. 402 when short.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const locale = await getUserLocale(userId);

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
    .where(
      and(
        eq(pdfReports.userId, userId),
        eq(pdfReports.type, type),
        eq(pdfReports.language, locale),
      ),
    )
    .orderBy(desc(pdfReports.createdAt))
    .limit(1);
  // Already paid (incl. failed → retryable on the status page) or done:
  // route back to it, never charge twice.
  if (existing && ["paid", "generating", "ready", "failed"].includes(existing.status)) {
    await archiveReport(existing).catch((error) =>
      console.warn("[library] report archive failed:", error),
    );
    return Response.json({
      reportId: existing.id,
      url: `/reports/${existing.id}`,
      unlockStatus: "already",
    });
  }

  // ── Pay with credits ─────────────────────────────────────────────────
  // Charge before creating the row; the atomic spend guards the balance so a
  // short wallet never gets a comped report.
  const paid = await spendCredits(
    userId,
    CREDIT_COST.pdfReport,
    "spend_report"
  );
  if (!paid) {
    return Response.json(
      { error: "insufficient_credits", cost: CREDIT_COST.pdfReport },
      { status: 402 }
    );
  }

  const [row] = await db
    .insert(pdfReports)
    .values({
      userId,
      type,
      language: locale,
      status: "paid",
      comped: false,
      amountCents: 0,
      currency: reportCurrency().toUpperCase(),
      paidAt: new Date(),
    })
    .returning({
      id: pdfReports.id,
      userId: pdfReports.userId,
      type: pdfReports.type,
      language: pdfReports.language,
      status: pdfReports.status,
      createdAt: pdfReports.createdAt,
    });

  await archiveReport(row).catch((error) =>
    console.warn("[library] report archive failed:", error),
  );

  after(() => generateAndStoreReport(row.id));
  return Response.json({
    reportId: row.id,
    url: `/reports/${row.id}`,
    unlockStatus: "unlocked",
  });
}
