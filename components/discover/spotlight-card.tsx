"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  overallVerdict,
} from "@/lib/synastry";
import type { SpotlightMatch } from "@/lib/discover";

const ELEMENT_HEX: Record<string, string> = {
  ცეცხლი: "oklch(0.7 0.22 30)",
  მიწა: "oklch(0.65 0.13 130)",
  ჰაერი: "oklch(0.75 0.16 220)",
  წყალი: "oklch(0.6 0.2 280)",
};

const CATEGORY_COLOR: Record<string, string> = {
  love: "oklch(0.72 0.22 350)",
  friendship: "oklch(0.85 0.16 85)",
  communication: "oklch(0.75 0.16 220)",
  growth: "oklch(0.65 0.13 130)",
  chemistry: "oklch(0.7 0.22 30)",
};

export function SpotlightCard({ match }: { match: SpotlightMatch }) {
  const { card, synastry } = match;
  const verdict = overallVerdict(synastry.overall);
  const accent = ELEMENT_HEX[card.sunElement];
  const heroSrc = card.photoUrl ?? card.image;

  // Top 2 categories by score
  const topCategories = [...CATEGORIES]
    .sort((a, b) => synastry.scores[b] - synastry.scores[a])
    .slice(0, 2);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-12 mt-8 overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/40 bg-card/65 ring-1 ring-foreground/10 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="absolute -right-24 -top-24 size-80 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-30 blur-3xl"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute -bottom-20 -left-16 size-72 rounded-full opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
        }}
      />

      <div className="relative grid sm:grid-cols-[280px_1fr]">
        {/* Hero photo */}
        <div className="relative aspect-square overflow-hidden sm:aspect-auto sm:h-full sm:min-h-[320px]">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt=""
              fill
              sizes="(min-width: 640px) 280px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 grid place-items-center"
              style={{
                background: `linear-gradient(135deg, ${accent} 0%, oklch(0.3 0.18 280) 70%)`,
              }}
            >
              <span className="text-7xl font-semibold text-white/85">
                {card.displayName[0]?.toUpperCase()}
              </span>
            </div>
          )}
          {/* Edge fade into the right column on desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-transparent to-card/65 sm:block"
          />
        </div>

        {/* Content */}
        <div className="relative flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--vivida-pink)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--vivida-pink)]">
              დღევანდელი მთავარი წყვილი
            </span>
          </div>

          <div>
            <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {card.displayName}
              </span>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span style={{ color: accent }}>{card.sunSign.symbol}</span>
              <span className="text-foreground/80">
                {card.sunSign.labelKa}
              </span>
              <span>·</span>
              <span>{card.sunElement}</span>
              <span>·</span>
              <Link
                href={`/u/${card.username}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                @{card.username}
              </Link>
            </div>
          </div>

          {/* Big % + verdict */}
          <div className="flex items-baseline gap-3">
            <div className="text-5xl font-semibold tabular-nums leading-none tracking-tight sm:text-6xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {synastry.overall}%
              </span>
            </div>
            <div className="text-sm font-medium text-foreground/85 sm:text-base">
              {verdict}
            </div>
          </div>

          {/* Top 2 categories with mini bars */}
          <div className="space-y-2.5">
            {topCategories.map((cat) => {
              const score = synastry.scores[cat];
              const color = CATEGORY_COLOR[cat];
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-foreground/85">
                      <span className="text-sm leading-none">
                        {CATEGORY_EMOJI[cat]}
                      </span>
                      {CATEGORY_LABEL_KA[cat]}
                    </span>
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color }}
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-card/60">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}/0.6)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{
                        delay: 0.3,
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Button asChild variant="mystic" size="lg">
              <Link href={`/u/${card.username}`}>
                ნახე პროფილი
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">
              ცა იცვლება — შემოიხედე ხვალაც
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
