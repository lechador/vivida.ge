"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  COSMIC_TILT_COLOR,
  type CosmicCard as CosmicCardData,
} from "@/lib/cosmic-cards";

/**
 * Daily flip card on the dashboard. Defaults face-down; one tap reveals
 * today's reading — built from the user's actual transits + moon sign,
 * with AI advice on top when the cached weekly forecast has it. The
 * reveal state persists in localStorage keyed by the local date so a
 * refresh keeps the card open, and tomorrow's card naturally starts
 * face-down again at midnight.
 */
export function CosmicCard({
  card,
  todayLocal,
  streak,
}: {
  card: CosmicCardData;
  todayLocal: string;
  streak: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const storageKey = `cosmic-card-revealed-${todayLocal}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(storageKey) === "1") setRevealed(true);
  }, [storageKey]);

  function reveal() {
    setRevealed(true);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {}
  }

  const accent = COSMIC_TILT_COLOR[card.tilt];

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/45 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/65 to-[var(--vivida-pink)]/10 p-3.5 ring-1 ring-foreground/10 backdrop-blur-xl sm:p-4"
    >
      <div
        aria-hidden
        className="absolute -right-12 -top-12 size-40 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.24_305/0.35)_0%,transparent_70%)] opacity-60 blur-3xl"
      />

      <header className="relative mb-2.5 flex items-baseline justify-between gap-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          დღევანდელი ცის ბანქო
        </div>
        {streak > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--vivida-pink)]"
            title={`${streak} დღე ზედიზედ ხედავ ცას`}
          >
            <Flame className="size-3" />
            {streak}
          </span>
        )}
      </header>

      <div className="relative mx-auto" style={{ perspective: "900px" }}>
        <motion.button
          type="button"
          onClick={revealed ? undefined : reveal}
          aria-pressed={revealed}
          aria-label={
            revealed ? "ცის ბანქო — გახსნილი" : "გახსენი ცის ბანქო"
          }
          whileHover={!revealed ? { scale: 1.02, y: -2 } : undefined}
          whileTap={!revealed ? { scale: 0.98 } : undefined}
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{
            duration: revealed ? 0.7 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "relative mx-auto block aspect-[5/4] w-full max-w-[420px] cursor-default rounded-2xl",
            !revealed && "cursor-pointer"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Back face — clean dark surface, decoration removed so it can't
              bleed through on browsers where backface-visibility is flaky. */}
          <span
            className="absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-2 border-[var(--vivida-violet)]/55 bg-[radial-gradient(circle_at_50%_30%,oklch(0.30_0.16_305/0.6),oklch(0.15_0.06_290/0.95))] shadow-[0_18px_50px_-12px_oklch(0.65_0.24_305/0.55)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span
              aria-hidden
              className="absolute inset-3 rounded-xl border border-[var(--vivida-violet)]/35"
            />
            <span className="relative z-10 text-xs font-medium uppercase tracking-[0.28em] text-foreground/85">
              შეეხე
            </span>
          </span>

          {/* Front face */}
          <span
            className="absolute inset-0 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left shadow-[0_14px_40px_-12px_oklch(0.65_0.24_305/0.55)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderColor: `color-mix(in oklch, ${accent} 55%, transparent)`,
              background: `linear-gradient(160deg, color-mix(in oklch, ${accent} 18%, oklch(0.18 0.06 290)) 0%, oklch(0.16 0.05 290 / 0.95) 100%)`,
            }}
          >
            <span
              className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl"
              style={{
                background: `color-mix(in oklch, ${accent} 22%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 40%, transparent)`,
              }}
              aria-hidden
            >
              {card.emoji}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div
                className="truncate text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                {card.caption}
              </div>
              <p className="text-pretty text-[13px] font-medium leading-snug text-foreground/95">
                {card.body}
              </p>
              {card.advice && (
                <p className="line-clamp-2 text-[11px] leading-snug text-foreground/75">
                  <span style={{ color: accent }} className="mr-1 font-semibold">
                    →
                  </span>
                  {card.advice}
                </p>
              )}
            </div>
          </span>
        </motion.button>
      </div>

      <p className="relative mt-2.5 text-center text-[10px] text-muted-foreground/80">
        {revealed
          ? card.source === "ai"
            ? "AI რჩევა შენი ცის რუკიდან — ხვალ ახალი."
            : "შენი დღევანდელი ცა — ხვალ ახალი."
          : "ერთი შეხება — დღევანდელი ცა."}
      </p>
    </article>
  );
}

