"use client";

import { motion } from "framer-motion";

import { HOME_CONTENT } from "@/lib/seo/home-content";

export function HowItWorksSection() {
  const c = HOME_CONTENT.howItWorks;

  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 text-balance text-center text-3xl font-semibold tracking-tight sm:mb-14 sm:text-5xl"
      >
        {c.title}
      </motion.h2>

      <div className="relative">
        {/* Connecting line behind the steps (desktop only) */}
        <div
          aria-hidden
          className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-transparent via-[var(--vivida-violet)]/30 to-transparent md:block"
        />

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {c.steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative mb-5">
                {/* Conic gradient halo */}
                <div
                  aria-hidden
                  className="absolute inset-0 -m-2 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-40 blur-md"
                />
                <div
                  className="relative grid size-14 place-items-center rounded-full border border-border bg-card/85 text-base font-semibold tabular-nums backdrop-blur-xl"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px oklch(1 0 0 / 0.08), 0 0 24px -8px var(--vivida-violet)",
                  }}
                >
                  <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                    {String(step.n).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
