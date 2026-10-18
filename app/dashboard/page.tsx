import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  bigFiveResults,
  eqResults,
  iqResults,
  mbtiTestResults,
  profiles,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { isAccountRestricted } from "@/lib/restriction";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { PopularTools } from "@/components/nav/popular-tools";
import { DailyDashboard } from "@/components/dashboard/daily-dashboard";
import { NoChartDashboard } from "@/components/dashboard/no-chart-dashboard";
import { RestrictedNotice } from "@/components/safety/restricted-notice";
import { DashboardTestPromo } from "@/components/dashboard/test-promo-widget";
import { DashboardArticleRecommendations } from "@/components/dashboard/article-recommendations";
import { DashboardBillingNudge } from "@/components/dashboard/billing-nudge";
import { TESTS } from "@/lib/tests-catalog";
import {
  listPublishedArticlePreviews,
  type ArticlePreview,
} from "@/lib/articles";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ensureMoonPhase } from "@/actions/moon-phase";
import { getBalance } from "@/lib/credits";
import { shouldShowPurchasePromotion } from "@/lib/billing-config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale !== "ka" ? "Today" : "დღეს" };
}

function pickDailyArticles(
  articles: ArticlePreview[],
  seed: number,
  limit = 3,
): ArticlePreview[] {
  const shuffled = [...articles];
  let state = seed || 1;

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, limit);
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    [profile],
    [userRow],
    [mbtiResult],
    [iqResult],
    [eqResult],
    [bigFiveResult],
    balance,
  ] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    db
      .select({
        locale: users.interfaceLanguage,
        countryCode: users.residenceCountryCode,
        isPremium: users.isPremium,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
    db
      .select({ id: mbtiTestResults.id })
      .from(mbtiTestResults)
      .where(eq(mbtiTestResults.userId, user.id))
      .limit(1),
    db
      .select({ id: iqResults.id })
      .from(iqResults)
      .where(eq(iqResults.userId, user.id))
      .limit(1),
    db
      .select({ id: eqResults.id })
      .from(eqResults)
      .where(eq(eqResults.userId, user.id))
      .limit(1),
    db
      .select({ id: bigFiveResults.id })
      .from(bigFiveResults)
      .where(eq(bigFiveResults.userId, user.id))
      .limit(1),
    getBalance(user.id),
  ]);
  const locale = await getRequestLocale(normalizeUserLocale(userRow?.locale));
  const en = locale !== "ka";

  // An account without birth details gets a filled, chart-free dashboard
  // (birth-data banner + moon, tools, articles, test promo) on both hosts
  // instead of a full-page wall, birth data stays optional after signup.
  const noChart = !profile?.dateOfBirth;

  const [restricted, publishedArticles, moonPhase] = await Promise.all([
    isAccountRestricted(user.id),
    listPublishedArticlePreviews(locale),
    noChart ? ensureMoonPhase(locale).catch(() => null) : Promise.resolve(null),
  ]);
  const firstName =
    user.name?.split(" ")[0] ?? (en ? "stargazer" : "ვარსკვლავო");
  const completed = new Set([
    ...(mbtiResult ? ["astro-mbti"] : []),
    ...(iqResult ? ["iq"] : []),
    ...(eqResult ? ["eq"] : []),
    ...(bigFiveResult ? ["big-five"] : []),
  ]);
  const primaryTests = TESTS.filter(
    (test) =>
      test.available &&
      test.kind === "featured" &&
      (!test.locales || test.locales.includes(locale)),
  );
  const unfinished = primaryTests.filter((test) => !completed.has(test.slug));
  const pool =
    unfinished.length > 0
      ? unfinished
      : TESTS.filter(
          (test) =>
            test.available &&
            test.kind === "quiz" &&
            (!test.locales || test.locales.includes(locale)),
        );
  // Stable for one civil day, but rotates across users/days instead of always
  // favoring the first catalog entry.
  const dailySeed = `${user.id}:${new Date().toISOString().slice(0, 10)}`;
  const seedValue = [...dailySeed].reduce(
    (sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
  const suggestedTest = pool[seedValue % pool.length];
  const suggestedArticles = pickDailyArticles(publishedArticles, seedValue);

  if (noChart) {
    return (
      <NoChartDashboard
        locale={locale}
        firstName={firstName}
        restricted={restricted}
        moonPhase={moonPhase}
        articles={suggestedArticles}
        suggestedTest={suggestedTest}
        testsAllCompleted={unfinished.length === 0}
      />
    );
  }
  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-x-clip bg-background"
    >
      <Starfield count={48} />

      <AppHeader authed active="today" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        {restricted && <RestrictedNotice locale={locale} />}
        <header className="mb-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/70 px-5 py-2.5 sm:px-6">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--vivida-gold)]">
              <span className="inline-block size-1.5 rounded-full bg-[var(--vivida-gold)]" />
              {en
                ? "PERSONAL OBSERVATORY · EPHEMERIS WORKSPACE"
                : "პირადი ობსერვატორია · ეფემერიდების სივრცე"}
            </div>
            <div className="font-mono text-xs tabular-nums text-muted-foreground">
              {new Date().toISOString().slice(0, 10)} · UTC+4
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {en ? "Welcome," : "სალამი,"}{" "}
                <span className="text-primary">{firstName}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {en
                  ? "Today's sky transits calibrated against your natal coordinates."
                  : "დღევანდელი ცის ტრანზიტები შენი ნატალური რუკის კოორდინატებით."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/report"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/25"
              >
                {en ? "Natal Chart" : "ჩემი რუკა"} →
              </Link>
              <Link
                href="/synastry"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/10 px-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--vivida-pink)] transition-colors hover:border-[var(--vivida-pink)]/60 hover:bg-[var(--vivida-pink)]/20"
              >
                {en ? "Synastry" : "თავსებადობა"}
              </Link>
              <Link
                href="/taro"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--vivida-cyan)] transition-colors hover:border-[var(--vivida-cyan)]/60 hover:bg-[var(--vivida-cyan)]/20"
              >
                {en ? "Tarot" : "ტარო"}
              </Link>
            </div>
          </div>
        </header>

        <DailyDashboard userId={user.id} locale={locale} />

        {/* Tarot + Ask Astrologer stay one tap away below the daily briefing */}
        <div className="mt-8">
          <PopularTools locale={locale} placement="dashboard_top" />
        </div>

        {shouldShowPurchasePromotion({
          isPremium: userRow?.isPremium ?? false,
          balance,
        }) && (
          <div className="mt-8">
            <DashboardBillingNudge
              locale={locale}
              countryCode={userRow?.countryCode}
            />
          </div>
        )}

        <DashboardArticleRecommendations
          articles={suggestedArticles}
          locale={locale}
        />

        {suggestedTest && (
          <DashboardTestPromo
            test={suggestedTest}
            allCompleted={unfinished.length === 0}
            locale={locale}
          />
        )}
      </section>
    </main>
  );
}
