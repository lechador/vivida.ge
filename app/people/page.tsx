import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-helpers";
import { listPeople } from "@/lib/people";
import { SOCIAL_FEATURES } from "@/lib/social-flags";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { PeopleList } from "@/components/people/people-list";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: (await getRequestLocale()) !== "ka" ? "People" : "ხალხი",
  };
}
export const dynamic = "force-dynamic";

/**
 * Public-profile directory. Thin Facebook-style row per user (avatar,
 * name, @handle, bio, friend action). Sorted by signup recency so
 * fresh joiners surface; search filters by name/handle. Auth-gated
 * so we don't expose the directory to scrapers.
 */
export default async function PeoplePage() {
  // Public people directory is flag-gated off at low user density. Route
  // preserved; bounce to the dashboard so the link degrades gracefully.
  if (!SOCIAL_FEATURES.peopleDirectory) redirect("/dashboard");
  const user = await requireUser();
  const [firstPage, locale] = await Promise.all([
    listPeople(user.id, { limit: 30 }),
    getUserLocale(user.id),
  ]);
  const en = locale !== "ka";

  return (
    <main lang={locale} className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%)]"
      />
      <Starfield count={90} shooting={2} />

      <AppHeader authed active="people" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {en ? "Community" : "საზოგადოება"}
        </div>
        <h1 className="mb-6 text-balance text-3xl font-semibold tracking-tight sm:mb-8 sm:text-4xl">
          {en ? "People " : "ხალხი "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {en ? "on Vivida" : "ვივიდაზე"}
          </span>
        </h1>

        <PeopleList
          initial={firstPage.rows}
          initialCursor={firstPage.nextCursor}
          locale={locale}
        />
      </section>
    </main>
  );
}
