"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { DiscoverCard } from "@/lib/discover";
import { cn } from "@/lib/utils";
import { SuggestedPersonCard } from "./suggested-person-card";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Horizontal scroll rail of the most compatible public-profile users.
 * Mouse: drag the rail or use the chevron buttons. Vertical wheel is
 * translated to horizontal scroll while hovering inside.
 * Touch: native momentum scroll.
 */
export function SuggestedPeopleRail({
  suggestions,
  locale = "ka",
}: {
  suggestions: DiscoverCard[];
  locale?: UserLocale;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const left = el.scrollLeft;
      const max = el.scrollWidth - el.clientWidth;
      setCanLeft(left > 4);
      setCanRight(left < max - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [suggestions.length]);

  // Mouse drag-to-scroll + vertical-wheel-to-horizontal-scroll. Skipped
  // for touch where native momentum is better. The 4px DRAG_THRESHOLD
  // lets a clean click through to the underlying <Link>; once we're past
  // it we treat the gesture as a drag and swallow the trailing click so
  // we don't navigate into whichever card the cursor was over on release.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const DRAG_THRESHOLD = 4;
    let pointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let didDrag = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      didDrag = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      if (!didDrag && Math.abs(dx) >= DRAG_THRESHOLD) {
        didDrag = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add("is-dragging");
      }
      if (didDrag) {
        // Direct write — auto behavior + no scroll-snap means the rail
        // tracks the cursor 1:1 without the browser fighting us.
        el.scrollLeft = startScroll - dx;
      }
    };

    const endDrag = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      el.classList.remove("is-dragging");
      if (didDrag) {
        const swallow = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        el.addEventListener("click", swallow, { capture: true, once: true });
      }
    };

    // Vertical wheel → horizontal scroll. Honour explicit horizontal
    // wheel events (trackpad two-finger sideways) by passing through.
    const onWheel = (e: WheelEvent) => {
      // If the user is already scrolling horizontally (trackpad), let it
      // through unmodified.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + e.deltaY;
      // Only intercept if we can actually consume the scroll — otherwise
      // let the page scroll vertically as the user expects.
      if ((e.deltaY > 0 && el.scrollLeft >= max) || (e.deltaY < 0 && el.scrollLeft <= 0)) {
        return;
      }
      e.preventDefault();
      el.scrollLeft = Math.max(0, Math.min(max, next));
    };

    // Without this, mousedown on a card's <img> triggers HTML5
    // image-drag and on a card's text triggers text selection — both
    // hijack the cursor and our scroll-drag never runs.
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onSelectStart = (e: Event) => {
      // Only block selection that originates from a mouse press; keyboard
      // selection (shift+arrow) is rare here but harmless.
      if (pointerId !== null) e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("selectstart", onSelectStart);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("selectstart", onSelectStart);
    };
  }, []);

  if (suggestions.length === 0) return null;

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <section>
      <div className="mb-2 flex justify-end">
        <Link
          href="/people"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {locale === "en" ? "View all →" : "ყველა →"}
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label={locale === "en" ? "Previous" : "უკან"}
          className={cn(
            "absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 p-2 text-foreground shadow-lg backdrop-blur transition-opacity hover:bg-background sm:flex",
            canLeft ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label={locale === "en" ? "Next" : "წინ"}
          className={cn(
            "absolute right-0 top-1/2 z-10 hidden translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 p-2 text-foreground shadow-lg backdrop-blur transition-opacity hover:bg-background sm:flex",
            canRight ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <ChevronRight className="size-4" />
        </button>

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-background to-transparent transition-opacity",
            canLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-background to-transparent transition-opacity",
            canRight ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Negative margin lets the rail bleed to the screen edge on mobile.
            No scroll-snap on desktop — it fights mouse drag. The
            `is-dragging` class disables pointer-events on children so the
            drag can't accidentally start a Link/Button click mid-drag. */}
        <div
          ref={scrollerRef}
          className="-mx-4 flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-2 [scrollbar-width:none] [&.is-dragging]:scroll-auto [&.is-dragging_*]:pointer-events-none [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:cursor-grab sm:select-none sm:px-6 sm:[&.is-dragging]:cursor-grabbing sm:[&_img]:select-none"
        >
          {suggestions.map((person) => (
            <SuggestedPersonCard key={person.userId} person={person} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
