import { Check, Flame, Lock, Sparkles, Trophy } from "lucide-react";

import type { StreakProgress } from "@/lib/streak-credits";
import { cn } from "@/lib/utils";

/**
 * Visit-streak overview for /credits. The card keeps the three decisions a
 * user cares about in order: where they are, what comes next, and which reward
 * tiers they have already collected.
 */
export function StreakCard({ progress }: { progress: StreakProgress }) {
  const { current, longest, milestones, next } = progress;
  const daysLeft = next ? Math.max(0, next.days - current) : 0;
  const pct = next ? Math.min(100, Math.max(0, (current / next.days) * 100)) : 100;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--vivida-gold)]/30 bg-gradient-to-br from-[var(--vivida-gold)]/12 via-card/65 to-[var(--vivida-pink)]/10 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div
        aria-hidden
        className="absolute -right-20 -top-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.8_0.16_60/0.32),transparent_68%)] blur-2xl"
      />

      <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
            <Flame className="size-4" />
            ყოველდღიური სერია
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            შემოდი ყოველდღე, აიღე ჯილდოები
          </h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--vivida-gold)]/25 bg-[var(--vivida-gold)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--vivida-gold)]">
          {current > 0 ? <Check className="size-3" /> : <Flame className="size-3" />}
          {current > 0 ? "დღევანდელი ვიზიტი" : "დაიწყე სერია დღეს"}
        </span>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-[0.9fr_1.35fr]">
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-background/35 p-4">
          <div className="relative grid size-20 shrink-0 place-items-center">
            <div className="absolute inset-2 rounded-full bg-[var(--vivida-gold)]/20 blur-lg" />
            <Flame className="relative size-20 fill-[var(--vivida-gold)]/25 text-[var(--vivida-gold)] drop-shadow-[0_0_14px_oklch(0.8_0.16_60/0.55)]" />
            <span className="absolute inset-0 grid place-items-center pt-2 text-2xl font-black tabular-nums text-background">
              {current}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight tabular-nums">
              {current} დღე
            </div>
            <div className="text-sm text-muted-foreground">მიმდინარე სერია</div>
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-foreground/75">
              <Trophy className="size-3.5 text-[var(--vivida-gold)]" />
              რეკორდი: <strong className="font-semibold tabular-nums">{longest} დღე</strong>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--vivida-gold)]/25 bg-[var(--vivida-gold)]/8 p-4">
          {next ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    შემდეგი ჯილდო
                  </div>
                  <div className="mt-1 text-base font-semibold">
                    {daysLeft > 0 ? `კიდევ ${daysLeft} დღე` : "ჯილდო მზადაა"}
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--vivida-gold)]/15 px-3 py-2 text-right">
                  <div className="flex items-center gap-1 text-lg font-bold tabular-nums text-[var(--vivida-gold)]">
                    <Sparkles className="size-4" />+{next.credits}
                  </div>
                  <div className="text-[10px] text-muted-foreground">კრედიტი</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
                  <span>{current} დღე</span>
                  <span>მიზანი: {next.days} დღე</span>
                </div>
                <div
                  className="h-3 overflow-hidden rounded-full bg-foreground/10"
                  role="progressbar"
                  aria-label={`პროგრესი ${next.days}-დღიან ჯილდომდე`}
                  aria-valuemin={0}
                  aria-valuemax={next.days}
                  aria-valuenow={Math.min(current, next.days)}
                >
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-gold),var(--vivida-pink))] shadow-[0_0_14px_var(--vivida-gold)] transition-[width]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-28 items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-[var(--vivida-gold)]/15">
                <Trophy className="size-6 text-[var(--vivida-gold)]" />
              </div>
              <div>
                <div className="font-semibold">ყველა ჯილდო მიღებულია</div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  ყოველდღიური სერია მაინც გააგრძელე — ახალი რეკორდისთვის.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ჯილდოების გზა
          </div>
          <div className="text-[11px] text-muted-foreground">
            თითოეული ჯილდო ერთხელ გაიცემა
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {milestones.map((milestone) => {
            const isNext = next?.days === milestone.days;
            return (
              <div
                key={milestone.days}
                className={cn(
                  "relative flex min-h-20 items-center gap-2.5 rounded-2xl border px-3 py-2.5",
                  milestone.claimed
                    ? "border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/10"
                    : isNext
                      ? "border-[var(--vivida-gold)]/55 bg-[var(--vivida-gold)]/12 ring-1 ring-[var(--vivida-gold)]/25"
                      : "border-border/55 bg-background/30"
                )}
              >
                <div
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    milestone.claimed
                      ? "bg-[var(--vivida-cyan)]/18 text-[var(--vivida-cyan)]"
                      : isNext
                        ? "bg-[var(--vivida-gold)]/18 text-[var(--vivida-gold)]"
                        : "bg-foreground/5 text-muted-foreground/70"
                  )}
                >
                  {milestone.claimed ? (
                    <Check className="size-4" />
                  ) : isNext ? (
                    <Flame className="size-4" />
                  ) : (
                    <Lock className="size-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold tabular-nums">{milestone.days} დღე</div>
                  <div
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      milestone.claimed
                        ? "text-[var(--vivida-cyan)]"
                        : isNext
                          ? "text-[var(--vivida-gold)]"
                          : "text-muted-foreground"
                    )}
                  >
                    +{milestone.credits} კრედიტი
                  </div>
                </div>
                {isNext && (
                  <span className="absolute right-2 top-1.5 text-[8px] font-bold uppercase tracking-wider text-[var(--vivida-gold)]">
                    შემდეგი
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="relative mt-3 text-xs leading-relaxed text-muted-foreground">
        სერია გრძელდება, როცა Vivida-ში ყოველ კალენდარულ დღეს ერთხელ მაინც შემოდიხარ.
      </p>
    </section>
  );
}
