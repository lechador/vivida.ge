"use client";

import { useState, useTransition } from "react";

import { reactToPost } from "@/actions/feed";
import type { PostReactionKind } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { FeedReactionCounts } from "@/actions/feed";

import { REACTIONS, ReactionIcon, REACTION_BY_KIND } from "./reaction-icons";

/**
 * Strip of four reaction buttons with live counts. Optimistic update on
 * click — the local state moves immediately, the server action settles
 * the truth in the background. If the action fails we roll back and
 * surface no error (reactions are low-stakes; users will just notice
 * the count snap back).
 */
export function ReactionBar({
  postId,
  initialCounts,
  initialMine,
}: {
  postId: string;
  initialCounts: FeedReactionCounts;
  initialMine: PostReactionKind | null;
}) {
  const [counts, setCounts] = useState<FeedReactionCounts>(initialCounts);
  const [mine, setMine] = useState<PostReactionKind | null>(initialMine);
  const [pending, startTransition] = useTransition();

  function onClick(kind: PostReactionKind) {
    if (pending) return;

    // Optimistic: figure out the next state locally first.
    const prevCounts = counts;
    const prevMine = mine;
    const nextCounts: FeedReactionCounts = { ...counts };
    let nextMine: PostReactionKind | null;

    if (mine === kind) {
      nextCounts[kind] = Math.max(0, nextCounts[kind] - 1);
      nextMine = null;
    } else {
      if (mine) nextCounts[mine] = Math.max(0, nextCounts[mine] - 1);
      nextCounts[kind] = nextCounts[kind] + 1;
      nextMine = kind;
    }
    setCounts(nextCounts);
    setMine(nextMine);

    startTransition(async () => {
      const res = await reactToPost(postId, kind);
      if (!res.ok) {
        setCounts(prevCounts);
        setMine(prevMine);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REACTIONS.map((r) => {
        const count = counts[r.kind];
        const active = mine === r.kind;
        return (
          <button
            key={r.kind}
            type="button"
            onClick={() => onClick(r.kind)}
            aria-label={r.labelKa}
            aria-pressed={active}
            title={r.labelKa}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs tabular-nums transition-all",
              active
                ? "border-transparent text-foreground shadow-[0_0_18px_-6px_var(--reaction-hue)]"
                : "border-border/60 bg-card/30 text-muted-foreground hover:border-foreground/20 hover:bg-card/60 hover:text-foreground"
            )}
            style={
              {
                ["--reaction-hue" as string]: r.hue,
                backgroundColor: active
                  ? `color-mix(in oklch, ${r.hue} 18%, transparent)`
                  : undefined,
                borderColor: active
                  ? `color-mix(in oklch, ${r.hue} 45%, transparent)`
                  : undefined,
                color: active ? r.hue : undefined,
              } as React.CSSProperties
            }
          >
            <ReactionIcon
              kind={r.kind}
              active={active}
              size={18}
              className={active ? "" : "transition-transform group-hover:-translate-y-0.5"}
            />
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Tiny presentation-only summary — used by post-card subtitle when the
 *  full reaction bar is too noisy. Currently unused but exported for
 *  future inline summaries (e.g. comment-detail headers). */
export function ReactionSummary({ counts }: { counts: FeedReactionCounts }) {
  const total =
    counts.like + counts.dislike + counts.funny + counts.sad;
  if (total === 0) return null;
  const top = REACTIONS.slice()
    .sort((a, b) => counts[b.kind] - counts[a.kind])
    .slice(0, 3)
    .filter((r) => counts[r.kind] > 0);
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <div className="flex -space-x-1">
        {top.map((r) => (
          <span
            key={r.kind}
            className="grid size-4 place-items-center rounded-full ring-1 ring-background"
            style={{
              backgroundColor: `color-mix(in oklch, ${
                REACTION_BY_KIND[r.kind].hue
              } 35%, var(--background))`,
            }}
          >
            <ReactionIcon kind={r.kind} size={10} active />
          </span>
        ))}
      </div>
      <span>{total}</span>
    </div>
  );
}
