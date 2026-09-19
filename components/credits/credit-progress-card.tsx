import { CalendarDays, MessageCircle, Sparkles } from "lucide-react";

import { MONTHLY_BONUS } from "@/lib/credits-config";
import { nextUnlockProgress } from "@/lib/credit-progress";
import { kaLongDate } from "@/lib/i18n/ka-date";

import type { UserLocale } from "@/lib/i18n/user-locale";

export function CreditProgressCard({
  balance,
  nextMonthlyDate,
  locale,
}: {
  balance: number;
  nextMonthlyDate: string;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const progress = nextUnlockProgress(balance);
  const percent = Math.min(100, (progress.current / progress.target) * 100);
  const dateLabel = en
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }).format(new Date(`${nextMonthlyDate}T00:00:00Z`))
    : kaLongDate(nextMonthlyDate).replace(/,? \d{4}$/, "");

  return (
    <section className="rounded-3xl border border-[var(--vivida-violet)]/30 bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {en ? "Next unlock" : "შემდეგი გახსნა"}
          </p>
          <h2 className="mt-1 text-base font-semibold">
            {progress.complete
              ? en
                ? "Enough for any single feature"
                : "ნებისმიერი ერთი ფუნქციისთვის საკმარისია"
              : en
                ? `${progress.missing} more credits to the next tier`
                : `კიდევ ${progress.missing} კრედიტი შემდეგ დონემდე`}
          </h2>
        </div>
        <Sparkles className="size-5 shrink-0 text-[var(--vivida-cyan)]" />
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-cyan))]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>
          {progress.current} / {progress.target}
        </span>
        <span>
          {progress.target === 5
            ? en
              ? "test / PDF"
              : "ტესტი / PDF"
            : en
              ? "tarot / weekly"
              : "ტარო / კვირა"}
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/35 p-3 text-xs text-muted-foreground">
          <CalendarDays className="size-4 shrink-0 text-[var(--vivida-violet)]" />
          {en
            ? `Next free +${MONTHLY_BONUS}: ${dateLabel}`
            : `შემდეგი უფასო +${MONTHLY_BONUS}: ${dateLabel}`}
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/35 p-3 text-xs text-muted-foreground">
          <MessageCircle className="size-4 shrink-0 text-[var(--vivida-cyan)]" />
          {en
            ? "First feed post: +1 per week"
            : "ფიდის პირველი პოსტი: კვირაში +1"}
        </div>
      </div>
    </section>
  );
}
