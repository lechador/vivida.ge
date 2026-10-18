"use client";

import { useEffect, useMemo, useState } from "react";

interface Star {
  left: number;
  top: number;
  size: number;
  opacity: number;
  color: string;
}

const STAR_COLORS = ["#f8f7ff", "#c4b5fd", "#67e8f9", "#fde68a"] as const;

/**
 * Quiet astronomical star chart dust layer.
 * Uses subtle cosmic moonlight, lavender, cyan, and gold pinpoints so the
 * canvas feels like a living night sky without competing with typography.
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
    setMountedCount(
      mobile ? Math.max(20, Math.round(effective * 0.45)) : effective,
    );
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
      const isFeature = r > 0.9;
      const colorRoll = rand();
      const color =
        colorRoll > 0.82
          ? STAR_COLORS[1]
          : colorRoll > 0.68
            ? STAR_COLORS[2]
            : colorRoll > 0.56
              ? STAR_COLORS[3]
              : STAR_COLORS[0];
      return {
        left: rand() * 100,
        top: rand() * 100,
        size: isFeature ? 2 : 1.15,
        opacity: isFeature ? rand() * 0.3 + 0.45 : rand() * 0.25 + 0.12,
        color,
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
            background: star.color,
          }}
        />
      ))}
    </div>
  );
}
