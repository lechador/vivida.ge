import { and, eq, inArray } from "drizzle-orm";
import { after } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { charts, pdfReports } from "@/db/schema";
import { CREDIT_COST, spendOnce } from "@/lib/credits";
import { generateAndStoreReport } from "@/lib/reports/generate";
import { reportCurrency } from "@/lib/stripe";
import { getUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { archiveLibraryEntry } from "@/lib/library";
import { getRelationshipPartnerForViewer } from "@/lib/relationship-core";
import {
  REPORT_BUNDLES,
  REPORT_PRODUCTS,
  bundleRemainingPrice,
  isReportBundleKey,
  isReportProductKey,
  localized,
  reportEditionKey,
  type ReportProductKey,
} from "@/lib/report-catalog";
import { canStartReportCheckout } from "@/lib/report-store-availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ACTIVE_STATUSES = new Set(["paid", "generating", "ready", "failed"]);

async function archiveReport(input: { id: string; userId: string; type: string; language: string; status: string; createdAt: Date }) {
  const locale: UserLocale = input.language === "en" || input.language === "am" ? input.language : "ka";
  const product = isReportProductKey(input.type) ? REPORT_PRODUCTS[input.type] : null;
  await archiveLibraryEntry({
    userId: input.userId,
    kind: "report",
    sourceId: input.id,
    title: product ? localized(product.shortTitle, locale) : locale === "ka" ? "სრული ნატალური რეპორტი" : "Complete natal report",
    summary: product ? localized(product.description, locale) : locale === "ka" ? "შენი ჩამოსატვირთი პერსონალური PDF რეპორტი" : "Your downloadable personal PDF report",
    content: { type: "report", reportType: input.type, status: input.status },
    href: `/reports/${input.id}`,
    language: locale,
    occurredAt: input.createdAt,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { type?: unknown; bundleKey?: unknown; partnerId?: unknown };
  const bundleKey = isReportBundleKey(body.bundleKey) ? body.bundleKey : null;
  const singleType = isReportProductKey(body.type) ? body.type : body.type === "natal" ? "natal" : null;
  if (!bundleKey && !singleType) return Response.json({ error: "unsupported_product" }, { status: 400 });
  if (bundleKey && singleType) return Response.json({ error: "choose_product_or_bundle" }, { status: 400 });
  if (!canStartReportCheckout({ type: singleType, bundleKey })) {
    return Response.json({ error: "report_store_unavailable" }, { status: 404 });
  }

  const locale = await getUserLocale(userId);
  const [viewerChart] = await db.select().from(charts).where(eq(charts.userId, userId)).limit(1);
  if (!viewerChart) return Response.json({ error: "no_chart" }, { status: 400 });

  const products: Array<ReportProductKey | "natal"> = bundleKey ? [...REPORT_BUNDLES[bundleKey].products] : [singleType!];
  const needsRelationship = products.includes("relationship");
  const partnerId = typeof body.partnerId === "string" ? body.partnerId : "";
  const partner = needsRelationship && partnerId ? await getRelationshipPartnerForViewer(partnerId, userId) : null;
  if (needsRelationship && !partner) return Response.json({ error: "relationship_required" }, { status: 400 });

  let ownerChartHash = viewerChart.inputHash;
  if (partner && partner.userId !== userId) {
    const [ownerChart] = await db.select({ inputHash: charts.inputHash }).from(charts).where(eq(charts.userId, partner.userId)).limit(1);
    if (!ownerChart) return Response.json({ error: "relationship_chart_missing" }, { status: 400 });
    ownerChartHash = ownerChart.inputHash;
  }

  const now = new Date();
  const specs = products.map((type) => {
    const subjectKey = type === "relationship" ? partner!.id : "";
    const sourceHash = type === "relationship"
      ? partner!.userId === userId
        ? `${viewerChart.inputHash}:${partner!.inputHash}`
        : `${ownerChartHash}:${viewerChart.inputHash}`
      : viewerChart.inputHash;
    return { type, subjectKey, partnerId: type === "relationship" ? partner!.id : null, editionKey: type === "natal" ? "evergreen" : reportEditionKey(type, now, sourceHash, subjectKey) };
  });

  const existingRows = await db.select().from(pdfReports).where(and(
    eq(pdfReports.userId, userId),
    eq(pdfReports.language, locale),
    inArray(pdfReports.type, specs.map((spec) => spec.type)),
  ));
  const existingBySpec = new Map<string, (typeof existingRows)[number]>();
  for (const row of existingRows) {
    if (ACTIVE_STATUSES.has(row.status)) existingBySpec.set(`${row.type}:${row.editionKey}:${row.subjectKey}`, row);
  }
  const missing = specs.filter((spec) => !existingBySpec.has(`${spec.type}:${spec.editionKey}:${spec.subjectKey}`));
  if (missing.length === 0) {
    const rows = specs.map((spec) => existingBySpec.get(`${spec.type}:${spec.editionKey}:${spec.subjectKey}`)!);
    await Promise.all(rows.map((row) => archiveReport(row).catch(() => {})));
    return Response.json({ reportId: rows[0].id, reportIds: rows.map((row) => row.id), url: rows.length === 1 ? `/reports/${rows[0].id}` : "/reports", unlockStatus: "already", cost: 0 });
  }

  const fullMissing = missing.reduce((sum, spec) => sum + (spec.type === "natal" ? CREDIT_COST.pdfReport : REPORT_PRODUCTS[spec.type].credits), 0);
  const cost = bundleKey ? bundleRemainingPrice(bundleKey, missing.map((spec) => spec.type as ReportProductKey)) : fullMissing;
  const purchaseRef = `report-store:${bundleKey ?? singleType}:${missing.map((spec) => `${spec.type}:${spec.editionKey}:${spec.subjectKey}`).sort().join("|")}`;
  const unlockStatus = await spendOnce(userId, cost, "spend_report", purchaseRef);
  if (unlockStatus === "insufficient") return Response.json({ error: "insufficient_credits", cost }, { status: 402 });

  const bundleId = bundleKey ? crypto.randomUUID() : null;
  await db.insert(pdfReports).values(missing.map((spec) => ({
    userId, type: spec.type, language: locale, status: "paid" as const,
    inputHash: viewerChart.inputHash,
    editionKey: spec.editionKey, subjectKey: spec.subjectKey, partnerId: spec.partnerId,
    bundleId, bundleKey, comped: false, amountCents: 0,
    currency: reportCurrency().toUpperCase(), paidAt: now,
  }))).onConflictDoNothing();

  const allRows = await db.select().from(pdfReports).where(and(
    eq(pdfReports.userId, userId), eq(pdfReports.language, locale), inArray(pdfReports.type, specs.map((spec) => spec.type)),
  ));
  const rows = specs.map((spec) => allRows.find((row) => row.type === spec.type && row.editionKey === spec.editionKey && row.subjectKey === spec.subjectKey)).filter(Boolean) as typeof allRows;
  if (rows.length !== specs.length) throw new Error("report purchase completed but report rows are missing");

  await Promise.all(rows.map((row) => archiveReport(row).catch((error) => console.warn("[library] report archive failed:", error))));
  const generated = rows.filter((row) => missing.some((spec) => spec.type === row.type && spec.editionKey === row.editionKey && spec.subjectKey === row.subjectKey));
  after(() => Promise.all(generated.map((row) => generateAndStoreReport(row.id))).then(() => undefined));
  return Response.json({ reportId: rows[0].id, reportIds: rows.map((row) => row.id), url: rows.length === 1 ? `/reports/${rows[0].id}` : "/reports", unlockStatus, cost, bundleId });
}
