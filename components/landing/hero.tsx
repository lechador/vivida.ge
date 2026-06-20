"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Check } from "lucide-react";

import { SignInButton } from "./sign-in-button";
import { HeroPreview } from "./hero-preview";
import { HOME_CONTENT } from "@/lib/seo/home-content";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: EASE_OUT_EXPO },
  }),
};

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
      className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20 lg:pt-24"
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

      {/* Product preview — chart wheel + floating snippet cards */}
      <HeroPreview />

      <motion.span
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
      >
        <span className="size-1.5 rounded-full bg-[var(--vivida-cyan)] vivida-pulse" />
        {c.kicker}
      </motion.span>

      <motion.h1
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
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
      </motion.h1>

      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-8"
      >
        <SignInButton label={c.ctaPrimary} loadingLabel={c.ctaPrimaryLoading} />
      </motion.div>

      <motion.p
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
      >
        {c.subhead}
      </motion.p>

      {/* Trust chips — promoted from gray micro-text into prominent
          check-pills. The "no card required" line is the strongest trust
          signal we have, so it deserves real visual weight on cold
          ad-driven traffic. */}
      <motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-5 flex flex-wrap items-center justify-center gap-2"
      >
        {c.microNotes.map((note) => (
          <span
            key={note}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-700"
          >
            <Check className="size-3.5" strokeWidth={3} />
            {note}
          </span>
        ))}
      </motion.div>

      {/* Single secondary action — email signup. The header already has
          "შესვლა" for returning users; one obvious primary action wins. */}
      <motion.p
        custom={5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-4 text-xs text-muted-foreground"
      >
        <Link
          href="/signup"
          className="underline-offset-2 hover:text-foreground hover:underline"
        >
          {c.secondary}
        </Link>
      </motion.p>
    </section>
  );
}
