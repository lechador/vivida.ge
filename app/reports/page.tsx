import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";

import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getBalance } from "@/lib/credits";
import { isPremiumUser } from "@/lib/premium";
import { listRelationshipsForViewer } from "@/lib/relationship-core";
import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { ReportStore } from "@/components/report/report-store";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "ka" ? "პერსონალური რეპორტები" : "Personal reports", robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function ReportsStorePage() {
  const user = await requireUser("/reports");
  const [locale, balance, premium, relationships, reports] = await Promise.all([
    getUserLocale(user.id),
    getBalance(user.id),
    isPremiumUser(user.id),
    listRelationshipsForViewer(user.id),
    db.select({ id: pdfReports.id, type: pdfReports.type, status: pdfReports.status, createdAt: pdfReports.createdAt }).from(pdfReports).where(eq(pdfReports.userId, user.id)).orderBy(desc(pdfReports.createdAt)).limit(12),
  ]);
  const en = locale !== "ka";
  return (
    <main lang={locale} className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_38%_at_50%_-5%,oklch(0.34_0.18_305/0.5),transparent_72%),radial-gradient(35%_28%_at_90%_35%,oklch(0.30_0.15_220/0.35),transparent_70%),radial-gradient(35%_25%_at_10%_65%,oklch(0.32_0.16_350/0.3),transparent_70%)]" />
      <Starfield count={120} shooting={3} />
      <AppHeader authed active="reports" />
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-7 sm:px-6 sm:pt-10">
        <header className="mb-7 max-w-2xl"><div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">VIVIDA REPORTS</div><h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{en ? "A deeper map for your next chapter" : "უფრო ღრმა რუკა შენი შემდეგი თავისთვის"}</h1><p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">{en ? "Personal PDF reports built from your natal chart and current transits. Download once and keep forever." : "პერსონალური PDF რეპორტები შენი ნატალური რუკისა და მიმდინარე ტრანზიტების მიხედვით. ერთხელ ჩამოტვირთე და სამუდამოდ შეინახე."}</p></header>
        <ReportStore locale={locale} balance={balance} premium={premium} relationships={relationships.map((item) => ({ id: item.id, displayName: item.displayName }))} recentReports={reports.map((report) => ({ ...report, createdAt: report.createdAt.toISOString() }))} />
      </section>
    </main>
  );
}
