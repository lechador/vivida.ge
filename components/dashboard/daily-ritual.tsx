"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";

import { completeDailyRitual } from "@/actions/daily-ritual";
import { DailyCard } from "@/components/dashboard/daily-card";
import type { DailyHoroscope } from "@/db/schema";
import {
  readDailyRitual,
  saveDailyRitual,
  type DailyRitualState,
} from "@/lib/daily-ritual";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { StreakProgress } from "@/lib/streak-credits";
import type { TransitBreakdownItem } from "@/lib/transit-library";

const FALLBACK_FOCUS: Record<UserLocale, string[]> = {
  ka: ["სიმშვიდე", "გამბედაობა", "ურთიერთობები"],
  en: ["Calm", "Courage", "Relationships"],
};

export function DailyRitual({
  userId,
  horoscope,
  transits,
  initialProgress,
  locale,
}: {
  userId: string;
  horoscope: DailyHoroscope;
  transits: TransitBreakdownItem[];
  initialProgress: StreakProgress;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const [state, setState] = useState<DailyRitualState>({
    horoscopeRead: false,
    focus: null,
  });
  const [progress, setProgress] = useState(initialProgress);
  const [pending, setPending] = useState(false);
  const [earned, setEarned] = useState(0);
  const requested = useRef(initialProgress.todayComplete);
  const focuses = useMemo(() => {
    const themes = horoscope.themes
      .map((theme) => theme.trim())
      .filter(Boolean)
      .slice(0, 3);
    return themes.length >= 2 ? themes : FALLBACK_FOCUS[locale];
  }, [horoscope.themes, locale]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(readDailyRitual(userId, horoscope.date));
      setProgress(initialProgress);
      requested.current = initialProgress.todayComplete;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [horoscope.date, initialProgress, userId]);

  const updateState = useCallback(
    (next: DailyRitualState) => {
      setState(next);
      saveDailyRitual(userId, horoscope.date, next);
    },
    [horoscope.date, userId],
  );

  const onRead = useCallback(() => {
    setState((current) => {
      if (current.horoscopeRead) return current;
      const next = { ...current, horoscopeRead: true };
      saveDailyRitual(userId, horoscope.date, next);
      return next;
    });
  }, [horoscope.date, userId]);

  useEffect(() => {
    if (!state.horoscopeRead || !state.focus || requested.current) return;
    requested.current = true;
    setPending(true);
    void completeDailyRitual()
      .then((result) => {
        setProgress(result.progress);
        setEarned(result.awardedCredits);
        trackEvent(ANALYTICS_EVENT.dailyRitualCompleted, {
          streak: result.progress.current,
          milestone_credits: result.awardedCredits,
        });
      })
      .catch(() => {
        requested.current = false;
      })
      .finally(() => setPending(false));
  }, [state.focus, state.horoscopeRead]);

  const completed = progress.todayComplete;
  const completedSteps =
    Number(state.horoscopeRead || completed) +
    Number(Boolean(state.focus) || completed);
  const progressPercent = completed ? 100 : completedSteps * 50;

  return (
    <DailyCard
      horoscope={horoscope}
      transits={transits}
      onRead={onRead}
      locale={locale}
    >
      <section
        data-daily-ritual={completed ? "complete" : "pending"}
        className="rounded-md border border-border bg-secondary/35 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              {en ? "Daily Intention" : "დღის პატარა რიტუალი"}
            </div>
            <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
              {progress.current} {en ? "day streak" : "დღიანი სერია"}
            </p>
          </div>
          {progress.next ? (
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {en
                ? `+${progress.next.credits} credits in ${progress.next.daysLeft}d`
                : `${progress.next.daysLeft} დღეში +${progress.next.credits} კრედიტი`}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {en ? "All milestones reached" : "ყველა ნიშნული გავლილია"}
            </span>
          )}
        </div>

        {/* Hairline progress bar in solid warm brass */}
        <div className="mt-3 h-1 overflow-hidden bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-foreground/85">
            {completed
              ? en
                ? "Today's ritual is complete"
                : "დღის რიტუალი დასრულებულია"
              : state.horoscopeRead
                ? en
                  ? "Choose today's focus"
                  : "აირჩიე დღევანდელი ფოკუსი"
                : en
                  ? "Read to the end, then choose your focus"
                  : "ჩაიკითხე ჰოროსკოპი ბოლომდე და აირჩიე ფოკუსი"}
          </p>
          {!completed && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {focuses.map((focus) => (
                <button
                  key={focus}
                  type="button"
                  disabled={!state.horoscopeRead || pending}
                  onClick={() => {
                    updateState({ ...state, focus });
                    trackEvent(ANALYTICS_EVENT.dailyFocusSelected, {
                      option_index: focuses.indexOf(focus),
                    });
                  }}
                  className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending && state.focus === focus ? (
                    <Loader2 className="mr-1 inline size-3 animate-spin text-primary" />
                  ) : null}
                  {focus}
                </button>
              ))}
            </div>
          )}
          {completed && (
            <div className="mt-2.5 space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Check className="size-3.5" />
                {earned > 0
                  ? en
                    ? `Milestone: +${earned} credits`
                    : `ნიშნული: +${earned} კრედიტი`
                  : en
                    ? "Return tomorrow to continue the streak"
                    : "სერიის გასაგრძელებლად ხვალ დაბრუნდი"}
              </p>
              <Link
                href="/account#reminders"
                className="inline-block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {en ? "Choose your reminders →" : "აირჩიე შეხსენებები →"}
              </Link>
            </div>
          )}
        </div>
      </section>
    </DailyCard>
  );
}
