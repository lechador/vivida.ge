"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { WeeklyForecastDay } from "@/db/schema";
import { BODIES, SIGNS } from "@/lib/zodiac";
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
const ASPECT_LABEL_PL: Record<string, string> = {
  conjunction: "koniunkcja",
  sextile: "sekstyl",
  square: "kwadratura",
  trine: "trygon",
  opposition: "opozycja",
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
const FAMILY_HINT_PL: Record<string, string> = {
  harmonic: "harmonijny",
  tense: "wymagający",
  neutral: "neutralny",
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
 * Editorial Celestial 7-Day Ephemeris Forecast Ledger.
 * Renders a flat hairline table of daily transit scores and expandable
 * supportive/challenging aspect breakdowns.
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
    <article className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <header className="mb-5 flex items-baseline justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
            {locale === "pl"
              ? "7-dniowa prognoza efemeryd"
              : en
                ? "7-Day Ephemeris Forecast"
                : "შემდეგი 7 დღის ეფემერიდა"}
          </div>
          <h2 className="mt-1 text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {locale === "pl"
              ? "Twój tydzień na niebie"
              : en
                ? "Your week in the sky"
                : "შენი კვირის ცის რუკა"}
          </h2>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {days.length} {locale === "pl" ? "dni" : en ? "days" : "დღე"}
        </span>
      </header>

      <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background/60">
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

      <p className="mt-4 text-xs text-muted-foreground">
        {locale === "pl"
          ? "Oceny odzwierciedlają dzienne tranzyty do Twojego kosmogramu. Wybierz dzień, aby dowiedzieć się więcej."
          : en
            ? "Scores reflect each day's transit-to-natal aspects. Select a day to see why."
            : "ქულები ეფუძნება ამ დღის ტრანზიტ-ნატალურ ასპექტებს. დააჭირე დღეს დეტალების სანახავად."}
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
  locked?: boolean;
}) {
  const en = locale !== "ka";
  const dayNum = parseDateNum(day.dateIso);
  const weekShort =
    locale === "pl"
      ? new Intl.DateTimeFormat("pl", {
          weekday: "short",
          timeZone: "UTC",
        }).format(new Date(`${day.dateIso}T00:00:00Z`))
      : en
        ? new Intl.DateTimeFormat("en", {
            weekday: "short",
            timeZone: "UTC",
          }).format(new Date(`${day.dateIso}T00:00:00Z`))
        : (WEEKDAY_SHORT_KA[day.weekdayKa] ?? day.weekdayKa.slice(0, 3));
  const total = day.harmonyScore + day.challengeScore;
  const harmonicPct = total > 0 ? (day.harmonyScore / total) * 100 : 50;
  const challengePct = total > 0 ? (day.challengeScore / total) * 100 : 50;
  const intensity = Math.min(
    1,
    Math.max(day.harmonyScore, day.challengeScore) / 70,
  );
  const tilt: "harmonic" | "challenging" | "balanced" =
    day.harmonyScore - day.challengeScore > 18
      ? "harmonic"
      : day.challengeScore - day.harmonyScore > 18
        ? "challenging"
        : "balanced";

  const stripeClass =
    tilt === "harmonic"
      ? "bg-[var(--vivida-cyan)]"
      : tilt === "challenging"
        ? "bg-[var(--vivida-pink)]"
        : "bg-primary";

  const sign = SIGNS.find(
    (s) =>
      s.labelEn.toLowerCase() === day.moonSignEn?.toLowerCase() ||
      s.key.toLowerCase() === day.moonSignEn?.toLowerCase(),
  );
  const moonSign =
    locale === "pl"
      ? (sign?.labelPl ?? day.moonSignEn)
      : en
        ? day.moonSignEn
        : day.moonSignKa;

  return (
    <li className="bg-transparent">
      <button
        type="button"
        onClick={onToggle}
        disabled={locked}
        className={cn(
          "group relative w-full p-4 pl-5 text-left transition-colors hover:bg-secondary/50",
          open && "bg-secondary/40",
        )}
        aria-expanded={open}
      >
        <span
          aria-hidden
          className={cn("absolute inset-y-0 left-0 w-1", stripeClass)}
        />
        <div className="flex items-start gap-4">
          {/* Date tile */}
          <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-md border border-border bg-card py-1.5 font-mono tabular-nums">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {weekShort}
            </span>
            <span className="text-base font-semibold leading-none text-foreground">
              {dayNum}
            </span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {day.headline || "—"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {locale === "pl" ? "Księżyc" : en ? "Moon" : "მთვარე"}{" "}
                  {moonSign} · {labelForTilt(tilt, locale)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:inline">
                  <span className="text-[var(--vivida-cyan)]">
                    +{day.harmonyScore}
                  </span>{" "}
                  /{" "}
                  <span className="text-[var(--vivida-pink)]">
                    −{day.challengeScore}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                />
              </div>
            </div>

            {/* Calibrated harmony / challenge bar */}
            <div
              className="relative mt-2.5 h-1.5 overflow-hidden rounded-full bg-border"
              style={{ opacity: 0.65 + intensity * 0.35 }}
              role="img"
              aria-label={
                locale === "pl"
                  ? `Harmonia ${day.harmonyScore}, wyzwanie ${day.challengeScore}`
                  : en
                    ? `Harmony ${day.harmonyScore}, challenge ${day.challengeScore}`
                    : `ჰარმონია ${day.harmonyScore}, დაძაბულობა ${day.challengeScore}`
              }
            >
              <div
                className="absolute inset-y-0 left-0 bg-[var(--vivida-cyan)]"
                style={{ width: `${harmonicPct}%` }}
              />
              <div
                className="absolute inset-y-0 bg-[var(--vivida-pink)]"
                style={{
                  left: `${harmonicPct}%`,
                  width: `${challengePct}%`,
                }}
              />
            </div>
          </div>
        </div>
      </button>

      {/* Expanded breakdown */}
      {open && (
        <div className="space-y-3 border-t border-border bg-secondary/20 p-4 pl-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Block
              label={
                locale === "pl"
                  ? "Harmonijny"
                  : en
                    ? "Supportive"
                    : "ჰარმონიული"
              }
              toneClass="text-[var(--vivida-cyan)]"
              text={day.harmonicReason || "—"}
            />
            <Block
              label={
                locale === "pl" ? "Wymagający" : en ? "Challenging" : "დაძაბული"
              }
              toneClass="text-[var(--vivida-pink)]"
              text={day.challengingReason || "—"}
            />
          </div>
          {day.advice && (
            <div className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground/90">
              <span className="mr-1.5 font-mono text-primary">→</span>
              {day.advice}
            </div>
          )}
          {day.drivers && day.drivers.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {locale === "pl"
                  ? "Aktywne aspekty"
                  : en
                    ? "Active aspects"
                    : "მოქმედი ასპექტები"}
              </div>
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                {day.drivers.slice(0, 4).map((dr, j) => (
                  <li
                    key={j}
                    className="inline-flex items-center gap-1"
                    title={`${(locale === "pl" ? FAMILY_HINT_PL : en ? FAMILY_HINT_EN : FAMILY_HINT_KA)[dr.family] ?? ""} · orb ${dr.orb.toFixed(1)}°`}
                  >
                    {j > 0 && <span aria-hidden>·</span>}
                    <span className="text-foreground">
                      {bodyLabel(dr.transit, locale)}
                    </span>
                    <span className="text-primary">
                      {(locale === "pl"
                        ? ASPECT_LABEL_PL
                        : en
                          ? ASPECT_LABEL_EN
                          : ASPECT_LABEL_KA)[dr.kind] ?? dr.kind}
                    </span>
                    <span className="text-foreground">
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
  toneClass,
}: {
  label: string;
  text: string;
  toneClass: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3.5">
      <div
        className={cn(
          "mb-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
          toneClass,
        )}
      >
        {label}
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
    </div>
  );
}

function labelForTilt(
  tilt: "harmonic" | "challenging" | "balanced",
  locale: UserLocale,
): string {
  if (locale === "pl") {
    if (tilt === "harmonic") return "dzień harmonijny";
    if (tilt === "challenging") return "dzień wymagający";
    return "dzień zrównoważony";
  }
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
  return (
    (locale === "pl"
      ? body?.labelPl
      : locale !== "ka"
        ? body?.labelEn
        : body?.labelKa) ?? key
  );
}

function parseDateNum(iso: string): string {
  const [, , dd] = iso.split("-");
  return dd ? String(parseInt(dd, 10)) : iso;
}
