import {
  CalendarDays,
  HeartHandshake,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { RelationshipCheckin } from "@/components/synastry/relationship-checkin";
import type { RelationshipWeeklyJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { RelationshipAnswerView } from "@/lib/relationship-core";
import { cn } from "@/lib/utils";

const TIER_CLASS: Record<
  RelationshipWeeklyJson["days"][number]["tier"],
  string
> = {
  great: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  good: "border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/10 text-[var(--vivida-cyan)]",
  calm: "border-border/70 bg-background/35 text-foreground/75",
  tough: "border-amber-400/30 bg-amber-400/10 text-amber-200",
};

export function RelationshipWeeklyCard({
  partnerId,
  weekly,
  answers,
  currentUserId,
  connected,
  locale,
}: {
  partnerId: string;
  weekly: RelationshipWeeklyJson;
  answers: RelationshipAnswerView[];
  currentUserId: string;
  connected: boolean;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const intlLocale = locale === "en" ? "en-GB" : "ka-GE";
  const dayFormatter = new Intl.DateTimeFormat(intlLocale, {
    weekday: "short",
    day: "numeric",
  });
  const dateFormatter = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "short",
  });

  return (
    <article className="mb-8 overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/10 via-card/70 to-[var(--vivida-cyan)]/8 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
            <CalendarDays className="size-4" aria-hidden />
            {en ? "This week's connection" : "ამ კვირის კავშირი"}
          </div>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight">
            {weekly.headline}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/75">
            {weekly.summary}
          </p>
        </div>
        <div className="grid min-w-44 grid-cols-2 gap-2 text-center">
          <Score
            label={en ? "Harmony" : "ჰარმონია"}
            value={weekly.harmonyScore}
            accent="cyan"
          />
          <Score
            label={en ? "Challenge" : "გამოწვევა"}
            value={weekly.challengeScore}
            accent="pink"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {weekly.days.map((day) => (
          <div
            key={day.dateIso}
            className={cn(
              "rounded-xl border px-1 py-2 text-center",
              TIER_CLASS[day.tier],
            )}
          >
            <div className="text-[10px] font-medium uppercase opacity-75">
              {dayFormatter
                .format(new Date(`${day.dateIso}T12:00:00Z`))
                .replace(/\s+/g, " ")}
            </div>
            <div className="mt-1 text-xs font-semibold">
              {day.score > 0 ? "+" : ""}
              {day.score}
            </div>
          </div>
        ))}
      </div>

      {weekly.notable.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles
              className="size-4 text-[var(--vivida-cyan)]"
              aria-hidden
            />
            {en ? "Important moments" : "მნიშვნელოვანი მომენტები"}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {weekly.notable.map((item) => (
              <div
                key={item.key}
                className="rounded-xl border border-border/60 bg-background/30 p-3"
              >
                <div className="flex items-start gap-2">
                  {item.family === "tense" ? (
                    <TriangleAlert
                      className="mt-0.5 size-4 shrink-0 text-amber-300"
                      aria-hidden
                    />
                  ) : (
                    <HeartHandshake
                      className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]"
                      aria-hidden
                    />
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {dateFormatter.format(
                        new Date(`${item.dateIso}T12:00:00Z`),
                      )}
                    </div>
                    <h3 className="mt-0.5 text-sm font-medium">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/70">
                      {item.meaning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RelationshipCheckin
        partnerId={partnerId}
        weekStart={weekly.weekStart}
        questions={weekly.questions}
        initialAnswers={answers}
        currentUserId={currentUserId}
        connected={connected}
        locale={locale}
      />
    </article>
  );
}

function Score({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "cyan" | "pink";
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/35 p-2.5">
      <div
        className={cn(
          "text-xl font-semibold",
          accent === "cyan"
            ? "text-[var(--vivida-cyan)]"
            : "text-[var(--vivida-pink)]",
        )}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
