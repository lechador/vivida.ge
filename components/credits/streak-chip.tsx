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
  return (
    <Link
      href="/credits"
      onClick={() =>
        trackEvent(ANALYTICS_EVENT.streakOpened, {
          current,
          next_days: next?.days ?? null,
        })
      }
      className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/8 px-3 py-1 text-xs font-medium ring-1 ring-foreground/5 transition-colors hover:bg-[var(--vivida-gold)]/14 sm:text-sm"
    >
      <Flame className="size-3.5 shrink-0 text-[var(--vivida-gold)]" />
      <span className="tabular-nums text-foreground">
        {current > 0
          ? en
            ? `${current}-day ritual streak`
            : `${current}-დღიანი რიტუალის სერია`
          : en
            ? "Start your ritual streak"
            : "დაიწყე რიტუალის სერია"}
      </span>
      {cycle.rewardEarnedToday ? (
        <span className="text-[var(--vivida-gold)]">
          {en ? "· Weekly reward!" : "· კვირის ჯილდო!"}
        </span>
      ) : !todayComplete ? (
        <span className="text-muted-foreground">
          {en ? "· Complete today" : "· დაასრულე დღეს"}
        </span>
      ) : (
        <span className="text-muted-foreground">
          {en
            ? `· ${next.daysLeft} more day${next.daysLeft === 1 ? "" : "s"} +${next.credits}`
            : `· კიდევ ${next.daysLeft} დღე +${next.credits}`}
        </span>
      )}
    </Link>
  );
}
