import { Sparkles } from "lucide-react";

import type { DailyHoroscope } from "@/db/schema";

/**
 * Pro-only daily horoscope hero card. Shown above the chart wheel so it's
 * the first thing returning users see — the engagement loop.
 */
export function DailyCard({
  horoscope,
  timezone,
}: {
  horoscope: DailyHoroscope;
  timezone: string;
}) {
  const date = new Intl.DateTimeFormat("ka-GE", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(horoscope.date + "T12:00:00Z"));

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-7 backdrop-blur-xl sm:p-9">
      <div
        aria-hidden
        className="absolute -right-20 -top-20 size-72 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-10 -left-10 size-44 rounded-full bg-[radial-gradient(circle,var(--vivida-cyan)_0%,transparent_70%)] opacity-25 blur-2xl"
      />

      <header className="relative flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            დღევანდელი დღე · {date}
          </div>
          <h2 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {horoscope.headline}
            </span>
          </h2>
        </div>
        <Sparkles
          className="size-7 shrink-0 text-[var(--vivida-pink)]"
          aria-hidden
        />
      </header>

      {horoscope.themes.length > 0 && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {horoscope.themes.map((theme, i) => (
            <span
              key={i}
              className="rounded-full border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--vivida-cyan)]"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      <p className="relative mt-5 text-base leading-relaxed text-foreground/90">
        {horoscope.summary}
      </p>

      <div className="relative mt-5 space-y-4 text-sm leading-relaxed text-foreground/85">
        {horoscope.body
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((para, i) => (
            <p key={i}>{para}</p>
          ))}
      </div>

      <p className="relative mt-6 border-t border-border/40 pt-4 text-xs text-muted-foreground">
        ხვალ ახალი წინასწარმეტყველება გელოდება.
      </p>
    </article>
  );
}
