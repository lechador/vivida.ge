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
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
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

  const [plan, posts, reputation] = await Promise.all([
    getCurrentPlan(user.id),
    listFeed({ limit: 30 }),
    getReputation(user.id),
  ]);
  const viewerIsAdmin = isAdminEmail(user.email);
  const viewerSunSign = sunSignFromDob(viewerProfile.dateOfBirth);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%)]"
      />
      <Starfield count={100} shooting={2} />

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

        <div className="mb-6">
          <PostComposer
            authorImage={user.image ?? null}
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
