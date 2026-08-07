"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { ZodiacWheel } from "./zodiac-wheel";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

/**
 * Hero centerpiece — the spinning zodiac wheel flanked by two floating
 * product-snippet cards that mimic real dashboard UI ("Big Three" and
 * "Today's horoscope"). Cold visitors see what they'll get instead of
 * a decorative animation. Cards hide below `sm` to avoid mobile clutter.
 */
export function HeroPreview() {
  return (
    <div className="relative mx-auto grid w-full place-items-center sm:mb-10">
      {/* Soft glow halo behind the wheel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mx-auto size-[300px] rounded-full bg-[radial-gradient(closest-side,oklch(0.32_0.18_305/0.25),transparent_70%)] sm:size-[420px]"
      />

      {/* Centerpiece zodiac wheel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
      >
        <ZodiacWheel size={180} />
      </motion.div>

      {/* "Big Three" — floats above-left of the wheel */}
      <motion.div
        initial={{ opacity: 0, y: -8, x: -12 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.5, duration: 0.9, ease: EASE_OUT_EXPO }}
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-[180%] -translate-y-2 hidden sm:block"
      >
        <div className="rounded-2xl border border-border/60 bg-card/85 px-4 py-3 text-left shadow-2xl shadow-[var(--vivida-violet)]/20 backdrop-blur-xl">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            შენი სამეული
          </div>
          <div className="mt-1.5 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[var(--vivida-gold)]">☉</span>
              <span className="text-foreground/90">მზე ლომში</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--vivida-cyan)]">☾</span>
              <span className="text-foreground/90">მთვარე თევზებში</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--vivida-pink)]">↑</span>
              <span className="text-foreground/90">ასცენდენტი ქალწულში</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* "Today's horoscope" — floats below-right of the wheel */}
      <motion.div
        initial={{ opacity: 0, y: 8, x: 12 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.7, duration: 0.9, ease: EASE_OUT_EXPO }}
        className="pointer-events-none absolute left-1/2 bottom-0 max-w-[230px] translate-x-[40%] translate-y-2 hidden sm:block"
      >
        <div className="rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 to-card/80 px-4 py-3 text-left shadow-2xl shadow-[var(--vivida-violet)]/30 backdrop-blur-xl">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="size-3 text-[var(--vivida-cyan)]" />
            დღევანდელი დღე
          </div>
          <div className="mt-1.5 text-sm font-medium leading-snug text-foreground/95">
            მთვარე შენს მე-7 სახლში გადადის — საუკეთესო დღე ახლო ადამიანებთან
            გულწრფელი საუბრისთვის.
          </div>
        </div>
      </motion.div>

      {/* Mobile-only condensed snippet shown directly below the wheel */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: EASE_OUT_EXPO }}
        className="mt-4 rounded-2xl border border-[var(--vivida-violet)]/40 bg-card/70 px-4 py-2.5 text-center backdrop-blur-xl sm:hidden"
      >
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ნახე შენი
        </div>
        <div className="mt-0.5 text-sm font-medium text-foreground">
          ☉ მზე · ☾ მთვარე · ↑ ასცენდენტი + ყოველდღიური ჰოროსკოპი
        </div>
      </motion.div>
    </div>
  );
}
