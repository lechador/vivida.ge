import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { CheckCircle2, Download, Loader2 } from "lucide-react";

import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/pricing";
import { canUseFeature } from "@/lib/features";
import { ProUpsell } from "@/components/paywall/pro-upsell";
import { BuyReportCta } from "./buy-report-cta";

function priceLabel(): string {
  const cents = Number(process.env.REPORT_PRICE_CENTS) || 1990;
  const cur = (process.env.REPORT_CURRENCY ?? "gel").toLowerCase();
  const amount = (cents / 100).toFixed(2);
  return cur === "gel" ? `₾${amount}` : `${amount} ${cur.toUpperCase()}`;
}

/**
 * Report purchase/download surface on /report. Adapts to the user's latest
 * natal report: buy CTA when none/abandoned, a "generating" link while it
 * builds, and a download button once ready.
 */
export async function ReportPdfPanel({
  userId,
  plan,
}: {
  userId: string;
  plan: PlanId;
}) {
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
              <h3 className="text-lg font-semibold">შენი სრული ანგარიში მზადაა</h3>
              <p className="mt-0.5 text-sm text-foreground/75">
                ჩამოტვირთე PDF — ხელმისაწვდომია ნებისმიერ დროს.
              </p>
            </div>
          </div>
          <Button asChild variant="mystic" size="lg" className="min-w-44">
            <a href={`/api/reports/${report.id}/download`}>
              <Download className="size-4" />
              ჩამოტვირთე PDF
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
                {failed ? "გენერაცია შეფერხდა" : "შენი ანგარიში მზადდება"}
              </h3>
              <p className="mt-0.5 text-sm text-foreground/75">
                {failed
                  ? "სცადე ხელახლა — დამატებითი გადახდა საჭირო არ არის."
                  : "ეს ჩვეულებრივ ერთ წუთზე ნაკლებს ანდომებს."}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link href={`/reports/${report.id}`}>ნახე სტატუსი</Link>
          </Button>
        </div>
      </div>
    );
  }

  // None / pending → Pro/trial users generate it (comped); free users get the
  // subscribe banner (the report is now included in Pro, not a one-time buy).
  if (!canUseFeature("natalReport", plan)) {
    return (
      <ProUpsell
        title="შენი ნატალური რუკის ღრმა ანალიზი — PDF"
        description="10+ გვერდიანი პერსონალური ანგარიში: რა გამოირჩევა შენს რუკაში, პლანეტების, სახლებისა და ასპექტების დეტალური ახსნა, ძლიერი მხარეები და ზრდის ზონები — Vivida Pro-ში შედის."
      />
    );
  }
  return <BuyReportCta plan={plan} priceLabel={priceLabel()} />;
}
