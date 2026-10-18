import type { ComponentProps } from "react";

import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { PopularTools } from "@/components/nav/popular-tools";
import { RestrictedNotice } from "@/components/safety/restricted-notice";
import { BirthDataBanner } from "@/components/dashboard/birth-banner";
import { MoonPhaseCard } from "@/components/dashboard/moon-phase-card";
import { DashboardTestPromo } from "@/components/dashboard/test-promo-widget";
import { DashboardArticleRecommendations } from "@/components/dashboard/article-recommendations";
import type { MoonPhaseRow } from "@/actions/moon-phase";
import type { ArticlePreview } from "@/lib/articles";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Editorial Celestial Dashboard for accounts without birth details:
 * presents a clean astronomical almanac invitation alongside today's lunar
 * telemetry, observatory tools, and curated essays.
 */
export function NoChartDashboard({
  locale,
  firstName,
  restricted,
  moonPhase,
  articles,
  suggestedTest,
  testsAllCompleted,
}: {
  locale: UserLocale;
  firstName: string;
  restricted: boolean;
  moonPhase: MoonPhaseRow | null;
  articles: ArticlePreview[];
  suggestedTest: ComponentProps<typeof DashboardTestPromo>["test"] | undefined;
  testsAllCompleted: boolean;
}) {
  const en = locale !== "ka";
  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />

      <AppHeader authed active="today" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        {restricted && <RestrictedNotice locale={locale} />}
        <div className="mb-6 flex flex-col gap-1 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              {en ? "Personal Observatory" : "პირადი ობსერვატორია"}
            </div>
            <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {en ? "Welcome," : "სალამი,"}{" "}
              <span className="text-primary">{firstName}</span>
            </h1>
          </div>
          <div className="font-mono text-xs tabular-nums text-muted-foreground">
            {new Date().toISOString().slice(0, 10)} · UTC+4
          </div>
        </div>

        <BirthDataBanner locale={locale} />

        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-start">
          {moonPhase && (
            <div className="lg:col-span-5">
              <MoonPhaseCard data={moonPhase} locale={locale} />
            </div>
          )}
          <div className={moonPhase ? "lg:col-span-7" : "lg:col-span-12"}>
            <PopularTools locale={locale} placement="dashboard_top" />
          </div>
        </div>

        <DashboardArticleRecommendations articles={articles} locale={locale} />

        {suggestedTest && (
          <DashboardTestPromo
            test={suggestedTest}
            allCompleted={testsAllCompleted}
            locale={locale}
          />
        )}
      </section>
    </main>
  );
}
