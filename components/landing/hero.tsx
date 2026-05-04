"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";

import { SignInButton } from "./sign-in-button";
import { ZodiacWheel } from "./zodiac-wheel";
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
      className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-16 text-center sm:pt-20 lg:pt-24"
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

      {/* Animated zodiac wheel — sits above headline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
        className="relative mb-6 sm:mb-8"
      >
        <ZodiacWheel size={140} />
      </motion.div>

      <motion.span
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur"
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
        <br className="hidden sm:block" />
        {" "}
        {c.headlinePost}
      </motion.h1>

      <motion.p
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
      >
        {c.subhead}
      </motion.p>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-10"
      >
        <SignInButton label={c.ctaPrimary} loadingLabel={c.ctaPrimaryLoading} />
      </motion.div>

      <motion.p
        custom={4}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-4 text-xs text-muted-foreground/80"
      >
        {c.microNotes.join(" · ")}
      </motion.p>

      <motion.p
        custom={5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-3 text-sm text-muted-foreground"
      >
        <Link
          href="/signup"
          className="text-foreground underline-offset-2 hover:underline"
        >
          {c.secondary}
        </Link>
        {" · "}
        <Link
          href="/login"
          className="text-foreground underline-offset-2 hover:underline"
        >
          შესვლა
        </Link>
      </motion.p>
    </section>
  );
}
