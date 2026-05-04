"use client";

import { motion } from "framer-motion";
import { Map, Sparkles, Users } from "lucide-react";

import { HOME_CONTENT } from "@/lib/seo/home-content";

const ICONS = [Map, Sparkles, Users];
const ACCENTS = [
  "oklch(0.78 0.18 305)",
  "oklch(0.78 0.18 200)",
  "oklch(0.72 0.22 350)",
];

export function PillarsSection() {
  const pillars = HOME_CONTENT.pillars;

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {pillars.map((p, i) => {
          const Icon = ICONS[i] ?? Sparkles;
          const accent = ACCENTS[i] ?? "oklch(0.78 0.18 305)";
          return (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-card/75 hover:ring-foreground/15 sm:p-8"
            >
              <div
                aria-hidden
                className="absolute -right-12 -top-12 size-40 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
                style={{
                  background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                }}
              />
              <div
                className="relative grid size-12 place-items-center rounded-2xl"
                style={{
                  background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                  color: accent,
                }}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="relative mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
                {p.title}
              </h3>
              <p className="relative mt-2 text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
                {p.body}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
