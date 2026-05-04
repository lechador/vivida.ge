"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Compass,
  Heart,
  Orbit,
  Telescope,
  Library,
} from "lucide-react";

import { HOME_CONTENT } from "@/lib/seo/home-content";

const ICONS = [Compass, Orbit, Sparkles, Heart, Telescope, Library];

export function FeaturesSection() {
  const features = HOME_CONTENT.features;
  const what = HOME_CONTENT.whatIsSection;

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      {/* What is a natal chart — explainer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mb-16 max-w-3xl text-center sm:mb-20"
      >
        {what.kicker && (
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {what.kicker}
          </div>
        )}
        <h2 className="mb-5 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {what.title}
        </h2>
        <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
          {what.body
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      </motion.div>

      {/* Feature grid */}
      <motion.h3
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        ფუნქციები, რომლებზე გითხარი
      </motion.h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                delay: (i % 3) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/75 hover:ring-foreground/15"
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 size-32 rounded-full bg-[radial-gradient(circle,var(--vivida-violet)_0%,transparent_70%)] opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
              />
              <div className="relative grid size-10 place-items-center rounded-xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 text-[var(--vivida-violet)]">
                <Icon className="size-4" />
              </div>
              <h4 className="relative mt-4 text-base font-semibold tracking-tight">
                {f.title}
              </h4>
              <p className="relative mt-1.5 text-pretty text-sm leading-relaxed text-foreground/75">
                {f.body}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
