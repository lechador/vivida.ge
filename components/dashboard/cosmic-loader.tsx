"use client";

import { motion } from "framer-motion";

import { Starfield } from "@/components/landing/starfield";

/**
 * Reusable cosmic loading state. Used both as the Next.js `loading.tsx`
 * for /dashboard (route-level) and as the Suspense fallback inside the
 * page (Daily generation). Animated chart wheel skeleton with a single
 * line of Georgian status text and a heavy starfield.
 *
 * `embedded` mode renders without the page chrome (no full-screen layout)
 * so it can sit inside an existing section.
 */
export function CosmicLoader({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const content = (
    <div className="relative flex flex-col items-center justify-center px-6 py-10 text-center">
      <SpinningChart />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 text-base text-foreground/85 sm:text-lg"
      >
        ვარსკვლავებს ვითვლით…
      </motion.p>
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

