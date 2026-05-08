"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { DiscoverCard } from "@/lib/discover";
import { cn } from "@/lib/utils";
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const left = el.scrollLeft;
      const max = el.scrollWidth - el.clientWidth;
      setCanLeft(left > 4);
      setCanRight(left < max - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [suggestions.length]);

  if (suggestions.length === 0) return null;

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Scroll by ~3 cards. clientWidth * 0.7 lands in that zone for both
    // mobile (small viewport) and desktop (wide rail).
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

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

      <div className="relative">
        {/* Desktop chevron buttons — fade in only when there's overflow on
            that side. Hidden below sm because thumb-scrolling is natural. */}
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label="უკან"
          className={cn(
            "absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 p-2 text-foreground shadow-lg backdrop-blur transition-opacity hover:bg-background sm:flex",
            canLeft ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label="წინ"
          className={cn(
            "absolute right-0 top-1/2 z-10 hidden translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 p-2 text-foreground shadow-lg backdrop-blur transition-opacity hover:bg-background sm:flex",
            canRight ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <ChevronRight className="size-4" />
        </button>

        {/* Edge fades — visible only while there's content past the edge. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-background to-transparent transition-opacity",
            canLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-background to-transparent transition-opacity",
            canRight ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Negative margin lets the rail bleed to the screen edge on mobile so
            cards feel like they continue past the viewport. snap-x for natural
            tactile scrolling on touch. */}
        <div
          ref={scrollerRef}
          className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6"
        >
          {suggestions.map((person) => (
            <SuggestedPersonCard key={person.userId} person={person} />
          ))}
        </div>
      </div>
    </section>
  );
}
