"use client";

import { useEffect, useMemo, useState } from "react";

import type { SkyData } from "@/lib/sky";
import { BODIES, signByIndex } from "@/lib/zodiac";
import { HOUSES, houseLocativeKa } from "@/lib/houses";
import type { UserLocale } from "@/lib/i18n/user-locale";

const SIZE = 520;
const CX = SIZE / 2;
const CY = SIZE / 2;

const R_OUTER = 252;
const R_ZODIAC_IN = 216;
const R_HOUSE_IN = 168;
const R_TRANSIT = 192; // transiting planets ride between the two bands
const R_NATAL = 148; // natal dots just inside the house band

const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const ELEMENT_FILL: Record<string, string> = {
  ცეცხლი: "oklch(0.55 0.2 25 / 0.08)",
  მიწა: "oklch(0.5 0.12 130 / 0.07)",
  ჰაერი: "oklch(0.55 0.16 220 / 0.08)",
  წყალი: "oklch(0.5 0.18 280 / 0.10)",
};

/** Accent per planet — Moon leads, so it gets the brightest treatment. */
const PLANET_ACCENT: Record<string, string> = {
  sun: "oklch(0.85 0.16 85)",
  moon: "oklch(0.92 0.05 280)",
  mercury: "oklch(0.78 0.14 220)",
  venus: "oklch(0.78 0.18 350)",
  mars: "oklch(0.7 0.22 25)",
  jupiter: "oklch(0.78 0.16 60)",
  saturn: "oklch(0.72 0.1 90)",
  uranus: "oklch(0.78 0.16 200)",
  neptune: "oklch(0.72 0.18 260)",
  pluto: "oklch(0.68 0.14 320)",
};

/** Ecliptic longitude → clock angle with the Ascendant on the left (same
 *  orientation as the natal chart wheel, so the sky "sits" on your chart). */
function clockAngle(longitude: number, ascLng: number): number {
  const a = (270 - (longitude - ascLng)) % 360;
  return a < 0 ? a + 360 : a;
}

function polar(r: number, ang: number) {
  const rad = (ang * Math.PI) / 180;
  return {
    x: Math.round((CX + r * Math.sin(rad)) * 100) / 100,
    y: Math.round((CY - r * Math.cos(rad)) * 100) / 100,
  };
}

function sectorPath(r1: number, r2: number, a1: number, a2: number): string {
  let sweep = a1 - a2;
  if (sweep < 0) sweep += 360;
  const large = sweep > 180 ? 1 : 0;
  const p1 = polar(r1, a1);
  const p2 = polar(r1, a2);
  const p3 = polar(r2, a2);
  const p4 = polar(r2, a1);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${r1} ${r1} 0 ${large} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${r2} ${r2} 0 ${large} 1 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

/** Extrapolated longitude at time t (ms) from the server sample. */
function lngAt(base: number, speedDegPerHour: number, sampledAt: number, t: number) {
  const lng = base + (speedDegPerHour * (t - sampledAt)) / 3600_000;
  return ((lng % 360) + 360) % 360;
}

function formatDegrees(lng: number, withSeconds: boolean): string {
  const inSign = lng % 30;
  const deg = Math.floor(inSign);
  const minFloat = (inSign - deg) * 60;
  const min = Math.floor(minFloat);
  if (!withSeconds) return `${deg}°${String(min).padStart(2, "0")}′`;
  const sec = Math.floor((minFloat - min) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′${String(sec).padStart(2, "0")}″`;
}

export function LiveSky({
  data,
  locale = "ka",
}: {
  data: SkyData;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  // One shared 1s clock drives every readout + the wheel positions. The
  // planets move sub-pixel per tick (CSS transition smooths it), but the
  // Moon's arcsecond readout visibly counts up — that's the "it's alive"
  // moment this page exists for.
  // Seeded from the server sample, not Date.now(): this initializer runs on
  // the server too, and any clock difference would change the rendered
  // arcseconds and transforms and break hydration. The clock starts on mount.
  const [now, setNow] = useState(data.sampledAt);
  useEffect(() => {
    // The first tick is left to the interval rather than written synchronously
    // here: the seeded server sample is at most a second stale, and a sync
    // setState in an effect body cascades an extra render on every mount.
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const zodiacSectors = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a1 = clockAngle(i * 30, data.ascLng);
        const a2 = clockAngle((i + 1) * 30, data.ascLng);
        const mid = clockAngle(i * 30 + 15, data.ascLng);
        return { i, path: sectorPath(R_OUTER, R_ZODIAC_IN, a1, a2), mid };
      }),
    [data.ascLng]
  );

  const houseSectors = useMemo(() => {
    const sorted = [...data.houses].sort((a, b) => a.number - b.number);
    return sorted.map((h, idx) => {
      const next = sorted[(idx + 1) % 12];
      const a1 = clockAngle(h.cuspLongitude, data.ascLng);
      const a2 = clockAngle(next.cuspLongitude, data.ascLng);
      // Midpoint on the wrap-aware arc for the house number label
      let span = next.cuspLongitude - h.cuspLongitude;
      if (span <= 0) span += 360;
      const mid = clockAngle(h.cuspLongitude + span / 2, data.ascLng);
      return { n: h.number, a1, a2, mid };
    });
  }, [data.houses, data.ascLng]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      {/* ── The wheel ─────────────────────────────────────────────── */}
      <div className="relative mx-auto w-full max-w-[560px] lg:sticky lg:top-20">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-auto w-full drop-shadow-[0_0_60px_oklch(0.4_0.18_300/0.35)]"
          role="img"
          aria-label={en ? "Live sky chart—current planetary positions in your natal houses" : "ცოცხალი ცის რუკა — პლანეტების ამჟამინდელი პოზიციები შენს ნატალურ სახლებში"}
        >
          <defs>
            <radialGradient id="sky-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.35 0.16 300 / 0.5)" />
              <stop offset="70%" stopColor="oklch(0.25 0.1 290 / 0.15)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <circle cx={CX} cy={CY} r={R_HOUSE_IN} fill="url(#sky-center)" />

          {/* Zodiac band */}
          {zodiacSectors.map(({ i, path, mid }) => {
            const sign = signByIndex(i);
            const glyphPos = polar((R_OUTER + R_ZODIAC_IN) / 2, mid);
            return (
              <g key={i}>
                <path
                  d={path}
                  fill={ELEMENT_FILL[sign.element] ?? "transparent"}
                  stroke="oklch(0.98 0.01 300 / 0.12)"
                  strokeWidth="1"
                />
                <text
                  x={glyphPos.x}
                  y={glyphPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="17"
                  fill="oklch(0.85 0.04 300 / 0.85)"
                >
                  {SIGN_GLYPHS[i]}
                </text>
              </g>
            );
          })}

          {/* House band — the user's OWN houses; this is what makes the
              live sky personal rather than a generic ephemeris. */}
          {houseSectors.map(({ n, a1, mid }) => {
            const cusp1 = polar(R_ZODIAC_IN, a1);
            const cusp2 = polar(R_HOUSE_IN, a1);
            const numPos = polar((R_ZODIAC_IN + R_HOUSE_IN) / 2, mid);
            return (
              <g key={n}>
                <line
                  x1={cusp1.x}
                  y1={cusp1.y}
                  x2={cusp2.x}
                  y2={cusp2.y}
                  stroke="oklch(0.98 0.01 300 / 0.18)"
                  strokeWidth={n === 1 || n === 10 ? 1.6 : 0.8}
                />
                <text
                  x={numPos.x}
                  y={numPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fill="oklch(0.75 0.03 300 / 0.6)"
                >
                  {n}
                </text>
              </g>
            );
          })}
          <circle
            cx={CX}
            cy={CY}
            r={R_HOUSE_IN}
            fill="none"
            stroke="oklch(0.98 0.01 300 / 0.15)"
          />

          {/* Natal planets — small fixed embers of "you" */}
          {data.natal.map((p) => {
            const pos = polar(R_NATAL, clockAngle(p.longitude, data.ascLng));
            return (
              <circle
                key={`natal-${p.key}`}
                cx={pos.x}
                cy={pos.y}
                r="3"
                fill="oklch(0.8 0.1 300 / 0.45)"
              />
            );
          })}

          {/* Transiting planets — the living layer */}
          {data.planets.map((p) => {
            const lng = lngAt(p.longitude, p.speedDegPerHour, data.sampledAt, now);
            const ang = clockAngle(lng, data.ascLng);
            const pos = polar(R_TRANSIT, ang);
            const accent = PLANET_ACCENT[p.key] ?? "oklch(0.85 0.05 300)";
            const isMoon = p.key === "moon";
            return (
              <g
                key={p.key}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  transition: "transform 1s linear",
                }}
              >
                {isMoon && (
                  <circle r="17" fill="none" stroke={accent} strokeOpacity="0.5">
                    <animate
                      attributeName="r"
                      values="15;21;15"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-opacity"
                      values="0.5;0.1;0.5"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  r={isMoon ? 13 : 11}
                  fill="oklch(0.2 0.06 290 / 0.9)"
                  stroke={accent}
                  strokeWidth="1.3"
                  style={{ filter: `drop-shadow(0 0 ${isMoon ? 10 : 6}px ${accent})` }}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isMoon ? 13 : 11}
                  fill={accent}
                >
                  {BODIES[p.key]?.symbol ?? "•"}
                </text>
                {p.retrograde && (
                  <text
                    x="10"
                    y="-9"
                    fontSize="8"
                    fill="oklch(0.72 0.22 350)"
                  >
                    ℞
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* LIVE badge */}
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--vivida-cyan)] backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--vivida-cyan)] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--vivida-cyan)]" />
            </span>
            Live
          </span>
        </div>
      </div>

      {/* ── Planet cards ──────────────────────────────────────────── */}
      <div className="space-y-3">
        {data.planets.map((p) => {
          const lng = lngAt(p.longitude, p.speedDegPerHour, data.sampledAt, now);
          const sign = signByIndex(Math.floor(lng / 30));
          const meta = BODIES[p.key];
          const accent = PLANET_ACCENT[p.key] ?? "oklch(0.85 0.05 300)";
          const isMoon = p.key === "moon";
          const degPerDay = Math.abs(p.speedDegPerHour * 24);
          const text = en
            ? p.house
              ? `${meta?.labelEn ?? p.key} highlights ${HOUSES[p.house]?.themeEn.toLowerCase()}. ${HOUSES[p.house]?.meaningEn}`
              : `${meta?.labelEn ?? p.key} reflects ${meta?.meaningEn ?? "a current planetary theme"}.`
            : p.houseText ?? p.signText;
          return (
            <details
              key={p.key}
              open={isMoon}
              className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full border text-lg"
                  style={{
                    color: accent,
                    borderColor: `color-mix(in oklch, ${accent} 45%, transparent)`,
                    backgroundColor: `color-mix(in oklch, ${accent} 12%, transparent)`,
                  }}
                >
                  {meta?.symbol}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{en ? meta?.labelEn ?? p.key : meta?.labelKa ?? p.key}</span>
                    <span className="text-sm text-muted-foreground">
                      {en ? sign.labelEn : sign.labelKa}{" "}
                      <span className="tabular-nums">{formatDegrees(lng, isMoon)}</span>
                    </span>
                    {p.retrograde && (
                      <span className="rounded-full border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/10 px-1.5 text-[10px] font-medium text-[var(--vivida-pink)]">
                        ℞ {en ? "retrograde" : "რეტროგრადული"}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {p.house
                      ? en
                        ? `Now in your ${HOUSES[p.house]?.labelEn} · ${HOUSES[p.house]?.themeEn ?? ""}`
                        : `ახლა შენს ${houseLocativeKa(p.house)}ა · ${HOUSES[p.house]?.themeKa ?? ""}`
                      : en
                        ? "No house placement (birth time unknown)"
                        : "სახლის გარეშე (დაბადების დრო უცნობია)"}
                    {" · "}
                    {degPerDay >= 0.1
                      ? `${degPerDay.toFixed(1)}°/${en ? "day" : "დღეში"}`
                      : `${(degPerDay * 60).toFixed(1)}′/${en ? "day" : "დღეში"}`}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45"
                >
                  ✦
                </span>
              </summary>
              {text && (
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                  {text}
                </p>
              )}
              {!en && p.houseText && p.signText && (
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  {p.signText}
                </p>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}
