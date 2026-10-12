"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Flame,
  Globe2,
  Home,
  LayoutList,
  Sparkles,
  Triangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

type SectionId =
  | "wheel"
  | "positions"
  | "big-three"
  | "elements"
  | "planets"
  | "houses"
  | "aspects";

type Section = {
  id: SectionId;
  label: string;
  labelEn: string;
  Icon: LucideIcon;
  /** Per-tab hue for the active glow, keeps the nav playful but cohesive. */
  hue: string;
};

const SECTIONS: Section[] = [
  { id: "wheel", label: "რუკა", labelEn: "Chart", Icon: Compass, hue: "oklch(0.78 0.18 305)" },
  { id: "positions", label: "პოზიციები", labelEn: "Positions", Icon: LayoutList, hue: "oklch(0.78 0.16 250)" },
  { id: "big-three", label: "დიდი სამეული", labelEn: "Big three", Icon: Sparkles, hue: "oklch(0.85 0.16 85)" },
  { id: "elements", label: "ელემენტები", labelEn: "Elements", Icon: Flame, hue: "oklch(0.72 0.22 25)" },
  { id: "planets", label: "პლანეტები", labelEn: "Planets", Icon: Globe2, hue: "oklch(0.78 0.15 195)" },
  { id: "houses", label: "სახლები", labelEn: "Houses", Icon: Home, hue: "oklch(0.72 0.18 145)" },
  { id: "aspects", label: "ასპექტები", labelEn: "Aspects", Icon: Triangle, hue: "oklch(0.72 0.22 350)" },
];

// Pixel offsets matching `scroll-mt-*` so smooth-scrolls land below the
// sticky nav with breathing room. Mobile nav is shorter, so a smaller
// offset prevents a big empty gap above each section.
const SCROLL_OFFSET_DESKTOP = 96;
const SCROLL_OFFSET_MOBILE = 72;

/**
 * Sticky in-page tab nav for /report. Scroll-spy via IntersectionObserver,
 * smooth-scroll on click without a browser hash-jump, and the active pill
 * auto-scrolls into the nav viewport so it's always visible.
 */
export function ReportNav({ locale = "ka" }: { locale?: UserLocale }) {
  const [active, setActive] = useState<SectionId>("wheel");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Map<SectionId, HTMLAnchorElement>>(new Map());
  // Suppresses scroll-spy briefly after a click, otherwise the IO fires
  // mid-scroll and flips active to a section we're scrolling *through*.
  const suppressUntilRef = useRef(0);

  // Scroll spy. IntersectionObserver fires once on attach for already-visible
  // entries, so deep-links like /report#aspects set the right pill on mount.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressUntilRef.current) return;
        // Of the entries currently intersecting the active band, pick the
        // one whose top is closest to (but below) the band's upper edge.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id as SectionId);
        }
      },
      {
        // Active band ~ 25%-35% from viewport top: gives the pill enough
        // anticipation while preventing hairline-thin sections from being
        // perpetually "active".
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0,
      }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Auto-scroll the active pill into view inside the horizontal scroller.
  useEffect(() => {
    const tab = tabRefs.current.get(active);
    const scroller = scrollerRef.current;
    if (!tab || !scroller) return;
    const tabBox = tab.getBoundingClientRect();
    const scrollerBox = scroller.getBoundingClientRect();
    // Center the pill inside the visible nav window.
    const target =
      scroller.scrollLeft +
      (tabBox.left - scrollerBox.left) -
      scrollerBox.width / 2 +
      tabBox.width / 2;
    scroller.scrollTo({ left: target, behavior: "smooth" });
  }, [active]);

  const handleClick = useCallback((e: React.MouseEvent, id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setActive(id);
    suppressUntilRef.current = Date.now() + 700;
    // Scroll using window so we control the offset; section's `scroll-mt-24`
    // also handles native hash-jump, but we want a smooth, controlled motion.
    const offset =
      window.innerWidth < 640 ? SCROLL_OFFSET_MOBILE : SCROLL_OFFSET_DESKTOP;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    // Update hash without the jump. Use replaceState so back-button isn't
    // littered with one entry per section view.
    if (history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  return (
    <nav
      aria-label={locale !== "ka" ? "Chart navigation" : "რუკის ნავიგაცია"}
      className="sticky top-0 z-30 -mx-4 border-b border-border/40 bg-background/80 px-4 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6 sm:py-3"
    >
      <div className="relative mx-auto max-w-6xl">
        {/* Edge fades, hint that the nav scrolls horizontally. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background/95 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background/95 to-transparent"
        />

        <div
          ref={scrollerRef}
          className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SECTIONS.map((section) => (
            <NavPill
              key={section.id}
              section={section}
              isActive={active === section.id}
              onClick={handleClick}
              registerRef={(el) => {
                if (el) tabRefs.current.set(section.id, el);
                else tabRefs.current.delete(section.id);
              }}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavPill({
  section,
  isActive,
  onClick,
  registerRef,
  locale,
}: {
  section: Section;
  isActive: boolean;
  onClick: (e: React.MouseEvent, id: SectionId) => void;
  registerRef: (el: HTMLAnchorElement | null) => void;
  locale: UserLocale;
}) {
  const { Icon } = section;
  return (
    <a
      ref={registerRef}
      href={`#${section.id}`}
      onClick={(e) => onClick(e, section.id)}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "group relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
      style={{ ["--pill-hue" as string]: section.hue } as React.CSSProperties}
    >
      {/* Shared layout pill, slides smoothly between tabs. */}
      {isActive && (
        <motion.span
          layoutId="report-nav-active"
          aria-hidden
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--pill-hue) 24%, transparent), color-mix(in oklch, var(--pill-hue) 12%, transparent))",
            boxShadow:
              "0 6px 22px -10px color-mix(in oklch, var(--pill-hue) 60%, transparent), inset 0 0 0 1px color-mix(in oklch, var(--pill-hue) 32%, transparent)",
          }}
        />
      )}
      {/* Hover background on inactive tabs */}
      {!isActive && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-card/40 opacity-0 ring-1 ring-foreground/5 transition-opacity duration-200 group-hover:opacity-100"
        />
      )}

      <Icon
        className="relative z-10 size-4 transition-transform duration-200 group-hover:-rotate-6"
        style={
          isActive
            ? { color: section.hue, filter: `drop-shadow(0 0 6px ${section.hue})` }
            : undefined
        }
      />
      <span className="relative z-10">
        {locale !== "ka" ? section.labelEn : section.label}
      </span>
    </a>
  );
}
