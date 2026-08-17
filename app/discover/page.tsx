import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";

import { SOCIAL_FEATURES } from "@/lib/social-flags";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SwipeDeck } from "@/components/discover/swipe-deck";
import { requireUser } from "@/lib/auth-helpers";
import { getDiscoveryFeed, type DiscoverCard } from "@/lib/discover";
import { getUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: (await getRequestLocale()) !== "ka" ? "Discover" : "აღმოაჩინე",
  };
}
export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  // Swipe/match deck is flag-gated off at low user density. Route preserved;
  // bounce to the dashboard so the entry point degrades gracefully (no 404).
  if (!SOCIAL_FEATURES.swipeDeck) redirect("/dashboard");
  const user = await requireUser();
  const [feed, locale] = await Promise.all([
    getDiscoveryFeed(user.id),
    getUserLocale(user.id),
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
    <main
      lang={locale}
      data-no-body-bottom-pad
      className="relative isolate flex h-[100dvh] flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.30_0.15_220/0.4),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.34_0.16_350/0.35),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />

      <AppHeader authed active="discover" />

      <section className="relative z-10 mx-auto flex w-full min-h-0 max-w-md flex-1 flex-col px-3 pb-[calc(4.5rem+max(env(safe-area-inset-bottom),0.25rem))] pt-2 sm:max-w-2xl sm:px-6 sm:pb-6 lg:pb-8">
        {stack.length === 0 ? (
          <EmptyState hasElement={!!feed.viewerElement} locale={locale} />
        ) : (
          <SwipeDeck cards={stack} locale={locale} />
        )}
      </section>
    </main>
  );
}

function EmptyState({
  hasElement,
  locale,
}: {
  hasElement: boolean;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
      <Compass className="mx-auto mb-3 size-8 text-muted-foreground" />
      <h2 className="text-lg font-semibold">
        {am ? "Դեռ ոչինչ չկա" : en ? "Nothing here yet" : "ჯერ ცარიელია"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {hasElement
          ? en
            ? "There are no other public profiles yet. Check back soon — the sky changes."
            : "სხვა საჯარო პროფილები ჯერ არ არიან. დაბრუნდი ცოტა ხანში — ცა იცვლება."
          : en
            ? "Add your birth details to discover compatible people."
            : "შეავსე დაბადების მონაცემები, რომ აღმოაჩინო შენთან თავსებადი ხალხი."}
      </p>
      {!hasElement && (
        <Button asChild variant="mystic" className="mt-4">
          <Link href="/onboarding">
            {am ? "Ավելացնել մանրամասներ" : en ? "Add details" : "შეავსე ახლავე"}
          </Link>
        </Button>
      )}
    </div>
  );
}
