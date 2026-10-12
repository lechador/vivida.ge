"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight scroll-reveal, the CSS replacement for framer-motion's
 * `initial/whileInView` fade-up that used to make every landing section a
 * client island. Cuts hydration + main-thread animation work (the mobile INP
 * regression Search Console flagged): the animation runs on the compositor
 * via a CSS transition, and a single page-shared IntersectionObserver toggles
 * one attribute, versus framer-motion attaching a per-element observer and
 * running a JS rAF loop per node.
 *
 * The wrapped section itself can stay a server component; only this thin
 * wrapper hydrates. Visual output matches the old motion values: opacity 0→1
 * plus a `y`px upward slide, staggered by `delayMs`.
 */

// One observer for every Reveal on the page. Standardized rootMargin (the old
// per-section -40…-100px values were visually indistinguishable).
let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          callbacks.get(entry.target)?.();
          callbacks.delete(entry.target);
          sharedObserver!.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    );
  }
  return sharedObserver;
}

type RevealProps = {
  as?: ElementType;
  className?: string;
  /** Upward slide distance in px (matches the old motion `y`). */
  y?: number;
  /** Stagger delay in ms. */
  delayMs?: number;
  /** Transition duration in ms. */
  durationMs?: number;
  children: ReactNode;
} & Record<string, unknown>;

export function Reveal({
  as: Tag = "div",
  className,
  y = 24,
  delayMs = 0,
  durationMs = 700,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => el.setAttribute("data-revealed", "true");

    const observer = getObserver();
    // No IO support → just show it. Same for anything already in view on
    // mount (above the fold), so it doesn't wait for a scroll that never comes.
    if (!observer || el.getBoundingClientRect().top < window.innerHeight) {
      reveal();
      return;
    }

    callbacks.set(el, reveal);
    observer.observe(el);
    // Safety net: never leave content permanently hidden if the observer
    // somehow misses (e.g. element never scrolled into a tracked position).
    const fallback = window.setTimeout(reveal, 1500);
    return () => {
      window.clearTimeout(fallback);
      observer.unobserve(el);
      callbacks.delete(el);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      style={
        {
          "--reveal-y": `${y}px`,
          "--reveal-dur": `${durationMs}ms`,
          "--reveal-delay": `${delayMs}ms`,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}
