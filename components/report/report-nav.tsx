"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
};

const SECTIONS: Section[] = [
  { id: "wheel", label: "რუკა", labelEn: "Chart", Icon: Compass },
  { id: "positions", label: "პოზიციები", labelEn: "Positions", Icon: LayoutList },
  { id: "big-three", label: "დიდი სამეული", labelEn: "Big three", Icon: Sparkles },
  { id: "elements", label: "ელემენტები", labelEn: "Elements", Icon: Flame },
  { id: "planets", label: "პლანეტები", labelEn: "Planets", Icon: Globe2 },
  { id: "houses", label: "სახლები", labelEn: "Houses", Icon: Home },
  { id: "aspects", label: "ასპექტები", labelEn: "Aspects", Icon: Triangle },
];

const SCROLL_OFFSET_DESKTOP = 96;
const SCROLL_OFFSET_MOBILE = 72;

export function ReportNav({ locale = "ka" }: { locale?: UserLocale }) {
  const [active, setActive] = useState<SectionId>("wheel");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Map<SectionId, HTMLAnchorElement>>(new Map());
  const suppressUntilRef = useRef(0);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressUntilRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id as SectionId);
        }
      },
      {
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

  useEffect(() => {
    const tab = tabRefs.current.get(active);
    const scroller = scrollerRef.current;
    if (!tab || !scroller) return;
    const tabBox = tab.getBoundingClientRect();
    const scrollerBox = scroller.getBoundingClientRect();
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
    const offset =
      window.innerWidth < 640 ? SCROLL_OFFSET_MOBILE : SCROLL_OFFSET_DESKTOP;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    if (history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  return (
    <nav
      aria-label={locale !== "ka" ? "Chart navigation" : "რუკის ნავიგაცია"}
      className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6"
    >
      <div className="relative mx-auto max-w-6xl">
        <div
          ref={scrollerRef}
          className="flex gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SECTIONS.map((section) => {
            const isActive = active === section.id;
            const { Icon } = section;
            return (
              <a
                key={section.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(section.id, el);
                  else tabRefs.current.delete(section.id);
                }}
                href={`#${section.id}`}
                onClick={(e) => handleClick(e, section.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group relative inline-flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>
                  {locale !== "ka" ? section.labelEn : section.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
