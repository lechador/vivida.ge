"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { VividaMark } from "@/components/brand/vivida-mark";
import { LunarPhaseDisc } from "@/components/brand/celestial-icons";
import { computeMoonPhase } from "@/lib/moon-phase";
import { ObservatoryDrawer } from "@/components/nav/observatory-drawer";
import { englishSiteHref, resolveEnglishPath } from "@/lib/seo/locales";

const NAV_LINKS = [
  { href: "/horoskopi", label: "ჰოროსკოპი" },
  { href: "/nataluri-ruka", label: "ნატალური რუკა" },
  { href: "/zodiac", label: "ზოდიაქო" },
  { href: "/taro", label: "ტარო" },
  { href: "/tests", label: "ტესტები" },
];

export function MarketingHeader({
  active,
  englishPath,
}: {
  active?: string;
  englishPath?: string;
} = {}) {
  const pathname = usePathname() || "/";
  const enHref = englishSiteHref(
    englishPath ?? resolveEnglishPath(pathname),
    true,
  );
  const moonSnapshot = useMemo(() => computeMoonPhase(new Date()), []);
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
        <nav
          aria-label="მთავარი ნავიგაცია"
          className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
        >
          {NAV_LINKS.map((item) => {
            const isCurrent =
              active === item.href.slice(1) ||
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 whitespace-nowrap transition-colors duration-150 hover:text-foreground ${
                  isCurrent
                    ? "text-foreground underline decoration-primary decoration-1 underline-offset-8"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

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
      <div className="border-t border-border/70 bg-card/75">
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
                <span className="hidden text-primary sm:inline">
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
            <a
              href={enHref}
              hrefLang="en"
              className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              EN
            </a>
            <ObservatoryDrawer authed={false} locale="ka" />
          </div>
        </div>
      </div>
    </header>
  );
}
