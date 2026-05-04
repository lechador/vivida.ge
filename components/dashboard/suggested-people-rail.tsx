import Link from "next/link";

import { getDashboardSuggestions } from "@/lib/suggestions";
import { SuggestedPersonCard } from "./suggested-person-card";

/**
 * Horizontal scroll rail of the most compatible public-profile users.
 * Renders nothing if there are no candidates (e.g. brand-new instance,
 * or every public user is already a connection).
 */
export async function SuggestedPeopleRail({ userId }: { userId: string }) {
  const suggestions = await getDashboardSuggestions(userId, 8);
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
