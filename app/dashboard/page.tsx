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
import { AstroLockedMain } from "@/components/astro/astro-locked-main";
import { DailyDashboard } from "@/components/dashboard/daily-dashboard";
import { NoChartDashboard } from "@/components/dashboard/no-chart-dashboard";
import { PushOptIn } from "@/components/push/push-opt-in";
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
import {
  getRequestLocale,
  requestIsEnglishHost,
} from "@/lib/i18n/request-locale";
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

  // English host: an account without birth details still gets a filled
  // dashboard (chart-free data + prompts) instead of a full-page wall. The
  // Georgian host keeps the original locked shell.
  const englishHost = await requestIsEnglishHost();
  const noChart = !profile?.dateOfBirth;

  if (noChart && !englishHost) {
    return (
      <AstroLockedMain
        active="today"
        title={
          en
            ? "Your daily horoscope needs a natal chart"
            : "დღიური ჰოროსკოპი ნატალურ რუკას საჭიროებს"
        }
        description={
          en
            ? "Add your birth details to receive a personalized horoscope and sky overview every day."
            : "შეავსე დაბადების მონაცემები და ყოველ დღე მიიღებ პერსონალურ ჰოროსკოპსა და ცის მიმოხილვას."
        }
        next="/dashboard"
        locale={locale}
      />
    );
  }

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

        <DailyDashboard userId={user.id} locale={locale} />

        {/* Tarot + AI stay one tap away, below the delivered daily value. */}
        <div className="mt-8">
          <PopularTools locale={locale} placement="dashboard_top" />
        </div>

        {/* Soft prompt to enable daily push — hides itself once enabled,
            unsupported, or dismissed. */}
        <PushOptIn variant="banner" locale={locale} />

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
