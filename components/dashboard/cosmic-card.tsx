"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";

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
      className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/45 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/65 to-[var(--vivida-pink)]/10 p-5 ring-1 ring-foreground/10 backdrop-blur-xl sm:p-6"
    >
      <div
        aria-hidden
        className="absolute -right-16 -top-16 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.24_305/0.35)_0%,transparent_70%)] opacity-60 blur-3xl"
      />

      <header className="relative mb-4 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            დღევანდელი ცის ბანქო
          </div>
          <h3 className="mt-1 text-balance text-base font-semibold tracking-tight sm:text-lg">
            შენი დღე ცის რუკის მიხედვით
          </h3>
        </div>
        {streak > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--vivida-pink)]"
            title={`${streak} დღე ზედიზედ ხედავ ცას`}
          >
            <Flame className="size-3" />
            {streak} {streak === 1 ? "დღე" : "დღე"}
          </span>
        )}
      </header>

      <div className="relative mx-auto" style={{ perspective: "1200px" }}>
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
            "relative mx-auto block aspect-[3/4] w-full max-w-[280px] cursor-default rounded-2xl",
            !revealed && "cursor-pointer"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Back face */}
          <span
            className="absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-2 border-[var(--vivida-violet)]/55 bg-[radial-gradient(circle_at_50%_30%,oklch(0.30_0.16_305/0.6),oklch(0.15_0.06_290/0.95))] shadow-[0_18px_50px_-12px_oklch(0.65_0.24_305/0.55)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span
              aria-hidden
              className="absolute inset-3 rounded-xl border border-[var(--vivida-violet)]/35"
            />
            <span aria-hidden className="absolute inset-0 opacity-60">
              <Stars />
            </span>
            <span className="relative z-10 flex flex-col items-center gap-3">
              <Sparkles
                className="size-9 text-[var(--vivida-cyan)]"
                aria-hidden
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-foreground/70">
                შეეხე
              </span>
            </span>
          </span>

          {/* Front face */}
          <span
            className="absolute inset-0 flex flex-col items-stretch justify-between gap-3 rounded-2xl border-2 px-5 py-5 text-left shadow-[0_18px_50px_-12px_oklch(0.65_0.24_305/0.55)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderColor: `color-mix(in oklch, ${accent} 55%, transparent)`,
              background: `linear-gradient(160deg, color-mix(in oklch, ${accent} 18%, oklch(0.18 0.06 290)) 0%, oklch(0.16 0.05 290 / 0.95) 100%)`,
            }}
          >
            <div className="space-y-1">
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                {card.caption}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-4xl" aria-hidden>
                {card.emoji}
              </span>
              <p className="text-pretty text-sm font-medium leading-snug text-foreground/95">
                {card.body}
              </p>
            </div>

            {card.advice ? (
              <div
                className="rounded-xl border bg-background/30 px-3 py-2 text-[12px] leading-relaxed text-foreground/85"
                style={{
                  borderColor: `color-mix(in oklch, ${accent} 35%, transparent)`,
                }}
              >
                <span style={{ color: accent }} className="mr-1 font-semibold">
                  →
                </span>
                {card.advice}
              </div>
            ) : (
              <div className="text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                ხვალ ახალი ცა გელის
              </div>
            )}
          </span>
        </motion.button>
      </div>

      <p className="relative mt-4 text-center text-[11px] text-muted-foreground/85">
        {revealed
          ? card.source === "ai"
            ? "AI რჩევა შენი ცის რუკიდან — ხვალ ახალს ნახავ."
            : "შენი დღევანდელი ცა — ხვალ ახალი."
          : "ერთი შეხება, შენი დღევანდელი ცა."}
      </p>
    </article>
  );
}

/** Decorative dots for the card back. Pure CSS, no JS. */
function Stars() {
  const dots = [
    { x: 18, y: 22, s: 1 },
    { x: 78, y: 18, s: 1.6 },
    { x: 32, y: 64, s: 0.8 },
    { x: 60, y: 78, s: 1.2 },
    { x: 88, y: 56, s: 0.9 },
    { x: 12, y: 86, s: 1.1 },
  ];
  return (
    <span aria-hidden className="absolute inset-0">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[var(--vivida-cyan)]"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.s * 2}px`,
            height: `${d.s * 2}px`,
            boxShadow: `0 0 ${d.s * 4}px oklch(0.78 0.18 200 / 0.7)`,
          }}
        />
      ))}
    </span>
  );
}
