"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Circle, Sparkles } from "lucide-react";

import type { MoonPhaseRow } from "@/actions/moon-phase";
import type { DailyHoroscope } from "@/db/schema";
import type { TransitBreakdownItem } from "@/lib/transit-library";
import type { StreakProgress } from "@/lib/streak-credits";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  EMPTY_DAILY_RITUAL,
  isDailyRitualComplete,
  readDailyRitual,
  saveDailyRitual,
  type DailyRitualState,
} from "@/lib/daily-ritual";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { StreakChip } from "@/components/credits/streak-chip";
import { completeDailyRitual } from "@/actions/daily-ritual";

import { DailyCard } from "./daily-card";
import { MoonPhaseCard } from "./moon-phase-card";

const DEFAULT_FOCUS_KA = ["სიმშვიდე", "სიცხადე", "გაბედულება"];
const DEFAULT_FOCUS_EN = ["Calm", "Clarity", "Courage"];

export function DailyRitual({
  userId,
  horoscope,
  transits,
  moonPhase,
  timezone,
  savedVoice,
  canAudio,
  streak,
  locale,
}: {
  userId: string;
  horoscope: DailyHoroscope;
  transits: TransitBreakdownItem[];
  moonPhase: MoonPhaseRow | null;
  timezone: string;
  savedVoice?: string | null;
  canAudio: boolean;
  streak: StreakProgress;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const moonRequired = moonPhase !== null;
  const [state, setState] = useState<DailyRitualState>({
    ...EMPTY_DAILY_RITUAL,
  });
  const stateRef = useRef(state);
  const [hydrated, setHydrated] = useState(false);
  const [streakState, setStreakState] = useState(streak);
  const [rewardCredits, setRewardCredits] = useState(0);
  const syncingRef = useRef(false);

  const syncCompletion = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const result = await completeDailyRitual();
      setStreakState(result.progress);
      if (result.awardedCredits > 0) {
        setRewardCredits(result.awardedCredits);
      }
    } catch {
      // Browser progress remains complete and the next mount retries this
      // idempotent write. A transient server failure must not block the UI.
    } finally {
      syncingRef.current = false;
    }
  }, []);

  const focusOptions = useMemo(() => {
    const fallback = en ? DEFAULT_FOCUS_EN : DEFAULT_FOCUS_KA;
    const unique = [...new Set(horoscope.themes.map((theme) => theme.trim()))]
      .filter((theme) => theme.length > 0 && theme.length <= 80)
      .slice(0, 3);
    return unique.length >= 2 ? unique : fallback;
  }, [en, horoscope.themes]);

  useEffect(() => {
    const stored = readDailyRitual(userId, horoscope.date);
    stateRef.current = stored;
    const frame = window.requestAnimationFrame(() => {
      setState(stateRef.current);
      setHydrated(true);
      trackEvent(ANALYTICS_EVENT.dailyRitualViewed, {
        date: horoscope.date,
        completed_steps:
          Number(stored.horoscopeRead) +
          Number(moonRequired && stored.moonRead) +
          Number(!!stored.focus),
        total_steps: moonRequired ? 3 : 2,
      });
      if (isDailyRitualComplete(stored, moonRequired)) {
        void syncCompletion();
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [horoscope.date, moonRequired, syncCompletion, userId]);

  const updateState = useCallback(
    (
      patch: Partial<DailyRitualState>,
      event:
        | typeof ANALYTICS_EVENT.dailyMoonRead
        | typeof ANALYTICS_EVENT.dailyFocusSelected
    ) => {
      const current = stateRef.current;
      const next = { ...current, ...patch };
      if (
        next.horoscopeRead === current.horoscopeRead &&
        next.moonRead === current.moonRead &&
        next.focus === current.focus
      ) {
        return;
      }

      const wasComplete = isDailyRitualComplete(current, moonRequired);
      const complete = isDailyRitualComplete(next, moonRequired);
      stateRef.current = next;
      setState(next);
      saveDailyRitual(userId, horoscope.date, next);
      trackEvent(event, { date: horoscope.date });
      if (!wasComplete && complete) {
        trackEvent(ANALYTICS_EVENT.dailyRitualCompleted, {
          date: horoscope.date,
          total_steps: moonRequired ? 3 : 2,
        });
        void syncCompletion();
      }
    },
    [horoscope.date, moonRequired, syncCompletion, userId]
  );

  const markHoroscopeRead = useCallback(() => {
    const current = stateRef.current;
    if (current.horoscopeRead) return;
    const next = { ...current, horoscopeRead: true };
    const wasComplete = isDailyRitualComplete(current, moonRequired);
    const complete = isDailyRitualComplete(next, moonRequired);
    stateRef.current = next;
    setState(next);
    saveDailyRitual(userId, horoscope.date, next);
    if (!wasComplete && complete) {
      trackEvent(ANALYTICS_EVENT.dailyRitualCompleted, {
        date: horoscope.date,
        total_steps: moonRequired ? 3 : 2,
      });
      void syncCompletion();
    }
  }, [horoscope.date, moonRequired, syncCompletion, userId]);

  const steps = [
    {
      key: "horoscope",
      label: en ? "Horoscope" : "ჰოროსკოპი",
      complete: state.horoscopeRead,
    },
    ...(moonRequired
      ? [
          {
            key: "moon",
            label: en ? "Moon message" : "მთვარის გზავნილი",
            complete: state.moonRead,
          },
        ]
      : []),
    {
      key: "focus",
      label: en ? "Today's focus" : "დღის ფოკუსი",
      complete: !!state.focus,
    },
  ];
  const completedSteps = steps.filter((step) => step.complete).length;
  const complete = isDailyRitualComplete(state, moonRequired);
  const pct = (completedSteps / steps.length) * 100;

  return (
    <section aria-labelledby="daily-ritual-title" className="space-y-6">
      <div className="rounded-2xl border border-[var(--vivida-gold)]/25 bg-gradient-to-br from-[var(--vivida-gold)]/8 via-card/60 to-[var(--vivida-violet)]/8 px-4 py-3.5 ring-1 ring-foreground/5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <h2
            id="daily-ritual-title"
            className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"
          >
            <Sparkles className="size-4 shrink-0 text-[var(--vivida-gold)]" />
            {en ? "Daily ritual" : "დღის რიტუალი"}
          </h2>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
              complete
                ? "bg-[var(--vivida-cyan)]/12 text-[var(--vivida-cyan)]"
                : "bg-foreground/10 text-muted-foreground"
            )}
          >
            {complete && <Check className="size-3 shrink-0" />}
            {completedSteps}/{steps.length}
          </span>
          {rewardCredits > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-gold)]/35 bg-[var(--vivida-gold)]/12 px-2 py-0.5 text-[11px] font-semibold text-[var(--vivida-gold)]">
              +{rewardCredits} {en ? "credits" : "კრედიტი"}
            </span>
          )}
          <span className="ml-auto">
            <StreakChip progress={streakState} locale={locale} />
          </span>
        </div>

        <div
          className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-foreground/10"
          role="progressbar"
          aria-label={en ? "Daily ritual progress" : "დღის რიტუალის პროგრესი"}
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={completedSteps}
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-gold),var(--vivida-pink),var(--vivida-violet))] transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
          {steps
            .filter((step) => step.key !== "focus")
            .map((step) => (
              <span
                key={step.key}
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  step.complete
                    ? "text-[var(--vivida-cyan)]"
                    : "text-muted-foreground"
                )}
              >
                {step.complete ? (
                  <Check className="size-3.5 shrink-0" />
                ) : (
                  <Circle className="size-3.5 shrink-0" />
                )}
                {step.label}
              </span>
            ))}
          <span aria-hidden className="hidden h-3.5 w-px bg-border/70 sm:block" />
          <span className="text-muted-foreground">
            {en ? "Today's focus:" : "დღის ფოკუსი:"}
          </span>
          {focusOptions.map((focus) => (
            <button
              key={focus}
              type="button"
              disabled={!hydrated}
              aria-pressed={state.focus === focus}
              onClick={() =>
                updateState({ focus }, ANALYTICS_EVENT.dailyFocusSelected)
              }
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-medium transition-colors disabled:cursor-wait disabled:opacity-60",
                state.focus === focus
                  ? "border-[var(--vivida-gold)]/60 bg-[var(--vivida-gold)]/15 text-[var(--vivida-gold)]"
                  : "border-border/70 bg-background/30 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              )}
            >
              {state.focus === focus ? "✓ " : ""}
              {focus}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="min-w-0 xl:col-span-7">
          <DailyCard
            horoscope={horoscope}
            transits={transits}
            timezone={timezone}
            savedVoice={savedVoice}
            canAudio={canAudio}
            onRead={markHoroscopeRead}
          />
        </div>
        {moonPhase && (
          <div className="min-w-0 xl:col-span-5 xl:sticky xl:top-20">
            <MoonPhaseCard
              data={moonPhase}
              onRead={() =>
                updateState(
                  { moonRead: true },
                  ANALYTICS_EVENT.dailyMoonRead
                )
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
