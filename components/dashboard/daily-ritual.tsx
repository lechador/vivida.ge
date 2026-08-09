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
      label: en ? "Read your horoscope" : "წაიკითხე ჰოროსკოპი",
      complete: state.horoscopeRead,
    },
    ...(moonRequired
      ? [
          {
            key: "moon",
            label: en ? "Open the Moon message" : "გახსენი მთვარის გზავნილი",
            complete: state.moonRead,
          },
        ]
      : []),
    {
      key: "focus",
      label: en ? "Choose today's focus" : "აირჩიე დღის ფოკუსი",
      complete: !!state.focus,
    },
  ];
  const completedSteps = steps.filter((step) => step.complete).length;
  const complete = isDailyRitualComplete(state, moonRequired);
  const pct = (completedSteps / steps.length) * 100;

  return (
    <section aria-labelledby="daily-ritual-title" className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--vivida-gold)]/30 bg-gradient-to-br from-[var(--vivida-gold)]/10 via-card/65 to-[var(--vivida-violet)]/10 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
        <div
          aria-hidden
          className="absolute -right-14 -top-16 size-44 rounded-full bg-[radial-gradient(circle,var(--vivida-gold),transparent_68%)] opacity-15 blur-2xl"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
              <Sparkles className="size-3.5" />
              {en ? "Daily ritual" : "დღის რიტუალი"}
            </div>
            <h2 id="daily-ritual-title" className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              {complete
                ? en
                  ? "Today's ritual is complete"
                  : "დღევანდელი რიტუალი დასრულებულია"
                : en
                  ? `${steps.length} small steps for today`
                  : `${steps.length === 3 ? "სამი" : "ორი"} მცირე ნაბიჯი დღევანდელი დღისთვის`}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {complete
                ? en
                  ? "Come back tomorrow for a new personal message."
                  : "ხვალ ახალი პერსონალური გზავნილი დაგხვდება."
                : en
                  ? "Read, notice the sky, and choose what to carry into your day."
                  : "წაიკითხე, დააკვირდი ცას და აირჩიე, რას წაიღებ დღეში."}
            </p>
            {rewardCredits > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-gold)]/35 bg-[var(--vivida-gold)]/12 px-2.5 py-1 text-xs font-semibold text-[var(--vivida-gold)]">
                <Sparkles className="size-3.5" />
                {en
                  ? `Weekly reward: +${rewardCredits} credits`
                  : `კვირის ჯილდო: +${rewardCredits} კრედიტი`}
              </div>
            )}
          </div>
          <StreakChip progress={streakState} locale={locale} />
        </div>

        <div className="relative mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{en ? "Today's progress" : "დღევანდელი პროგრესი"}</span>
            <span className="tabular-nums">{completedSteps}/{steps.length}</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-foreground/10"
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
        </div>

        <ol className="relative mt-4 grid gap-2 sm:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.key}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium",
                step.complete
                  ? "border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/10 text-foreground"
                  : "border-border/60 bg-background/25 text-muted-foreground"
              )}
            >
              {step.complete ? (
                <Check className="size-4 shrink-0 text-[var(--vivida-cyan)]" />
              ) : (
                <Circle className="size-4 shrink-0" />
              )}
              {step.label}
            </li>
          ))}
        </ol>

        <div className="relative mt-5 border-t border-border/50 pt-4">
          <div className="text-xs font-medium text-foreground/85">
            {en ? "What will you carry into today?" : "რას წაიღებ დღევანდელ დღეში?"}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {focusOptions.map((focus) => (
              <button
                key={focus}
                type="button"
                disabled={!hydrated}
                aria-pressed={state.focus === focus}
                onClick={() =>
                  updateState(
                    { focus },
                    ANALYTICS_EVENT.dailyFocusSelected
                  )
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-60",
                  state.focus === focus
                    ? "border-[var(--vivida-gold)]/60 bg-[var(--vivida-gold)]/15 text-[var(--vivida-gold)]"
                    : "border-border/70 bg-background/30 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                )}
              >
                {state.focus === focus ? "✓ " : ""}{focus}
              </button>
            ))}
          </div>
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
