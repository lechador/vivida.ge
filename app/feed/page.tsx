import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";

import { db } from "@/db";
import { profiles } from "@/db/schema";

import { listFeed } from "@/actions/feed";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { getReputation } from "@/lib/reputation";
import { isAdminEmail } from "@/lib/admin-auth";
import { getHeaderData } from "@/lib/header-cache";
import { getDashboardSuggestions } from "@/lib/suggestions";
import { SOCIAL_FEATURES } from "@/lib/social-flags";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SuggestedPeopleRail } from "@/components/dashboard/suggested-people-rail";
import { FeedList } from "@/components/feed/feed-list";
import { PostComposer } from "@/components/feed/post-composer";
import { TierBadge } from "@/components/feed/tier-badge";

export const metadata = { title: "ფიდი" };
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await requireUser();

  // Feed is the post-signin home, so first-time visitors hit it before
  // they've ever opened /onboarding. Bounce them through onboarding so
  // the chart and tier system have data to work with — same guard that
  // /dashboard runs.
  const [viewerProfile] = await db
    .select({ dateOfBirth: profiles.dateOfBirth })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (!viewerProfile?.dateOfBirth) {
    redirect("/onboarding");
  }

  const [plan, posts, reputation, headerData, suggestions] = await Promise.all([
    getCurrentPlan(user.id),
    listFeed({ limit: 30 }),
    getReputation(user.id),
    // Reuses the cached header lookup (also has avatarUrl), so showing
    // the viewer's chosen main photo in the composer doesn't add an
    // extra DB roundtrip — it's already memoised for the navbar.
    getHeaderData(user.id),
    // Same "people you'd vibe with" rail the dashboard uses. Flag-gated off
    // at low user density — skip the ranking query entirely when off.
    SOCIAL_FEATURES.suggestedPeopleRail
      ? getDashboardSuggestions(user.id, 8)
      : Promise.resolve([] as Awaited<ReturnType<typeof getDashboardSuggestions>>),
  ]);
  const viewerIsAdmin = isAdminEmail(user.email);
  const viewerSunSign = sunSignFromDob(viewerProfile.dateOfBirth);
  const viewerAvatar = headerData.avatarUrl ?? user.image ?? null;

  return (
    <main className="dawn relative isolate flex min-h-screen flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_-5%,oklch(0.90_0.06_290/0.6),transparent_70%),radial-gradient(40%_32%_at_85%_65%,oklch(0.90_0.08_45/0.5),transparent_70%),radial-gradient(35%_28%_at_15%_75%,oklch(0.91_0.07_350/0.45),transparent_70%)]"
      />
      <Starfield tone="dawn" count={100} shooting={2} />

      <AppHeader authed plan={plan} active="feed" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          საზოგადოება
        </div>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            ვივიდას{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ფიდი
            </span>
          </h1>
          <div className="flex flex-col items-end gap-1">
            <TierBadge total={reputation} variant="compact" />
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Trophy className="size-3" />
              ლიდერბორდი
            </Link>
          </div>
        </div>

        {/* People-you'd-vibe-with rail — flag-gated off at low user density
            (same switch as the dashboard rail). When off, the feed focuses on
            community posts only. */}
        {SOCIAL_FEATURES.suggestedPeopleRail && (
          <div className="mb-6">
            <SuggestedPeopleRail suggestions={suggestions} />
          </div>
        )}

        <div className="mb-6">
          <PostComposer
            authorImage={viewerAvatar}
            authorName={user.name ?? null}
          />
        </div>

        <FeedList
          initial={posts}
          viewerId={user.id}
          viewerIsAdmin={viewerIsAdmin}
          viewerSunSign={viewerSunSign}
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
