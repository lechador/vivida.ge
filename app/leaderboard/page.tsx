import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { getLeaderboard, getUserReputationTotal } from "@/lib/leaderboard-core";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { TierBadge } from "@/components/feed/tier-badge";
import { tierFor } from "@/lib/tiers";

export const metadata = { title: "ლიდერბორდი" };
export const dynamic = "force-dynamic";

/**
 * Top users by reputation. Lives off `/feed` rather than getting its
 * own nav slot — it's a "where am I in the constellation" page, not a
 * primary destination. Surfaced from the FeedComposer footer link and
 * deep-linked from the tier-badge tooltip.
 */
export default async function LeaderboardPage() {
  const user = await requireUser();
  const plan = await getCurrentPlan(user.id);

  // Top 50 with their byline data + the viewer's own total. The shared core
  // resolves each avatar to the chosen main profile photo (OAuth fallback),
  // so this list matches /account, the navbar, and the mobile API.
  const [top, myTotal] = await Promise.all([
    getLeaderboard(50),
    getUserReputationTotal(user.id),
  ]);

  const myRankIndex = top.findIndex((row) => row.userId === user.id);
  const myRankLabel =
    myRankIndex === -1 ? null : `#${myRankIndex + 1}`;

  return (
    <main className="dawn relative isolate flex min-h-screen flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_-5%,oklch(0.90_0.06_290/0.6),transparent_70%),radial-gradient(40%_32%_at_85%_65%,oklch(0.90_0.08_45/0.5),transparent_70%),radial-gradient(35%_28%_at_15%_75%,oklch(0.91_0.07_350/0.45),transparent_70%)]"
      />
      <Starfield tone="dawn" count={90} shooting={2} />
      <AppHeader authed plan={plan} />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Trophy className="size-3.5" />
          ლიდერბორდი
        </div>
        <h1 className="mb-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          ცის{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            ვარსკვლავები
          </span>
        </h1>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          რეპუტაცია იზრდება პოსტებით, კომენტარებით, რეაქციებითა და მეგობრობით.
          რაც სხვები გამოეხმაურები შენს — მეტი ქულა.
        </p>

        <div className="mb-6">
          <TierBadge total={myTotal} variant="profile" />
          {myRankLabel && (
            <p className="mt-2 text-xs text-muted-foreground">
              შენი ადგილი: {myRankLabel} (50-დან)
            </p>
          )}
        </div>

        {top.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center text-sm text-muted-foreground">
            ჯერ არცერთი ქულა არ არის — იყავი პირველი ვინც დაიწყებს.
          </div>
        ) : (
          <ol className="space-y-2">
            {top.map((row, i) => {
              const display =
                row.displayName ??
                row.name?.split(" ")[0] ??
                row.username ??
                "ვარსკვლავო";
              const initial = display[0]?.toUpperCase() ?? "?";
              const tier = tierFor(row.total);
              const isMe = row.userId === user.id;
              const profileHref = row.username ? `/u/${row.username}` : null;
              const avatar = row.image;
              return (
                <li
                  key={row.userId}
                  className={`flex items-center gap-3 rounded-xl border p-3 ring-1 ring-foreground/5 backdrop-blur-xl ${
                    isMe
                      ? "border-[var(--vivida-violet)]/55 bg-[var(--vivida-violet)]/12"
                      : "border-border bg-card/55"
                  }`}
                >
                  <span className="w-7 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10 shrink-0 rounded-full border border-border/80 object-cover"
                    />
                  ) : (
                    <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-sm text-muted-foreground">
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="truncate text-sm font-medium text-foreground hover:text-[var(--vivida-violet)]"
                        >
                          {display}
                        </Link>
                      ) : (
                        <span className="truncate text-sm font-medium text-foreground">
                          {display}
                        </span>
                      )}
                      {row.username && (
                        <span className="truncate text-xs text-muted-foreground">
                          @{row.username}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-[11px]"
                      style={{ color: tier.hue }}
                    >
                      {tier.labelKa}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground/85">
                    {row.total}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
