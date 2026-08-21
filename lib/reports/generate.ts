/**
 * Report generation worker. Given a paid pdf_report row, it produces the
 * deep Georgian PDF and stores it privately in R2. Invoked fire-and-forget
 * via `after()` after a confirmed credit spend, so it must own its own error
 * handling and never throw to the caller.
 */
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { charts, pdfReports, profiles, users } from "@/db/schema";
import { computeChartSalience } from "@/lib/report-salience";
import { generateNatalReport } from "@/lib/report-content";
import { buildEnglishNatalReportContent } from "@/lib/report-content-pdf-en";
import { NatalReport } from "@/components/pdf/natal-report";
import { putObject } from "@/lib/r2";
import { normalizeUserLocale } from "@/lib/i18n/locale";
import { claimGeneration, releaseGeneration } from "@/lib/generation-lock";

export function reportPdfKey(userId: string, reportId: string): string {
  return `reports/${userId}/${reportId}.pdf`;
}

/**
 * Generate + store the PDF for a report. Idempotent-ish: safe to call again
 * on a `failed` row to retry. Moves the row paid → generating → ready, or
 * → failed with an error message. Returns true on success.
 */
export async function generateAndStoreReport(reportId: string): Promise<boolean> {
  const lockKey = `pdf-report:${reportId}`;
  if (!(await claimGeneration(lockKey, 10 * 60 * 1000))) {
    console.info(`[report-gen] ${reportId}: generation already claimed`);
    return false;
  }

  try {
  const [report] = await db
    .select()
    .from(pdfReports)
    .where(eq(pdfReports.id, reportId))
    .limit(1);

  if (!report) {
    console.warn(`[report-gen] ${reportId}: row not found`);
    return false;
  }
  if (report.status === "ready" && report.pdfKey) {
    return true; // already done
  }
  if (report.status === "pending") {
    console.warn(`[report-gen] ${reportId}: not paid yet, skipping`);
    return false;
  }

  // Claim the job.
  await db
    .update(pdfReports)
    .set({ status: "generating", error: null })
    .where(eq(pdfReports.id, reportId));

  try {
    const { renderToBuffer } = await import("@react-pdf/renderer");

    const [chartRow] = await db
      .select()
      .from(charts)
      .where(eq(charts.userId, report.userId))
      .limit(1);
    if (!chartRow) throw new Error("no chart on file for user");

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, report.userId))
      .limit(1);
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, report.userId))
      .limit(1);

    const chart = chartRow.data;
    const salience = computeChartSalience(chart);
    const firstName = user?.name?.split(" ")[0] ?? null;
    const locale = normalizeUserLocale(report.language);

    const content =
      locale === "en"
        ? buildEnglishNatalReportContent(chart, salience, firstName)
        : await generateNatalReport({ firstName, chart, salience });

    const buffer = await renderToBuffer(
      NatalReport({
        data: {
          name: firstName,
          birth: {
            date: profile?.dateOfBirth ?? "",
            time: profile?.timeOfBirth ? profile.timeOfBirth.slice(0, 5) : null,
            place: profile?.cityName ?? "",
          },
          chart,
          salience,
          content,
          locale,
        },
      })
    );

    const key = reportPdfKey(report.userId, report.id);
    await putObject({
      key,
      body: new Uint8Array(buffer),
      contentType: "application/pdf",
    });

    await db
      .update(pdfReports)
      .set({
        status: "ready",
        pdfKey: key,
        inputHash: chartRow.inputHash,
        readyAt: new Date(),
        error: null,
      })
      .where(eq(pdfReports.id, reportId));

    console.log(`[report-gen] ${reportId}: ready (${buffer.length} bytes)`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[report-gen] ${reportId}: failed —`, msg);
    await db
      .update(pdfReports)
      .set({ status: "failed", error: msg.slice(0, 500) })
      .where(eq(pdfReports.id, reportId));
    return false;
  }
  } finally {
    await releaseGeneration(lockKey).catch(() => {});
  }
}
