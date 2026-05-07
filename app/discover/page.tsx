import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SwipeDeck } from "@/components/discover/swipe-deck";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { getDiscoveryFeed, type DiscoverCard } from "@/lib/discover";

export const metadata = { title: "აღმოაჩინე" };
export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const user = await requireUser();
  const [plan, feed] = await Promise.all([
    getCurrentPlan(user.id),
    getDiscoveryFeed(user.id),
  ]);

  // Flatten the feed into a single ranked stack: spotlight first
  // (highest synastry), then the user's tribe, then magic, then the
  // rest. Compatibility score breaks ties so the strongest matches
  // surface first regardless of element bucket.
  const stack: DiscoverCard[] = [];
  if (feed.spotlight) stack.push(feed.spotlight.card);
  for (const arr of [feed.tribe, feed.magic, feed.other]) {
    for (const card of arr) {
      if (!stack.some((c) => c.userId === card.userId)) stack.push(card);
    }
  }
  stack.sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0));

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.30_0.15_220/0.4),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.34_0.16_350/0.35),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />

      <AppHeader authed plan={plan} active="discover" />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          აღმოაჩინე
        </div>
        <h1 className="mb-6 text-balance text-2xl font-semibold tracking-tight sm:text-4xl">
          გადაიტანე{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            შენი ცა
          </span>
        </h1>

        {stack.length === 0 ? (
          <EmptyState hasElement={!!feed.viewerElement} />
        ) : (
          <SwipeDeck cards={stack} />
        )}
      </section>
    </main>
  );
}

function EmptyState({ hasElement }: { hasElement: boolean }) {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
      <Compass className="mx-auto mb-3 size-8 text-muted-foreground" />
      <h2 className="text-lg font-semibold">ჯერ ცარიელია</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {hasElement
          ? "სხვა საჯარო პროფილები ჯერ არ არიან. დაბრუნდი ცოტა ხანში — ცა იცვლება."
          : "შეავსე დაბადების მონაცემები, რომ აღმოაჩინო შენთან თავსებადი ხალხი."}
      </p>
      {!hasElement && (
        <Button asChild variant="mystic" className="mt-4">
          <Link href="/onboarding">შეავსე ახლავე</Link>
        </Button>
      )}
    </div>
  );
}
