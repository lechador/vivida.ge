import { eq } from "drizzle-orm";

import { db } from "@/db";
import { bigFiveResults, eqResults, iqResults, mbtiTestResults, profiles, users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { isAccountRestricted } from "@/lib/restriction";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { AstroLockedMain } from "@/components/astro/astro-locked-main";
import { DailyDashboard } from "@/components/dashboard/daily-dashboard";
import { PushOptIn } from "@/components/push/push-opt-in";
import { RestrictedNotice } from "@/components/safety/restricted-notice";
import { DashboardTestPromo } from "@/components/dashboard/test-promo-widget";
import { TESTS } from "@/lib/tests-catalog";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "en" ? "Today" : "დღეს" };
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [[profile], [userRow], [mbtiResult], [iqResult], [eqResult], [bigFiveResult]] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    db
      .select({ locale: users.interfaceLanguage })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
    db.select({ id: mbtiTestResults.id }).from(mbtiTestResults).where(eq(mbtiTestResults.userId, user.id)).limit(1),
    db.select({ id: iqResults.id }).from(iqResults).where(eq(iqResults.userId, user.id)).limit(1),
    db.select({ id: eqResults.id }).from(eqResults).where(eq(eqResults.userId, user.id)).limit(1),
    db.select({ id: bigFiveResults.id }).from(bigFiveResults).where(eq(bigFiveResults.userId, user.id)).limit(1),
  ]);
  const locale = await getRequestLocale(normalizeUserLocale(userRow?.locale));
  const en = locale !== "ka";

  if (!profile?.dateOfBirth) {
    return (
      <AstroLockedMain
        active="today"
        title={en ? "Your daily horoscope needs a natal chart" : "დღიური ჰოროსკოპი ნატალურ რუკას საჭიროებს"}
        description={en ? "Add your birth details to receive a personalized horoscope and sky overview every day." : "შეავსე დაბადების მონაცემები და ყოველ დღე მიიღებ პერსონალურ ჰოროსკოპსა და ცის მიმოხილვას."}
        next="/dashboard"
        locale={locale}
      />
    );
  }

  const restricted = await isAccountRestricted(user.id);
  const firstName = user.name?.split(" ")[0] ?? (en ? "stargazer" : "ვარსკვლავო");
  const completed = new Set([
    ...(mbtiResult ? ["astro-mbti"] : []),
    ...(iqResult ? ["iq"] : []),
    ...(eqResult ? ["eq"] : []),
    ...(bigFiveResult ? ["big-five"] : []),
  ]);
  const primaryTests = TESTS.filter((test) => test.available && test.kind === "featured");
  const unfinished = primaryTests.filter((test) => !completed.has(test.slug));
  const pool = unfinished.length > 0 ? unfinished : TESTS.filter((test) => test.available && test.kind === "quiz");
  // Stable for one civil day, but rotates across users/days instead of always
  // favoring the first catalog entry.
  const dailySeed = `${user.id}:${new Date().toISOString().slice(0, 10)}`;
  const seedValue = [...dailySeed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 0);
  const suggestedTest = pool[seedValue % pool.length];

  return (
    <main lang={locale} className="relative isolate flex flex-1 flex-col overflow-hidden">
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
        <h1 className="mb-6 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          {en ? "Hello," : "სალამი,"}{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>

        {/* Soft prompt to enable daily push — hides itself once enabled,
            unsupported, or dismissed. */}
        <PushOptIn variant="banner" locale={locale} />

        {/* DailyDashboard is a client component — it fetches the heavy AI
            data via a server action after first paint, so the response
            stream closes immediately and the browser tab spinner stops.
            Our internal CosmicLoader covers the AI generation window. */}
        <DailyDashboard userId={user.id} locale={locale} />

        {suggestedTest && (
          <DashboardTestPromo test={suggestedTest} allCompleted={unfinished.length === 0} locale={locale} />
        )}
      </section>
    </main>
  );
}
