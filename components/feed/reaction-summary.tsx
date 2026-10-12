import type { FeedReactionCounts } from "@/actions/feed";
import type { UserLocale } from "@/lib/i18n/user-locale";

import { ReactionIcon, REACTIONS } from "./reaction-icons";

/**
 * "👍❤ 10" Facebook-style summary line, stacked thumbnails of every
 * reaction that has at least one tally, followed by the total.
 *
 * Returns null when the post has no reactions at all so the row
 * collapses cleanly instead of leaving an empty stripe above the
 * action bar.
 */
export function ReactionSummary({
  counts,
  locale = "ka",
}: {
  counts: FeedReactionCounts;
  locale?: UserLocale;
}) {
  const total =
    counts.like + counts.dislike + counts.funny + counts.sad;
  if (total === 0) return null;

  // Show every reaction that's been used at least once, ordered by
  // count desc so the dominant reaction sits leftmost in the stack.
  const present = REACTIONS.slice()
    .filter((r) => counts[r.kind] > 0)
    .sort((a, b) => counts[b.kind] - counts[a.kind]);

  return (
    <div className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <div className="flex -space-x-1">
        {present.map((r) => (
          <span
            key={r.kind}
            className="grid size-[18px] place-items-center rounded-full ring-2 ring-card/95"
            style={{
              backgroundColor: `color-mix(in oklch, ${r.hue} 45%, var(--background))`,
            }}
            aria-label={locale !== "ka" ? r.labelEn : r.labelKa}
          >
            <ReactionIcon kind={r.kind} size={11} active />
          </span>
        ))}
      </div>
      <span className="tabular-nums text-foreground/85">{total}</span>
    </div>
  );
}
