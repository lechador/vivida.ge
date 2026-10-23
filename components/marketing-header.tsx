import Link from "next/link";

import { Button } from "@/components/ui/button";
import { VividaMark } from "@/components/brand/vivida-mark";
import { LunarPhaseDisc } from "@/components/brand/celestial-icons";
import { computeMoonPhase } from "@/lib/moon-phase";
import { ObservatoryDrawer } from "@/components/nav/observatory-drawer";
import {
  MarketingEnglishLink,
  MarketingHeaderNav,
} from "./marketing-header-client";

export function MarketingHeader({
  active,
  englishPath,
}: {
  active?: string;
  englishPath?: string;
} = {}) {
  const moonSnapshot = computeMoonPhase(new Date());
  const illumPct = moonSnapshot
    ? Math.round(moonSnapshot.illumination * 100)
    : 50;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      {/* Row 1: Strict 3-Zone Top Bar Contract */}
      <div className="mx-auto flex h-15 w-full max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap"
        >
          <VividaMark size={28} id="marketing-header" />
          <span className="font-display text-2xl font-medium tracking-tight text-foreground">
            Vivida
          </span>
        </Link>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <MarketingHeaderNav active={active} />

        {/* Zone 3: Primary action */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/login"
            className="hidden whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            შესვლა
          </Link>
          <Button asChild size="sm" className="shrink-0 whitespace-nowrap">
            <Link href="/signup">რუკის შექმნა</Link>
          </Button>
        </div>
      </div>

      {/* Row 2: Persistent Celestial Context Strip + Slide-Over Almanac Drawer */}
      <div className="border-t border-border bg-[oklch(0.15_0.038_280)]">
        <div className="mx-auto flex h-9 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="uppercase tracking-[0.16em] text-primary">
              41°43′N · 44°47′E
            </span>
            {moonSnapshot && (
              <Link
                href="/mtvaris-kalendari"
                className="inline-flex items-center gap-2 truncate border-l border-border pl-3 transition-colors hover:text-foreground"
              >
                <LunarPhaseDisc
                  phaseAngle={moonSnapshot.phaseAngle}
                  size={15}
                />
                <span className="truncate">{moonSnapshot.phaseLabelKa}</span>
                <span aria-hidden className="hidden sm:inline">
                  ·
                </span>
                <span className="hidden text-[var(--vivida-gold)] sm:inline">
                  {moonSnapshot.signSymbol} {moonSnapshot.signKa}
                </span>
                <span aria-hidden className="hidden sm:inline">
                  ·
                </span>
                <span className="hidden sm:inline">{illumPct}%</span>
              </Link>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <MarketingEnglishLink englishPath={englishPath} />
            <ObservatoryDrawer authed={false} locale="ka" />
          </div>
        </div>
      </div>
    </header>
  );
}
