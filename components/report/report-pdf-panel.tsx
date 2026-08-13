import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { CheckCircle2, Download, Loader2 } from "lucide-react";

import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { CREDIT_COST, getBalance } from "@/lib/credits";
import { BuyReportCta } from "./buy-report-cta";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Report purchase/download surface on /report. Adapts to the user's latest
 * natal report: buy CTA when none/abandoned, a "generating" link while it
 * builds, and a download button once ready. Paid with credits.
 */
export async function ReportPdfPanel({
  userId,
  locale = "ka",
}: {
  userId: string;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const [report] = await db
    .select()
    .from(pdfReports)
    .where(and(eq(pdfReports.userId, userId), eq(pdfReports.type, "natal")))
    .orderBy(desc(pdfReports.createdAt))
    .limit(1);

  // Ready → download.
  if (report?.status === "ready") {
    return (
      <div className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--vivida-cyan)]" />
            <div>
              <h3 className="text-lg font-semibold">
                {en ? "Your complete report is ready" : "შენი სრული ანგარიში მზადაა"}
              </h3>
              <p className="mt-0.5 text-sm text-foreground/75">
                {en ? "Download your PDF whenever you need it." : "ჩამოტვირთე PDF — ხელმისაწვდომია ნებისმიერ დროს."}
              </p>
            </div>
          </div>
          <Button asChild variant="mystic" size="lg" className="min-w-44">
            <a href={`/api/reports/${report.id}/download`}>
              <Download className="size-4" />
              {en ? "Download PDF" : "ჩამოტვირთე PDF"}
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Paid / generating / failed → in-progress (status page has detail + retry).
  if (report && ["paid", "generating", "failed"].includes(report.status)) {
    const failed = report.status === "failed";
    return (
      <div className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {failed ? (
              <span className="mt-0.5 text-[var(--vivida-pink)]">⚠</span>
            ) : (
              <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-[var(--vivida-violet)]" />
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {failed
                  ? en
                    ? "Generation was interrupted"
                    : "გენერაცია შეფერხდა"
                  : en
                    ? "Your report is being prepared"
                    : "შენი ანგარიში მზადდება"}
              </h3>
              <p className="mt-0.5 text-sm text-foreground/75">
                {failed
                  ? en
                    ? "Try again—there is no additional charge."
                    : "სცადე ხელახლა — დამატებითი გადახდა საჭირო არ არის."
                  : en
                    ? "This usually takes less than a minute."
                    : "ეს ჩვეულებრივ ერთ წუთზე ნაკლებს ანდომებს."}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link href={`/reports/${report.id}`}>{en ? "View status" : "ნახე სტატუსი"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // None / pending → pay with credits to generate.
  const balance = await getBalance(userId);
  return <BuyReportCta cost={CREDIT_COST.pdfReport} balance={balance} locale={locale} />;
}
