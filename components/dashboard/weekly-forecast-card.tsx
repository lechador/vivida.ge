"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, Sparkle } from "lucide-react";

import type { WeeklyForecastDay } from "@/db/schema";
import { BODIES } from "@/lib/zodiac";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ASPECT_LABEL_KA: Record<string, string> = {
  conjunction: "შეერთება",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრინი",
  opposition: "ოპოზიცია",
};
const ASPECT_LABEL_EN: Record<string, string> = {
  conjunction: "conjunction",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposition",
};

const FAMILY_HINT_KA: Record<string, string> = {
  harmonic: "ჰარმონიული",
  tense: "დაძაბული",
  neutral: "ნეიტრალური",
};
const FAMILY_HINT_EN: Record<string, string> = {
  harmonic: "harmonious",
  tense: "challenging",
  neutral: "neutral",
};

const WEEKDAY_SHORT_KA: Record<string, string> = {
  ორშაბათი: "ორშ",
  სამშაბათი: "სამ",
  ოთხშაბათი: "ოთხ",
  ხუთშაბათი: "ხუთ",
  პარასკევი: "პარ",
  შაბათი: "შაბ",
  კვირა: "კვი",
};

/**
 * 7-day forecast card. Each day shows a stacked harmony/challenge bar and
 * a one-line headline; click to expand the per-day breakdown (why it's
 * harmonic, why it's challenging, one piece of advice, and the top driving
 * aspects). All rows start collapsed so the week reads as a glanceable
 * list, users open the days they care about.
 */
export function WeeklyForecastCard({
  days,
  locale = "ka",
}: {
  days: WeeklyForecastDay[];
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <div
        aria-hidden
        className="absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,var(--vivida-cyan)/0.3_0%,transparent_70%)] opacity-60 blur-3xl"
      />

      <header className="relative mb-5 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Next 7 days" : "შემდეგი 7 დღე"}
          </div>
          <h2 className="mt-1 text-balance text-lg font-semibold tracking-tight sm:text-xl">
            {en ? "Your week in the sky" : "შენი კვირის ცის რუკა"}
          </h2>
        </div>
        <Sparkles
          className="size-5 shrink-0 text-[var(--vivida-cyan)]"
          aria-hidden
        />
      </header>

      <ol className="relative space-y-3.5">
        {days.map((day, i) => (
          <DayRow
            key={day.dateIso}
            day={day}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            locale={locale}
          />
        ))}
      </ol>

      <p className="relative mt-5 flex items-center gap-1.5 border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
        <Sparkle className="size-3" aria-hidden />
        <span>
          {en
            ? "Scores reflect each day's transit-to-natal aspects. Select a day to see why."
            : "ქულები ეფუძნება ამ დღის ტრანზიტ-ნატალურ ასპექტებს. დააჭირე დღეს, რომ ნახო რატომ."}
        </span>
      </p>
    </article>
  );
}

export function DayRow({
  day,
  open,
  onToggle,
  locale,
  locked = false,
}: {
  day: WeeklyForecastDay;
  open: boolean;
  onToggle: () => void;
  locale: UserLocale;
  /**
   * Locked teaser row: the button is disabled (out of the tab order) so the
   * parent can blur it as a pure visual tease with no interaction.
   */
  locked?: boolean;
}) {
  const en = locale !== "ka";
  const dayNum = parseDateNum(day.dateIso);
  const weekShort = en
    ? new Intl.DateTimeFormat("en", {
        weekday: "short",
        timeZone: "UTC",
      }).format(new Date(`${day.dateIso}T00:00:00Z`))
    : (WEEKDAY_SHORT_KA[day.weekdayKa] ?? day.weekdayKa.slice(0, 3));
  const total = day.harmonyScore + day.challengeScore;
  const harmonicPct = total > 0 ? (day.harmonyScore / total) * 100 : 50;
  const challengePct = total > 0 ? (day.challengeScore / total) * 100 : 50;
  // Overall "intensity", quiet days get a faded bar so the eye sees them as low-energy.
  const intensity = Math.min(
    1,
    Math.max(day.harmonyScore, day.challengeScore) / 70,
  );
  // Threshold tuned to the post-amplification curve: tilted days now
  // produce wider gaps, so 18 keeps "შერეული" honest for genuinely
  // mixed days instead of every-other-day getting a directional label.
  const tilt: "harmonic" | "challenging" | "balanced" =
    day.harmonyScore - day.challengeScore > 18
      ? "harmonic"
      : day.challengeScore - day.harmonyScore > 18
        ? "challenging"
        : "balanced";

  // Tilt-driven palette so each row carries the day's mood as its own
  // outline color + a saturated left accent stripe. Helps the eye chunk
  // the list into "this day vs. that day" at a glance.
  const tone =
    tilt === "harmonic"
      ? {
          stripe: "bg-[var(--vivida-cyan)]",
          border: "border-[var(--vivida-cyan)]/45",
          borderHover: "hover:border-[var(--vivida-cyan)]/75",
          bg: "bg-[oklch(0.24_0.05_220/0.85)]",
          bgHover: "hover:bg-[oklch(0.27_0.06_220/0.92)]",
          glow: "shadow-[0_0_24px_-10px_oklch(0.78_0.18_200/0.55)]",
        }
      : tilt === "challenging"
        ? {
            stripe: "bg-[var(--vivida-pink)]",
            border: "border-[var(--vivida-pink)]/45",
            borderHover: "hover:border-[var(--vivida-pink)]/75",
            bg: "bg-[oklch(0.24_0.06_350/0.85)]",
            bgHover: "hover:bg-[oklch(0.27_0.07_350/0.92)]",
            glow: "shadow-[0_0_24px_-10px_oklch(0.72_0.22_350/0.55)]",
          }
        : {
            stripe: "bg-[var(--vivida-violet)]/70",
            border: "border-[var(--vivida-violet)]/35",
            borderHover: "hover:border-[var(--vivida-violet)]/60",
            bg: "bg-[oklch(0.22_0.04_290/0.85)]",
            bgHover: "hover:bg-[oklch(0.25_0.05_290/0.92)]",
            glow: "shadow-[0_0_24px_-10px_oklch(0.65_0.24_305/0.45)]",
          };

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        disabled={locked}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border-2 p-3 pl-5 text-left transition-all sm:p-4 sm:pl-6",
          tone.bg,
          tone.bgHover,
          tone.border,
          tone.borderHover,
          open && [tone.glow, "ring-1 ring-foreground/10"],
        )}
        aria-expanded={open}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 w-1.5",
            tone.stripe,
            open && "shadow-[0_0_14px_oklch(0.65_0.24_305/0.7)]",
          )}
        />
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Date pill */}
          <div
            className={cn(
              "flex shrink-0 flex-col items-center justify-center rounded-lg border px-2.5 py-1.5 transition-colors sm:px-3 sm:py-2",
              open
                ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15"
                : "border-border bg-[oklch(0.27_0.05_285/0.7)]",
            )}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {weekShort}
            </span>
            <span className="text-base font-semibold leading-none text-foreground sm:text-lg">
              {dayNum}
            </span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground/95 sm:text-[15px]">
                  {day.headline || "—"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {en ? "Moon" : "მთვარე"}{" "}
                  {en ? day.moonSignEn : day.moonSignKa} ·{" "}
                  {labelForTilt(tilt, locale)}
                </p>
              </div>
              <ChevronDown
                aria-hidden
                className={cn(
                  "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                  open && "rotate-180",
                )}
              />
            </div>

            {/* Stacked harmony / challenge bar */}
            <div
              className="relative mt-2.5 h-2 overflow-hidden rounded-full bg-foreground/[0.06]"
              style={{ opacity: 0.55 + intensity * 0.45 }}
              role="img"
              aria-label={
                en
                  ? `Harmony ${day.harmonyScore}, challenge ${day.challengeScore}`
                  : `ჰარმონია ${day.harmonyScore}, დაძაბულობა ${day.challengeScore}`
              }
            >
              <div
                className="absolute inset-y-0 left-0 rounded-l-full bg-[var(--vivida-cyan)]"
                style={{ width: `${harmonicPct}%`, opacity: 0.85 }}
              />
              <div
                className="absolute inset-y-0 rounded-r-full bg-[var(--vivida-pink)]"
                style={{
                  left: `${harmonicPct}%`,
                  width: `${challengePct}%`,
                  opacity: 0.85,
                }}
              />
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-[10px] tabular-nums">
              <span
                className="inline-flex items-center gap-1 text-[var(--vivida-cyan)]"
                aria-label="harmonic score"
              >
                <Sparkle className="size-3" />
                {day.harmonyScore}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span
                className="inline-flex items-center gap-1 text-[var(--vivida-pink)]"
                aria-label="challenging score"
              >
                <Sparkle className="size-3" />
                {day.challengeScore}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded breakdown */}
      {open && (
        <div className="mt-2 grid gap-3 rounded-xl border border-[var(--vivida-violet)]/30 bg-[oklch(0.20_0.04_283/0.7)] p-3 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Block
              label={en ? "Supportive" : "ჰარმონიული"}
              dotClass="bg-[var(--vivida-cyan)]"
              borderClass="border-[var(--vivida-cyan)]/45"
              text={day.harmonicReason || "—"}
            />
            <Block
              label={en ? "Challenging" : "დაძაბული"}
              dotClass="bg-[var(--vivida-pink)]"
              borderClass="border-[var(--vivida-pink)]/45"
              text={day.challengingReason || "—"}
            />
          </div>
          {day.advice && (
            <div className="rounded-lg border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-3 py-2 text-sm leading-relaxed text-foreground/90">
              <span className="mr-1 text-[var(--vivida-violet)]">→</span>
              {day.advice}
            </div>
          )}
          {day.drivers && day.drivers.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {en ? "Active aspects" : "მოქმედი ასპექტები"}
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {day.drivers.slice(0, 4).map((dr, j) => (
                  <li
                    key={j}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                      dr.family === "harmonic"
                        ? "border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/10 text-foreground/90"
                        : dr.family === "tense"
                          ? "border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/10 text-foreground/90"
                          : "border-border/60 bg-background/40 text-foreground/80",
                    )}
                    title={`${(en ? FAMILY_HINT_EN : FAMILY_HINT_KA)[dr.family] ?? ""} · orb ${dr.orb.toFixed(1)}°`}
                  >
                    <span className="font-medium">
                      {bodyLabel(dr.transit, locale)}
                    </span>
                    <span className="text-muted-foreground">
                      {(en ? ASPECT_LABEL_EN : ASPECT_LABEL_KA)[dr.kind] ??
                        dr.kind}
                    </span>
                    <span className="font-medium">
                      {bodyLabel(dr.natal, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function Block({
  label,
  text,
  dotClass,
  borderClass,
}: {
  label: string;
  text: string;
  dotClass: string;
  borderClass: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-[oklch(0.25_0.05_285/0.85)] px-3 py-2.5 ring-1 ring-foreground/5",
        borderClass,
      )}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <span className={cn("size-1.5 rounded-full", dotClass)} aria-hidden />
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/95">{text}</p>
    </div>
  );
}

function labelForTilt(
  tilt: "harmonic" | "challenging" | "balanced",
  locale: UserLocale,
): string {
  if (locale !== "ka") {
    if (tilt === "harmonic") return "supportive day";
    if (tilt === "challenging") return "challenging day";
    return "mixed day";
  }
  if (tilt === "harmonic") return "ჰარმონიული დღე";
  if (tilt === "challenging") return "დაძაბული დღე";
  return "შერეული დღე";
}

function bodyLabel(key: string, locale: UserLocale): string {
  const body = BODIES[key];
  return (locale !== "ka" ? body?.labelEn : body?.labelKa) ?? key;
}

function parseDateNum(iso: string): string {
  // Avoid timezone drift on the day number, slice the YYYY-MM-DD part directly.
  const [, , dd] = iso.split("-");
  return dd ? String(parseInt(dd, 10)) : iso;
}
