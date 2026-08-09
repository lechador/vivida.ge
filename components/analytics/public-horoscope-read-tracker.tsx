"use client";

import { useEffect, useRef } from "react";

import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { HoroscopeView } from "@/lib/sign-horoscope";
import type { ZodiacSlug } from "@/lib/seo/zodiac-dates";

/**
 * A zero-visual-cost sentinel placed after the public horoscope body. Reaching
 * it is a stronger value signal than a pageview and powers anonymous content
 * completion + return-channel experiments.
 */
export function PublicHoroscopeReadTracker({
  sign,
  view,
}: {
  sign: ZodiacSlug;
  view: HoroscopeView;
}) {
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || trackedRef.current)
          return;
        trackedRef.current = true;
        trackEvent(ANALYTICS_EVENT.publicHoroscopeRead, { sign, view });
        observer.disconnect();
      },
      { threshold: 0.6 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sign, view]);

  return <span ref={sentinelRef} aria-hidden className="block h-px w-px" />;
}
