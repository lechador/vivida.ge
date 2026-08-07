import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { ReportProgress } from "@/components/report/report-progress";

export const metadata = { title: "შენი ანგარიში" };
export const dynamic = "force-dynamic";

export default async function ReportStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [report] = await db
    .select()
    .from(pdfReports)
    .where(eq(pdfReports.id, id))
    .limit(1);

  if (!report || report.userId !== user.id) notFound();

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />
      <AppHeader authed active="report" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 pt-12 sm:px-6">
        <ReportProgress reportId={report.id} initialStatus={report.status} />
        <div className="mt-6 text-center">
          <Link
            href="/report"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← დაბრუნდი რუკაზე
          </Link>
        </div>
      </section>
    </main>
  );
}
