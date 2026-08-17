/**
 * "ხშირი ძიებები" / popular-searches strip rendered at the bottom of
 * public zodiac pages. Surfaces Latin-letter Georgian queries (e.g.
 * "vercis horoskopi", "tavsebadoba") so Google can match those queries
 * to the page — Georgians often search without switching keyboard
 * layout, and our pure-Georgian copy was missing them entirely.
 *
 * Server component, render-only — no hydration cost.
 */

import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function PopularSearches({
  queries,
  title,
  className,
  locale = "ka",
}: {
  queries: string[];
  title?: string;
  className?: string;
  locale?: UserLocale;
}) {
  if (queries.length === 0) return null;
  return (
    <section
      className={cn(
        "mt-14 rounded-2xl border border-border/60 bg-card/40 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6",
        className
      )}
      aria-labelledby="popular-searches-heading"
    >
      <h2
        id="popular-searches-heading"
        className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
      >
        {title ??
          (locale === "am"
            ? "Հաճախակի որոնումներ"
            : locale === "en"
            ? "Popular searches"
            : "ხშირი ძიებები")}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {queries.map((q, i) => (
          <li
            key={i}
            className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-foreground/80"
          >
            {q}
          </li>
        ))}
      </ul>
    </section>
  );
}
