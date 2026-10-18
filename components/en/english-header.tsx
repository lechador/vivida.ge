import Link from "next/link";

import { Button } from "@/components/ui/button";
import { VividaMark } from "@/components/brand/vivida-mark";
import { LunarPhaseDisc } from "@/components/brand/celestial-icons";
import { computeMoonPhase, PHASE_LABEL_EN } from "@/lib/moon-phase";
import { ObservatoryDrawer } from "@/components/nav/observatory-drawer";
import { GEORGIAN_SITE_URL, englishSiteHref } from "@/lib/seo/locales";
import { requestIsEnglishHost } from "@/lib/i18n/request-locale";

const NAV_ITEMS = [
  { path: "/horoscope", label: "Daily Horoscope" },
  { path: "/natal-chart", label: "Natal Chart" },
  { path: "/zodiac", label: "Zodiac Signs" },
  { path: "/compatibility", label: "Compatibility" },
  { path: "/tests", label: "Tests" },
];

export async function EnglishHeader({
  georgianPath = "/",
}: {
  georgianPath?: string;
}) {
  const onEnglishHost = await requestIsEnglishHost();
  const href = (path: string) => englishSiteHref(path, onEnglishHost);
  const kaUrl = `${GEORGIAN_SITE_URL}${georgianPath === "/" ? "" : georgianPath}`;
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
          href={href("/")}
          className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap"
        >
          <VividaMark size={28} id="english-header" />
          <span className="font-display text-2xl font-medium tracking-tight text-foreground">
            Vivida
          </span>
        </Link>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={href(item.path)}
              className="shrink-0 whitespace-nowrap transition-colors duration-150 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Primary CTA */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/login"
            className="hidden whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Button asChild size="sm" className="shrink-0 whitespace-nowrap">
            <Link href="/signup">Create chart</Link>
          </Button>
        </div>
      </div>

      {/* Row 2: Persistent Celestial Context Strip + Slide-Over Drawer */}
      <div className="border-t border-border bg-[oklch(0.15_0.038_280)]">
        <div className="mx-auto flex h-9 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="uppercase tracking-[0.16em] text-primary">
              Ephemeris · UTC+4
            </span>
            {moonSnapshot && (
              <Link
                href={href("/moon-calendar")}
                className="inline-flex items-center gap-2 truncate border-l border-border pl-3 transition-colors hover:text-foreground"
              >
                <LunarPhaseDisc
                  phaseAngle={moonSnapshot.phaseAngle}
                  size={15}
                />
                <span className="truncate">
                  {PHASE_LABEL_EN[moonSnapshot.phaseKey]}
                </span>
                <span aria-hidden className="hidden sm:inline">
                  ·
                </span>
                <span className="hidden text-[var(--vivida-gold)] sm:inline">
                  {moonSnapshot.signSymbol} {moonSnapshot.signEn}
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
              href={kaUrl}
              hrefLang="ka-GE"
              className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              KA
            </a>
            <ObservatoryDrawer authed={false} locale="en" />
          </div>
        </div>
      </div>
    </header>
  );
}
