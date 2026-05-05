"use client";

import Link from "next/link";

import type { DiscoverCard } from "@/lib/discover";
import { SuggestedPersonCard } from "./suggested-person-card";

/**
 * Horizontal scroll rail of the most compatible public-profile users.
 * Suggestions are prefetched server-side (see actions/dashboard.ts) and
 * passed in — keeps this component pure-render so it can live inside
 * the client-side dashboard wrapper.
 */
export function SuggestedPeopleRail({
  suggestions,
}: {
  suggestions: DiscoverCard[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ცის თავსებადი ხალხი
        </h2>
        <Link
          href="/discover"
          className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ყველა →
        </Link>
      </header>

      {/* Negative margin lets the rail bleed to the screen edge on mobile so
          cards feel like they continue past the viewport. snap-x for natural
          tactile scrolling on touch. */}
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6">
        {suggestions.map((person) => (
          <SuggestedPersonCard key={person.userId} person={person} />
        ))}
      </div>
    </section>
  );
}
