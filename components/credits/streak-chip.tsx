"use client";

import Link from "next/link";
import { Flame } from "lucide-react";

import type { StreakProgress } from "@/lib/streak-credits";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

/**
 * Compact one-line streak pill for the dashboard header — a small
 * loss-aversion nudge. The full flame + repeatable weekly-cycle card lives on
 * /credits; this links there.
 */
export function StreakChip({
  progress,
  locale = "ka",
}: {
  progress: StreakProgress;
  locale?: "ka" | "en";
}) {
  const { current, next, todayComplete, cycle } = progress;
  const en = locale === "en";
  /** Spelled out for the tooltip + screen readers; the pill itself stays terse. */
  const reward = en
    ? `${next.daysLeft} more day${next.daysLeft === 1 ? "" : "s"} in a row earns +${next.credits} credits.`
    : `კიდევ ${next.daysLeft} დღე ზედიზედ და მიიღებ +${next.credits} კრედიტს.`;
  return (
    <Link
      href="/credits"
      onClick={() =>
        trackEvent(ANALYTICS_EVENT.streakOpened, {
          current,
          next_days: next?.days ?? null,
        })
      }
      title={reward}
      aria-label={
        en
          ? `${current}-day ritual streak. ${reward}`
          : `რიტუალის სერია: ${current} დღე. ${reward}`
      }
      className="group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/8 px-2.5 py-0.5 text-xs font-medium ring-1 ring-foreground/5 transition-colors hover:bg-[var(--vivida-gold)]/14"
    >
      <Flame className="size-3.5 shrink-0 text-[var(--vivida-gold)]" />
      <span className="tabular-nums text-foreground">
        {current > 0
          ? en
            ? `${current}-day streak`
            : `სერია: ${current} დღე`
          : en
            ? "Start a streak"
            : "დაიწყე სერია"}
      </span>
      {cycle.rewardEarnedToday ? (
        <span className="text-[var(--vivida-gold)]">
          {en ? `· +${next.credits} credits!` : `· +${next.credits} კრედიტი!`}
        </span>
      ) : !todayComplete ? (
        <span className="text-muted-foreground">
          {en ? "· Finish today" : "· დაასრულე დღეს"}
        </span>
      ) : (
        <span className="hidden text-muted-foreground sm:inline">
          {en
            ? `· +${next.credits} in ${next.daysLeft}d`
            : `· +${next.credits} კრედიტი ${next.daysLeft} დღეში`}
        </span>
      )}
    </Link>
  );
}
