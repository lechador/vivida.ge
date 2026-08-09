import { Check, Flame, Sparkles, Trophy } from "lucide-react";

import type { StreakProgress } from "@/lib/streak-credits";
import { cn } from "@/lib/utils";

/** Repeatable seven-day ritual cycle shown on the credits page. */
export function StreakCard({ progress }: { progress: StreakProgress }) {
  const { current, longest, todayComplete, cycle, next } = progress;
  const pct = (cycle.completedDays / cycle.days) * 100;

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
            რიტუალის სერია
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            დაასრულე 7 დღე — მიიღე 10 კრედიტი
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
            todayComplete
              ? "border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/10 text-[var(--vivida-cyan)]"
              : "border-[var(--vivida-gold)]/25 bg-[var(--vivida-gold)]/10 text-[var(--vivida-gold)]"
          )}
        >
          {todayComplete ? <Check className="size-3" /> : <Flame className="size-3" />}
          {todayComplete ? "დღევანდელი რიტუალი დასრულებულია" : "დღევანდელი რიტუალი დარჩა"}
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground">
                {cycle.rewardEarnedToday ? "კვირის ციკლი" : "შემდეგი ჯილდო"}
              </div>
              <div className="mt-1 text-base font-semibold">
                {cycle.rewardEarnedToday
                  ? "ჯილდო მიღებულია — ახალი ციკლი ხვალ იწყება"
                  : `კიდევ ${next.daysLeft} დღე`}
              </div>
            </div>
            <div className="rounded-xl bg-[var(--vivida-gold)]/15 px-3 py-2 text-right">
              <div className="flex items-center gap-1 text-lg font-bold tabular-nums text-[var(--vivida-gold)]">
                <Sparkles className="size-4" />+{next.credits}
              </div>
              <div className="text-[10px] text-muted-foreground">ყოველ 7 დღეში</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
              <span>{cycle.completedDays}/{cycle.days} დღე</span>
              <span>მიზანი: {next.days} დღე</span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-foreground/10"
              role="progressbar"
              aria-label="შვიდდღიანი რიტუალის ციკლის პროგრესი"
              aria-valuemin={0}
              aria-valuemax={cycle.days}
              aria-valuenow={cycle.completedDays}
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-gold),var(--vivida-pink))] shadow-[0_0_14px_var(--vivida-gold)] transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-7 gap-1.5" aria-label="კვირის დღეები">
        {Array.from({ length: cycle.days }, (_, index) => {
          const done = index < cycle.completedDays;
          return (
            <div
              key={index}
              className={cn(
                "grid aspect-square place-items-center rounded-xl border text-xs font-semibold tabular-nums",
                done
                  ? "border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/10 text-[var(--vivida-cyan)]"
                  : "border-border/55 bg-background/25 text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </div>
          );
        })}
      </div>

      <p className="relative mt-3 text-xs leading-relaxed text-muted-foreground">
        გვერდის გახსნა აღარ არის საკმარისი — სერია იზრდება მხოლოდ დღის რიტუალის დასრულებისას. ყოველ ახალ 7-დღიან ციკლზე კვლავ იღებ ჯილდოს.
      </p>
    </section>
  );
}
