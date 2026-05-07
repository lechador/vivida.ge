"use client";

import Link from "next/link";

import type { DiscoverCard } from "@/lib/discover";
import { SuggestedPersonCard } from "./suggested-person-card";

/**
 * Horizontal scroll rail of the most compatible public-profile users.
 * The card thumbnails already make it obvious these are people, so we
 * skip a section title — keeps the dashboard scannable when the rail
 * lives at the top of the page.
 */
export function SuggestedPeopleRail({
  suggestions,
}: {
  suggestions: DiscoverCard[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex justify-end">
        <Link
          href="/discover"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ყველა →
        </Link>
      </div>

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
