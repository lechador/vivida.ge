import Link from "next/link";

import { Button } from "@/components/ui/button";
import { VividaMark } from "@/components/brand/vivida-mark";
import { LunarPhaseDisc } from "@/components/brand/celestial-icons";
import { computeMoonPhase } from "@/lib/moon-phase";
import { signByIndex } from "@/lib/zodiac";
import { ObservatoryDrawer } from "@/components/nav/observatory-drawer";
import { GEORGIAN_SITE_URL, ENGLISH_SITE_URL } from "@/lib/seo/locales";

const NAV_ITEMS = [
  { path: "/pl/horoskop-urodzeniowy", label: "Horoskop urodzeniowy" },
  { path: "/pl/tarot", label: "Tarot" },
  { path: "/pl/horoskop-partnerski", label: "Horoskop partnerski" },
  { path: "/pl/kalendarz-ksiezycowy", label: "Kalendarz księżycowy" },
  { path: "/pl/znaki-zodiaku", label: "Znaki zodiaku" },
  { path: "/pl/tests", label: "Testy" },
];

const PHASE_LABEL_PL: Record<string, string> = {
  new_moon: "Nów",
  waxing_crescent: "Przybywający sierp",
  first_quarter: "Pierwsza kwadra",
  waxing_gibbous: "Przybywający garb",
  full_moon: "Pełnia",
  waning_gibbous: "Ubywający garb",
  last_quarter: "Trzecia kwadra",
  waning_crescent: "Ubywający sierp",
};

export function PolishHeader({
  georgianPath = "/",
}: {
  georgianPath?: string;
} = {}) {
  const kaUrl = `${GEORGIAN_SITE_URL}${georgianPath === "/" ? "" : georgianPath}`;
  const moonSnapshot = computeMoonPhase(new Date());
  const illumPct = moonSnapshot
    ? Math.round(moonSnapshot.illumination * 100)
    : 50;
  const moonSign = moonSnapshot ? signByIndex(moonSnapshot.signIndex) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      {/* Row 1: Strict 3-Zone Top Bar Contract */}
      <div className="mx-auto flex h-15 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:gap-8 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          href="/pl"
          className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap"
        >
          <VividaMark size={28} id="polish-header" />
          <span className="font-display text-2xl font-medium tracking-tight text-foreground">
            Vivida
          </span>
        </Link>

        {/* Zone 2: Navigation links */}
        <nav
          aria-label="Główna nawigacja"
          className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex xl:gap-7"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={item.path}
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
            Zaloguj się
          </Link>
          <Button asChild size="sm" className="shrink-0 whitespace-nowrap">
            <Link href="/signup">Rozpocznij</Link>
          </Button>
        </div>
      </div>

      {/* Row 2: Persistent Celestial Context Strip + Slide-Over Drawer */}
      <div className="border-t border-border bg-[oklch(0.15_0.038_280)]">
        <div className="mx-auto flex h-9 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="uppercase tracking-[0.16em] text-primary">
              Efemerydy · 52°14′N · 21°01′E
            </span>
            {moonSnapshot && (
              <Link
                href="/pl/kalendarz-ksiezycowy"
                className="inline-flex items-center gap-2 truncate border-l border-border pl-3 transition-colors hover:text-foreground"
              >
                <LunarPhaseDisc
                  phaseAngle={moonSnapshot.phaseAngle}
                  size={15}
                />
                <span className="truncate">
                  {PHASE_LABEL_PL[moonSnapshot.phaseKey] ??
                    moonSnapshot.phaseKey}
                </span>
                <span aria-hidden className="hidden sm:inline">
                  ·
                </span>
                <span className="hidden text-[var(--vivida-gold)] sm:inline">
                  {moonSnapshot.signSymbol}{" "}
                  {moonSign?.labelPl ?? moonSnapshot.signEn}
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
              href={ENGLISH_SITE_URL}
              hrefLang="en"
              className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              EN
            </a>
            <a
              href={kaUrl}
              hrefLang="ka-GE"
              className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              KA
            </a>
            <ObservatoryDrawer authed={false} locale="pl" />
          </div>
        </div>
      </div>
    </header>
  );
}
