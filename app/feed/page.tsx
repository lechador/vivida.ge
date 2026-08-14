import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";

import { listFeed } from "@/actions/feed";
import { requireUser } from "@/lib/auth-helpers";
import { isAdminEmail } from "@/lib/admin-auth";
import { getHeaderData } from "@/lib/header-cache";
import { getDashboardSuggestions } from "@/lib/suggestions";
import { SOCIAL_FEATURES } from "@/lib/social-flags";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { AstroProfileBanner } from "@/components/astro/astro-profile-banner";
import { SuggestedPeopleRail } from "@/components/dashboard/suggested-people-rail";
import { FeedList } from "@/components/feed/feed-list";
import { PostComposer } from "@/components/feed/post-composer";
import { PushOptIn } from "@/components/push/push-opt-in";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getRequestLocale()) === "en" ? "Feed" : "ფიდი" };
}
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await requireUser();

  // Feed is the post-signin home and needs no birth data (it's community
  // content), so it's open to everyone. Accounts without birth data see a
  // non-blocking banner to create their astro profile instead of being
  // force-funnelled through onboarding.
  const [viewerProfile] = await db
    .select({ dateOfBirth: profiles.dateOfBirth })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  const hasBirthData = !!viewerProfile?.dateOfBirth;

  const [posts, headerData, suggestions, locale] = await Promise.all([
    listFeed({ limit: 30 }),
    // Reuses the cached header lookup (also has avatarUrl), so showing
    // the viewer's chosen main photo in the composer doesn't add an
    // extra DB roundtrip — it's already memoised for the navbar.
    getHeaderData(user.id),
    // Same "people you'd vibe with" rail the dashboard uses. Flag-gated off
    // at low user density — skip the ranking query entirely when off.
    SOCIAL_FEATURES.suggestedPeopleRail
      ? getDashboardSuggestions(user.id, 8)
      : Promise.resolve([] as Awaited<ReturnType<typeof getDashboardSuggestions>>),
    getUserLocale(user.id),
  ]);
  const en = locale === "en";
  const viewerIsAdmin = isAdminEmail(user.email);
  const viewerSunSign = sunSignFromDob(viewerProfile?.dateOfBirth ?? null);
  const viewerAvatar = headerData.avatarUrl ?? user.image ?? null;

  return (
    <main lang={locale} className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%)]"
      />
      <Starfield count={100} shooting={2} />

      <AppHeader authed active="feed" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {en ? "Community" : "საზოგადოება"}
        </div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {en ? "Vivida " : "ვივიდას "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "feed" : "ფიდი"}
            </span>
          </h1>
        </div>

        {/* Soft daily-push prompt — hides itself once enabled/dismissed.
            Strongest same-day return trigger; also fires for feed visitors. */}
        <PushOptIn variant="banner" locale={locale} />

        {!hasBirthData && (
          <div className="mb-6">
            <AstroProfileBanner locale={locale} />
          </div>
        )}

        {/* People-you'd-vibe-with rail — flag-gated off at low user density
            (same switch as the dashboard rail). When off, the feed focuses on
            community posts only. */}
        {SOCIAL_FEATURES.suggestedPeopleRail && (
          <div className="mb-6">
            <SuggestedPeopleRail suggestions={suggestions} locale={locale} />
          </div>
        )}

        <div className="mb-6">
          <PostComposer authorImage={viewerAvatar} locale={locale} />
        </div>

        <FeedList
          initial={posts}
          viewerId={user.id}
          viewerIsAdmin={viewerIsAdmin}
          viewerSunSign={viewerSunSign}
          locale={locale}
        />
      </section>
    </main>
  );
}

/** Same sun-sign helper as actions/feed.ts. Duplicated here so the page
 *  can derive the viewer's sign without dragging the server-action
 *  module's deps into the page bundle. */
function sunSignFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const month = Number(m[2]);
  const day = Number(m[3]);
  const CUTOFFS: Array<[number, number, number]> = [
    [3, 21, 0],
    [4, 20, 1],
    [5, 21, 2],
    [6, 22, 3],
    [7, 23, 4],
    [8, 23, 5],
    [9, 23, 6],
    [10, 23, 7],
    [11, 22, 8],
    [12, 22, 9],
    [1, 20, 10],
    [2, 19, 11],
  ];
  for (const [cm, cd, idx] of CUTOFFS) {
    if (month === cm && day >= cd) return idx;
    if (month === cm + 1 && day < (CUTOFFS[(idx + 1) % 12]?.[1] ?? 31))
      return idx;
  }
  return (month + 9) % 12;
}
