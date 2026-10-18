"use client";

import { useEffect, useMemo, useState } from "react";

interface Star {
  left: number;
  top: number;
  size: number;
  opacity: number;
  warm: boolean;
}

/**
 * Quiet astronomical star chart dust layer.
 * Replaces neon pulsing violet/cyan orbs and shooting stars with subtle,
 * stationary or near-stationary ivory and brass pinpoints so the canvas
 * feels like an observatory sky atlas without competing with typography.
 */
export function Starfield({
  count = 72,
  shooting = 0,
}: {
  count?: number;
  shooting?: number;
}) {
  void shooting;
  const [mountedCount, setMountedCount] = useState<number | null>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const effective = Math.min(count, 80);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountedCount(mobile ? Math.max(20, Math.round(effective * 0.45)) : effective);
  }, [count]);

  const stars = useMemo(() => {
    if (!mountedCount) return null;
    let s = 0x9e3779b9;
    const rand = () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const list: Star[] = Array.from({ length: mountedCount }).map(() => {
      const r = rand();
      const isFeature = r > 0.92;
      return {
        left: rand() * 100,
        top: rand() * 100,
        size: isFeature ? 1.75 : 1,
        opacity: isFeature ? rand() * 0.25 + 0.35 : rand() * 0.22 + 0.08,
        warm: rand() > 0.65,
      };
    });

    return list;
  }, [mountedCount]);

  if (!stars) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            background: star.warm ? "#D4AF37" : "#F4F0EA",
          }}
        />
      ))}
    </div>
  );
}
