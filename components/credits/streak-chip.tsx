import Link from "next/link";
import { Flame } from "lucide-react";

import type { StreakProgress } from "@/lib/streak-credits";

/**
 * Compact one-line streak pill for the dashboard header — a small
 * loss-aversion nudge. The full flame + reward-ladder card (StreakCard) lives
 * on /credits; this links there.
 */
export function StreakChip({ progress }: { progress: StreakProgress }) {
  const { current, next } = progress;
  const daysLeft = next ? Math.max(0, next.days - current) : 0;
  return (
    <Link
      href="/credits"
      className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/8 px-3 py-1 text-xs font-medium ring-1 ring-foreground/5 transition-colors hover:bg-[var(--vivida-gold)]/14 sm:text-sm"
    >
      <Flame className="size-3.5 shrink-0 text-[var(--vivida-gold)]" />
      <span className="tabular-nums text-foreground">
        {current}-დღიანი სერია
      </span>
      {daysLeft > 0 && next ? (
        <span className="text-muted-foreground">
          · კიდევ {daysLeft} დღე +{next.credits}
        </span>
      ) : next ? (
        <span className="text-[var(--vivida-gold)]">· დღეს ჯილდო!</span>
      ) : null}
    </Link>
  );
}
