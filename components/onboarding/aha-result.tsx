"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ANALYTICS_EVENT,
  productEventBase,
  trackEvent,
  trackFirstResultViewed,
} from "@/lib/analytics";
import { chartStarterOptions } from "@/lib/chart-chat-starters";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { browserTrackingAllowed } from "@/lib/tracking-consent";

export type AhaPlacement = {
  kind: "sun" | "moon" | "ascendant";
  label: string;
  glyph: string;
  sign: string;
  signSymbol: string;
  meaning: string;
  interpretation?: string;
};

export function AhaResult({
  firstName,
  placements,
  next,
  locale,
}: {
  firstName: string | null;
  placements: AhaPlacement[];
  next: string;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const starters = chartStarterOptions(locale).slice(0, 3);
  const featureDestination = next !== "/report";
  const resultTracked = useRef(false);

  useEffect(() => {
    let retryTimer: ReturnType<typeof setInterval> | undefined;

    function stopRetry() {
      if (retryTimer) clearInterval(retryTimer);
      retryTimer = undefined;
    }

    function recordResult() {
      trackFirstResultViewed({
        product: "natal_chart",
        surface: "onboarding_aha",
      });
      if (!resultTracked.current) {
        resultTracked.current = trackEvent(
          ANALYTICS_EVENT.onboardingResultViewed,
          {
            ...productEventBase("natal_chart", "onboarding_aha", locale),
            outcome: "rendered",
          },
        );
      }
    }

    function startTracking() {
      stopRetry();
      recordResult();
      // Consent can be granted before the analytics script has mounted.
      // Retry briefly without counting the same rendered result twice.
      if (!browserTrackingAllowed() || resultTracked.current) return;
      let attempts = 0;
      retryTimer = setInterval(() => {
        recordResult();
        if (
          ++attempts >= 20 ||
          resultTracked.current ||
          !browserTrackingAllowed()
        ) {
          stopRetry();
        }
      }, 250);
    }

    startTracking();
    window.addEventListener("vivida:tracking-granted", startTracking);
    window.addEventListener("vivida:tracking-denied", stopRetry);
    return () => {
      stopRetry();
      window.removeEventListener("vivida:tracking-granted", startTracking);
      window.removeEventListener("vivida:tracking-denied", stopRetry);
    };
  }, [locale]);

  function trackRecommendation(destination: string, recommendation: string) {
    trackEvent(ANALYTICS_EVENT.recommendationClicked, {
      placement: "onboarding_aha",
      destination,
      product: "natal_chart",
      recommendation,
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)] shadow-[0_0_50px_oklch(0.65_0.24_305/0.25)]">
          <Sparkles className="size-6" />
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-[var(--vivida-cyan)]">
          {en ? "Your chart is ready" : "შენი რუკა მზადაა"}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {firstName ? `${firstName}, ` : ""}
          {en ? "meet your Big Three" : "გაიცანი შენი დიდი სამეული"}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-foreground/75 sm:text-base">
          {en
            ? "Your Sun describes your core, your Moon your inner world, and your Rising sign how you meet life."
            : "მზე შენს ბირთვს აღწერს, მთვარე, შინაგან სამყაროს, ამომავალი კი, როგორ ხვდები ცხოვრებას."}
        </p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {placements.map((placement) => (
          <article
            key={placement.kind}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-xl"
          >
            <span
              aria-hidden
              className="absolute right-4 top-3 text-4xl text-[var(--vivida-violet)]/20"
            >
              {placement.glyph}
            </span>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {placement.label}
            </p>
            <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
              <span className="text-[var(--vivida-violet)]">
                {placement.signSymbol}
              </span>
              {placement.sign}
            </h2>
            <p className="mt-1 text-xs text-[var(--vivida-cyan)]">
              {placement.meaning}
            </p>
            {placement.interpretation && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                {placement.interpretation}
              </p>
            )}
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--vivida-violet)]/25 bg-[var(--vivida-violet)]/8 p-5 text-center backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <MessageCircle className="size-4 text-[var(--vivida-violet)]" />
          {en
            ? "What do you want to discover first?"
            : "რის გაგებას ისურვებდი პირველად?"}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {starters.map((starter) => (
            <Link
              key={starter.id}
              href={`/ask?starter=${starter.id}`}
              onClick={() => trackRecommendation("ai_chart_chat", starter.id)}
              className="rounded-full border border-[var(--vivida-violet)]/35 bg-background/35 px-4 py-2 text-sm text-foreground/90 transition-colors hover:bg-[var(--vivida-violet)]/18"
            >
              {starter.text}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {en
            ? "Your question will be prefilled, never sent without your confirmation."
            : "შეკითხვა წინასწარ შეივსება და შენი დასტურის გარეშე არ გაიგზავნება."}
        </p>
      </section>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="mystic" size="lg">
          <Link
            href={next}
            onClick={() =>
              trackRecommendation(
                featureDestination ? "original_feature" : "full_natal_report",
                "primary_continue",
              )
            }
          >
            {featureDestination
              ? en
                ? "Continue"
                : "გაგრძელება"
              : en
                ? "Explore my full chart"
                : "სრული რუკის ნახვა"}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link
            href="/dashboard"
            onClick={() => trackRecommendation("daily_dashboard", "see_today")}
          >
            <CalendarDays className="size-4" />
            {en ? "See today's guidance" : "დღევანდელი გზავნილის ნახვა"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
