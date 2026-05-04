"use client";

import { useMemo } from "react";

interface Star {
  left: number;
  top: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
  glow: boolean;
  hue: number;
}

interface ShootingStar {
  top: number;     // %
  left: number;    // %
  delay: number;   // s
  duration: number; // s
}

/**
 * Layered starfield. Many tiny pinpoints + a sprinkling of larger glowing
 * "feature" stars + occasional shooting stars sweeping across.
 * Deterministic via a seeded PRNG so SSR markup matches client.
 */
export function Starfield({
  count = 120,
  shooting = 3,
}: {
  count?: number;
  shooting?: number;
}) {
  const { stars, shootingStars } = useMemo(() => {
    let s = 0x9e3779b9;
    const rand = () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const stars: Star[] = Array.from({ length: count }).map((_, i) => {
      const r = rand();
      const isFeature = r > 0.94; // ~6% glowy feature stars
      return {
        left: rand() * 100,
        top: rand() * 100,
        size: isFeature ? rand() * 1.6 + 1.8 : rand() * 1.4 + 0.4,
        opacity: isFeature
          ? rand() * 0.3 + 0.65
          : rand() * 0.55 + 0.2,
        delay: rand() * 8,
        duration: rand() * 4 + 3,
        glow: isFeature,
        // Vary hue subtly between violet, cyan, white (280-220deg range)
        hue: rand() < 0.6 ? 280 : rand() < 0.85 ? 220 : 0,
      };
    });

    const shootingStars: ShootingStar[] = Array.from({ length: shooting }).map(
      (_, i) => ({
        top: rand() * 60 + 5,
        left: rand() * 50 + 5,
        delay: i * 7 + rand() * 5,
        duration: rand() * 1.5 + 2,
      })
    );

    return { stars, shootingStars };
  }, [count, shooting]);

  return (
    <div
      aria-hidden
      className="vivida-stars pointer-events-none absolute inset-0 overflow-hidden"
    >
      {stars.map((star, i) => {
        // Only the brightest stars (feature + larger pinpoints) get the
        // pulse animation — the field reads as alive without paying for
        // 200+ simultaneously animating elements.
        const animate = star.glow || star.size > 1.4;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              background:
                star.hue === 0
                  ? "white"
                  : star.hue === 280
                    ? "oklch(0.92 0.05 280)"
                    : "oklch(0.92 0.06 220)",
              boxShadow: star.glow
                ? `0 0 ${star.size * 4}px ${star.hue === 0
                    ? "oklch(0.95 0.02 280 / 0.7)"
                    : `oklch(0.85 0.12 ${star.hue} / 0.7)`}, 0 0 ${star.size * 8}px ${star.hue === 0
                    ? "oklch(0.95 0.02 280 / 0.3)"
                    : `oklch(0.85 0.12 ${star.hue} / 0.3)`}`
                : star.size > 1.4
                  ? `0 0 ${star.size * 2}px oklch(0.85 0.05 280 / 0.4)`
                  : undefined,
              animation: animate
                ? `vivida-pulse ${star.duration}s ease-in-out ${star.delay}s infinite`
                : undefined,
            }}
          />
        );
      })}
      {shootingStars.map((s, i) => (
        <span
          key={`shoot-${i}`}
          className="absolute h-px w-24 origin-left"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            background:
              "linear-gradient(90deg, transparent, oklch(0.95 0.05 280 / 0.85), transparent)",
            animation: `vivida-shoot ${s.duration}s ease-out ${s.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
