import { Check, Flame, Lock, Sparkles } from "lucide-react";

import type { StreakProgress } from "@/lib/streak-credits";
import { cn } from "@/lib/utils";

/**
 * Visit-streak widget for /credits. A big flame with the running day count, a
 * progress bar to the next milestone, and the full reward ladder with claimed
 * tiers lit up. Pure presentational server component — data comes from
 * getStreakProgress().
 */
export function StreakCard({ progress }: { progress: StreakProgress }) {
  const { current, longest, milestones, next } = progress;

  // Progress toward the next unclaimed milestone. Base the bar on the previous
  // claimed tier so it fills across the current segment, not from zero.
  const prevDays = next
    ? [...milestones].reverse().find((m) => m.claimed && m.days < next.days)
        ?.days ?? 0
    : 0;
  const span = next ? next.days - prevDays : 1;
  const pct = next
    ? Math.min(100, Math.max(0, ((current - prevDays) / span) * 100))
    : 100;
  const daysLeft = next ? Math.max(0, next.days - current) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--vivida-gold)]/30 bg-gradient-to-br from-[var(--vivida-gold)]/10 via-card/60 to-[var(--vivida-pink)]/10 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div
        aria-hidden
        className="absolute -right-14 -top-14 size-44 rounded-full bg-[radial-gradient(circle,oklch(0.8_0.16_60/0.35),transparent_70%)] blur-2xl"
      />

      {/* Current streak */}
      <div className="relative flex items-center gap-4">
        <div className="relative grid size-16 shrink-0 place-items-center">
          <Flame className="size-16 text-[var(--vivida-gold)] drop-shadow-[0_0_12px_oklch(0.8_0.16_60/0.6)]" />
          <span className="absolute inset-0 grid place-items-center pt-1 text-lg font-bold tabular-nums text-background">
            {current}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-xl font-semibold tracking-tight">
            {current}-დღიანი სერია
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {daysLeft > 0 && next
              ? `კიდევ ${daysLeft} დღე — და +${next.credits} კრედიტი შენია`
              : next
                ? `დღეს +${next.credits} კრედიტი გელოდება!`
                : "ყველა საფეხური დაპყრობილია — შენ ლეგენდა ხარ ✨"}
          </p>
          {longest > current && (
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              რეკორდი: {longest} დღე
            </p>
          )}
        </div>
      </div>

      {/* Progress to next milestone */}
      {next && (
        <div className="relative mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>დღეს</span>
            <span className="inline-flex items-center gap-1 font-medium text-[var(--vivida-gold)]">
              <Sparkles className="size-3" />
              {next.days} დღე · +{next.credits}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-gold),var(--vivida-pink))] transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Reward ladder */}
      <div className="relative mt-5">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ჯილდოების საფეხურები
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {milestones.map((m) => {
            const isNext = next?.days === m.days;
            return (
              <div
                key={m.days}
                className={cn(
                  "flex min-w-[68px] shrink-0 flex-col items-center gap-1 rounded-2xl border px-2.5 py-2.5 text-center",
                  m.claimed
                    ? "border-[var(--vivida-cyan)]/45 bg-[var(--vivida-cyan)]/12"
                    : isNext
                      ? "border-[var(--vivida-gold)]/60 bg-[var(--vivida-gold)]/10 ring-1 ring-[var(--vivida-gold)]/40"
                      : "border-border/60 bg-background/40 opacity-70"
                )}
              >
                <div
                  className={cn(
                    "grid size-7 place-items-center rounded-full",
                    m.claimed
                      ? "bg-[var(--vivida-cyan)]/20 text-[var(--vivida-cyan)]"
                      : isNext
                        ? "bg-[var(--vivida-gold)]/20 text-[var(--vivida-gold)]"
                        : "bg-foreground/5 text-muted-foreground"
                  )}
                >
                  {m.claimed ? (
                    <Check className="size-3.5" />
                  ) : isNext ? (
                    <Flame className="size-3.5" />
                  ) : (
                    <Lock className="size-3" />
                  )}
                </div>
                <div className="text-xs font-semibold tabular-nums">
                  {m.days} დღე
                </div>
                <div
                  className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    m.claimed
                      ? "text-[var(--vivida-cyan)]"
                      : "text-muted-foreground"
                  )}
                >
                  +{m.credits}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          ყოველდღე შემოდი Vivida-ში — სერია არ გაწყდეს და კრედიტები დაგერიცხოს.
        </p>
      </div>
    </div>
  );
}
