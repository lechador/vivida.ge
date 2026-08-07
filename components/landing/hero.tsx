"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { SignInButton } from "./sign-in-button";
import { HeroPreview } from "./hero-preview";
import { HOME_CONTENT } from "@/lib/seo/home-content";

export function Hero() {
  const c = HOME_CONTENT.hero;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Mouse-tracked parallax for the gradient orb behind the hero.
  // Skipped on touch devices and on user pref reduce-motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setParallax({
        x: (e.clientX / w - 0.5) * 30,
        y: (e.clientY / h - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={wrapperRef}
      className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-8 text-center sm:pb-24 sm:pt-20 lg:pt-24"
    >
      {/* Parallax gradient orb behind the hero */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, var(--vivida-violet), var(--vivida-pink), var(--vivida-cyan), var(--vivida-violet))",
        }}
        animate={{
          x: parallax.x,
          y: parallax.y,
          rotate: [0, 360],
        }}
        transition={{
          x: { duration: 0.8, ease: "easeOut" },
          y: { duration: 0.8, ease: "easeOut" },
          rotate: { duration: 90, repeat: Infinity, ease: "linear" },
        }}
      />

      {/* Keep the promise and primary action first in the DOM and on mobile.
          Desktop retains the product preview above the copy via flex order. */}
      <span
        className="order-1 mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur sm:order-2 sm:mb-5"
      >
        <span className="size-1.5 rounded-full bg-[var(--vivida-cyan)] vivida-pulse" />
        {c.kicker}
      </span>

      <h1
        className="order-2 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:order-3 sm:text-6xl md:text-7xl"
      >
        {c.headlinePre}{" "}
        <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
          {c.headlineGradient}
        </span>
        {c.headlinePost ? (
          <>
            <br className="hidden sm:block" />
            {" "}
            {c.headlinePost}
          </>
        ) : null}
      </h1>

      <div className="order-3 mt-6 sm:order-4 sm:mt-8">
        <SignInButton label={c.ctaPrimary} loadingLabel={c.ctaPrimaryLoading} />
      </div>

      <p
        className="order-4 mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:order-5 sm:mt-6 sm:text-lg"
      >
        {c.subhead}
      </p>

      {/* Trust chips — promoted from gray micro-text into prominent
          check-pills. The "no card required" line is the strongest trust
          signal we have, so it deserves real visual weight on cold
          ad-driven traffic. */}
      <div
        className="order-5 mt-4 flex flex-wrap items-center justify-center gap-2 sm:order-6 sm:mt-5"
      >
        {c.microNotes.map((note) => (
          <span
            key={note}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200"
          >
            <Check className="size-3.5" strokeWidth={3} />
            {note}
          </span>
        ))}
      </div>

      {/* Single secondary action — email signup. The header already has
          "შესვლა" for returning users; one obvious primary action wins. */}
      <p
        className="order-6 mt-4 text-xs text-muted-foreground sm:order-7"
      >
        <Link
          href="/signup"
          className="underline-offset-2 hover:text-foreground hover:underline"
        >
          {c.secondary}
        </Link>
      </p>

      <div className="order-7 mt-10 w-full sm:order-1 sm:mt-0">
        <HeroPreview />
      </div>
    </section>
  );
}
