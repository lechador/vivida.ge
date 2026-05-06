"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Starfield } from "@/components/landing/starfield";

/**
 * Reusable cosmic loading state.
 *
 * Two visual modes:
 *  - Default (terse): single status line — used for route-level fallbacks
 *    where the wait is usually sub-second.
 *  - `progressive=true`: percentage bar + cycling stage messages — used
 *    on the dashboard's first-paint loader because cold bundle loads can
 *    take 10–15s while AI calls warm up. The progress curve is purely
 *    cosmetic (we have no real percentage from the server) and uses an
 *    asymptotic ease so the bar never stalls and never hits 100% before
 *    the bundle actually resolves.
 *
 * `embedded` mode renders without the page chrome (no full-screen layout)
 * so it can sit inside an existing section.
 */
export function CosmicLoader({
  embedded = false,
  progressive = false,
}: {
  embedded?: boolean;
  progressive?: boolean;
}) {
  const content = (
    <div className="relative flex w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <SpinningChart />
      {progressive ? <ProgressiveStatus /> : <SimpleStatus />}
    </div>
  );

  if (embedded) return content;

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(50%_40%_at_30%_40%,oklch(0.40_0.18_305/0.18),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-6">
        {content}
      </div>
    </main>
  );
}

function SimpleStatus() {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 text-base text-foreground/85 sm:text-lg"
    >
      ვარსკვლავებს ვითვლით…
    </motion.p>
  );
}

/**
 * Stages tied to the rough progression of `loadDashboardBundle`:
 *   1. ensureChartFor       (ephemeris + AI interp)
 *   2. ensureDailyFor       (parallel AI generation)
 *   3. ensureWeeklyForecast (parallel AI generation)
 *   4. suggestions + moon
 *
 * `at` is the progress threshold (0..1) — the message swaps when the
 * cosmetic bar crosses it.
 */
const STAGES: Array<{ at: number; label: string }> = [
  { at: 0, label: "ვხსნით შენი დაბადების მომენტს…" },
  { at: 0.18, label: "ვადგენთ პლანეტების პოზიციებს…" },
  { at: 0.38, label: "ვითვლით შენს დიდ სამეულს…" },
  { at: 0.58, label: "AI კითხულობს შენს რუკას…" },
  { at: 0.78, label: "ვამზადებთ დღევანდელ ჰოროსკოპს…" },
  { at: 0.92, label: "შენი რუკა თითქმის მზადაა, ცოტაც დაელოდე…" },
];

function ProgressiveStatus() {
  const [progress, setProgress] = useState(0);

  // Asymptotic ease — progress = 1 - e^(-t / tau). With tau=5s, the bar
  // reaches ~95% at 15s and approaches but never hits 100%, which is the
  // honest signal: we don't actually know when the bundle will resolve.
  // When the parent unmounts us, the bar disappears — we never need to
  // animate to 100% explicitly.
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - start) / 5000;
      const eased = 1 - Math.exp(-t);
      setProgress(Math.min(eased * 99, 99));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pick the highest stage whose threshold the bar has crossed.
  const stage = STAGES.reduce(
    (best, s) => (progress / 100 >= s.at ? s : best),
    STAGES[0]
  );

  return (
    <div className="mt-8 w-full">
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-card/60 ring-1 ring-foreground/5"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))]"
          style={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
        <div
          aria-hidden
          className="vivida-pulse-soft absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-cyan))] opacity-40 blur-sm"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <AnimatePresence mode="wait">
          <motion.span
            key={stage.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-left text-sm text-foreground/85"
          >
            {stage.label}
          </motion.span>
        </AnimatePresence>
        <span className="shrink-0 font-mono tabular-nums text-foreground/60">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

/**
 * SVG zodiac wheel skeleton with a slow rotation + planets drawing in.
 * Pure animation, no real data — just a hint of "shape forming".
 */
function SpinningChart() {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 92;
  const rInner = 64;

  // 6 evenly-spaced "planets" that pop in one at a time
  const planets = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    return {
      x: cx + 78 * Math.cos(angle),
      y: cy + 78 * Math.sin(angle),
    };
  });

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="vivida-spin-slow relative"
      >
        {/* Outer ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill="none"
          stroke="oklch(0.78 0.18 305 / 0.4)"
          strokeWidth={1}
          strokeDasharray="3 5"
        />
        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="none"
          stroke="oklch(0.78 0.18 200 / 0.3)"
          strokeWidth={0.8}
        />
        {/* 12 sector ticks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1={cx + rInner * Math.cos(a)}
              y1={cy + rInner * Math.sin(a)}
              x2={cx + rOuter * Math.cos(a)}
              y2={cy + rOuter * Math.sin(a)}
              stroke="oklch(0.85 0.05 280 / 0.25)"
              strokeWidth={0.6}
            />
          );
        })}
        {/* Planets pop in sequentially */}
        {planets.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={5}
            fill="oklch(0.16 0.04 280)"
            stroke="oklch(0.78 0.18 305)"
            strokeWidth={1.2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.4,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </svg>

      {/* Center sparkle */}
      <div
        className="vivida-pulse-soft pointer-events-none absolute inset-0 grid place-items-center"
      >
        <span
          className="text-3xl"
          style={{
            background:
              "linear-gradient(120deg, var(--vivida-violet), var(--vivida-pink), var(--vivida-cyan))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 12px oklch(0.78 0.18 305 / 0.7))",
          }}
        >
          ✦
        </span>
      </div>

      {/* Outer ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-30 blur-3xl"
      />
    </div>
  );
}
