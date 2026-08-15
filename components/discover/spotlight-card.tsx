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
import { CATEGORY_LABEL_EN, overallVerdictEn } from "@/lib/synastry-en";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import type { SpotlightMatch } from "@/lib/discover";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { VerifiedBadge } from "@/components/profile/verified-badge";

const ELEMENT_HEX: Record<string, string> = {
  ცეცხლი: "oklch(0.7 0.22 30)",
  მიწა: "oklch(0.65 0.13 130)",
  ჰაერი: "oklch(0.75 0.16 220)",
  წყალი: "oklch(0.6 0.2 280)",
};

const ELEMENT_EN: Record<string, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};

const CATEGORY_COLOR: Record<string, string> = {
  love: "oklch(0.72 0.22 350)",
  friendship: "oklch(0.85 0.16 85)",
  communication: "oklch(0.75 0.16 220)",
  growth: "oklch(0.65 0.13 130)",
  chemistry: "oklch(0.7 0.22 30)",
};

export function SpotlightCard({
  match,
  locale = "ka",
}: {
  match: SpotlightMatch;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const { card, synastry } = match;
  const verdict = en
    ? overallVerdictEn(synastry.overall)
    : overallVerdict(synastry.overall);
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
      className="relative mb-10 mt-6 overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/40 bg-card/65 ring-1 ring-foreground/10 backdrop-blur-xl"
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

      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        {/* Hero — circular avatar on desktop, banner on mobile */}
        <div className="relative shrink-0 self-start sm:self-center">
          <div
            className="relative size-32 overflow-hidden rounded-full sm:size-36"
            style={{
              boxShadow: `0 0 0 2px color-mix(in oklch, ${accent} 55%, transparent), 0 0 40px -8px ${accent}`,
            }}
          >
            <Image
              src={heroSrc || DEFAULT_AVATAR}
              alt=""
              fill
              sizes="(min-width: 640px) 144px, 128px"
              className="object-cover"
              priority
            />
          </div>
          {/* Sign symbol micro-badge bottom-right */}
          <span
            className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full border border-background bg-card text-base shadow-sm"
            style={{ color: accent }}
            aria-hidden
          >
            {card.sunSign.symbol}
          </span>
        </div>

        {/* Content */}
        <div className="relative flex min-w-0 flex-1 flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-[var(--vivida-pink)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--vivida-pink)]">
              {en ? "Today’s top match" : "დღევანდელი მთავარი წყვილი"}
            </span>
          </div>

          <div>
            <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {card.displayName}
              </span>
              {card.verified && <VerifiedBadge className="ml-1.5 inline-flex align-middle" />}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <span className="text-foreground/85">
                {en ? card.sunSign.labelEn : card.sunSign.labelKa}
              </span>
              <span className="text-muted-foreground/60">·</span>
              <span>
                {en ? ELEMENT_EN[card.sunElement] ?? card.sunElement : card.sunElement}
              </span>
              <span className="text-muted-foreground/60">·</span>
              <Link
                href={`/u/${card.username}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                @{card.username}
              </Link>
            </div>
          </div>

          {/* % + verdict */}
          <div className="flex items-baseline gap-2.5">
            <div className="text-4xl font-semibold tabular-nums leading-none tracking-tight sm:text-5xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {synastry.overall}%
              </span>
            </div>
            <div className="text-sm font-medium text-foreground/85">
              {verdict}
            </div>
          </div>

          {/* Top 2 categories with mini bars */}
          <div className="space-y-2">
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
                      {en ? CATEGORY_LABEL_EN[cat] : CATEGORY_LABEL_KA[cat]}
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

          <div className="mt-1">
            <Button asChild variant="mystic" size="default">
              <Link href={`/u/${card.username}`}>
                {en ? "View profile" : "ნახე პროფილი"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
