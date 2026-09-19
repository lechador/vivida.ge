"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Clock3,
  Fingerprint,
  Heart,
  Radar,
  Sparkles,
} from "lucide-react";

import type { TestCatalogEntry } from "@/lib/tests-catalog";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

const ICONS: Record<string, typeof Brain> = {
  iq: Brain,
  eq: Heart,
  "big-five": Radar,
  "astro-mbti": Fingerprint,
  "true-sign": Sparkles,
  "famous-zodiac": Sparkles,
};

const ACCENTS: Record<string, string> = {
  iq: "var(--vivida-cyan)",
  eq: "var(--vivida-gold)",
  "big-five": "var(--vivida-violet)",
  "astro-mbti": "var(--vivida-pink)",
  "true-sign": "var(--vivida-gold)",
  "famous-zodiac": "var(--vivida-pink)",
};

/** Compact dashboard cross-sell: one relevant unfinished test, never a grid. */
export function DashboardTestPromo({
  test,
  allCompleted,
  locale = "ka",
}: {
  test: TestCatalogEntry;
  allCompleted: boolean;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const Icon = ICONS[test.slug] ?? Sparkles;
  const accent = ACCENTS[test.slug] ?? "var(--vivida-violet)";

  return (
    <aside className="mt-7 overflow-hidden rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl">
      <Link
        href={test.href}
        onClick={() =>
          trackEvent(ANALYTICS_EVENT.recommendationClicked, {
            placement: "dashboard_test_promo",
            destination: test.slug,
            product: "test",
          })
        }
        className="group flex items-center gap-4 p-4 transition-colors hover:bg-card/75 sm:p-5"
      >
        <span
          className="grid size-11 shrink-0 place-items-center rounded-2xl"
          style={{
            color: accent,
            background: `color-mix(in oklch, ${accent} 15%, transparent)`,
          }}
        >
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {allCompleted
              ? en
                ? "A quick quiz for you"
                : "სწრაფი ქვიზი შენთვის"
              : en
                ? "Complete your profile"
                : "შეავსე შენი პროფილი"}
          </span>
          <span className="mt-0.5 block font-semibold tracking-tight">
            {en ? test.titleEn : test.titleKa}
          </span>
          <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground sm:text-sm">
            {en ? test.taglineEn : test.taglineKa}
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock3 className="size-3" /> {en ? test.metaEn : test.metaKa}
          </span>
        </span>
        <span
          className="hidden shrink-0 items-center gap-1 text-sm font-medium sm:flex"
          style={{ color: accent }}
        >
          {en ? "Start" : "დაწყება"}{" "}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground sm:hidden" />
      </Link>
    </aside>
  );
}
