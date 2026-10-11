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
 * English-host dashboard for accounts without birth details: a slim birth-data
 * CTA plus chart-free content (today's moon, quick tools, article picks, a
 * test promo) instead of the locked full-page wall the Georgian host keeps.
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
      className="relative isolate flex flex-1 flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.30_0.15_350/0.3),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(45%_35%_at_30%_50%,oklch(0.40_0.18_305/0.15),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />

      <AppHeader authed active="today" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        {restricted && <RestrictedNotice locale={locale} />}
        <h1 className="mb-5 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          {en ? "Hello," : "სალამი,"}{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>

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
