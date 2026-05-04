"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { SignInButton } from "./sign-in-button";
import { HOME_CONTENT } from "@/lib/seo/home-content";

export function FinalCta() {
  const c = HOME_CONTENT.finalCta;

  return (
    <section className="relative z-10 mx-auto w-full max-w-4xl px-4 py-24 sm:px-6 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/65 to-[var(--vivida-cyan)]/12 p-8 text-center ring-1 ring-foreground/10 backdrop-blur-xl sm:p-14"
      >
        {/* Animated conic glow */}
        <motion.div
          aria-hidden
          className="absolute -right-32 -top-32 size-96 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 -left-32 size-96 rounded-full bg-[conic-gradient(from_180deg,var(--vivida-cyan),var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] opacity-20 blur-3xl"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />

        <Sparkles className="relative mx-auto mb-4 size-8 text-[var(--vivida-violet)]" />

        <h2 className="relative text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {c.title}
          </span>
        </h2>

        <p className="relative mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          {c.body}
        </p>

        <div className="relative mt-10 flex flex-col items-center gap-3">
          <SignInButton label={c.ctaText} />
          <p className="text-xs text-muted-foreground/80">{c.subtext}</p>
        </div>
      </motion.div>
    </section>
  );
}
