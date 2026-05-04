import { signByIndex } from "@/lib/zodiac";
import { cn } from "@/lib/utils";
import type { MoonPhaseRow } from "@/actions/moon-phase";

/**
 * Render the universal moon-phase card on the dashboard. Server component.
 * Sized to live in a narrow sidebar column — vertical stack with a
 * compact moon glyph, single-line headline, and a fold-out body.
 */
export function MoonPhaseCard({ data }: { data: MoonPhaseRow }) {
  const { snapshot } = data;
  const sign = signByIndex(snapshot.signIndex);
  const illumPct = Math.round(snapshot.illumination * 100);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5",
        "bg-gradient-to-br from-card/65 via-card/55 to-[oklch(0.30_0.10_265/0.45)]"
      )}
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 size-40 rounded-full bg-[radial-gradient(circle,oklch(0.85_0.06_240/0.35)_0%,transparent_70%)] blur-3xl"
      />

      {/* Hero row — small label + moon glyph aligned right */}
      <div className="relative mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            დღევანდელი მთვარე
          </div>
          <div className="mt-1 text-sm font-medium text-foreground/85">
            {data.phaseLabelKa} ·{" "}
            <span style={{ color: "oklch(0.85 0.10 240)" }}>{sign.symbol}</span>{" "}
            {data.signKa}
          </div>
        </div>
        <MoonGlyph
          phaseAngle={snapshot.phaseAngle}
          className="size-14 shrink-0 sm:size-16"
        />
      </div>

      <h3 className="relative text-pretty text-base font-semibold leading-snug tracking-tight sm:text-lg">
        {data.headline}
      </h3>

      <div className="relative mt-2 flex flex-wrap gap-1 text-[11px] text-foreground/70">
        <Pill>{illumPct}% განათებული</Pill>
        <Pill>{snapshot.ageDays.toFixed(1)} დღე</Pill>
      </div>

      <p className="relative mt-3 text-pretty text-sm leading-relaxed text-foreground/85">
        {data.summary}
      </p>

      {data.themes && data.themes.length > 0 && (
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {data.themes.map((theme, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full border border-[var(--vivida-violet)]/25 bg-[var(--vivida-violet)]/10 px-2 py-0.5 text-[11px] text-foreground/85"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      <details className="group relative mt-3 -mx-1 rounded-xl px-1 transition-colors open:bg-foreground/[0.02]">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <span>გააგრძელე კითხვა</span>
          <span aria-hidden className="transition-transform group-open:rotate-90">›</span>
        </summary>
        <div className="mt-3 space-y-2.5 text-pretty text-sm leading-relaxed text-foreground/85">
          {data.body
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      </details>
    </article>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/70 bg-background/40 px-2 py-0.5">
      {children}
    </span>
  );
}

/**
 * SVG moon visualization. The lit hemisphere is a circle, the shadow is
 * a path composed of half the moon's outer arc + a terminator ellipse arc
 * with x-radius = r·|cos(θ)|. Northern hemisphere convention (waxing = lit
 * on right, waning = lit on left).
 */
function MoonGlyph({
  phaseAngle,
  className,
}: {
  phaseAngle: number;
  className?: string;
}) {
  const r = 50;
  const phase = phaseAngle / 360; // 0..1
  const xRadius = Math.abs(Math.cos((phaseAngle * Math.PI) / 180)) * r;
  const shadowPath = buildShadowPath(phase, r, xRadius);

  return (
    <svg
      viewBox="-60 -60 120 120"
      className={cn("drop-shadow-[0_0_24px_rgba(180,180,255,0.25)]", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id="moon-light" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="oklch(0.97 0.04 90)" />
          <stop offset="60%" stopColor="oklch(0.86 0.04 90)" />
          <stop offset="100%" stopColor="oklch(0.72 0.06 250)" />
        </radialGradient>
        <radialGradient id="moon-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.18 0.04 270)" />
          <stop offset="100%" stopColor="oklch(0.10 0.03 270)" />
        </radialGradient>
        <filter id="moon-craters" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <circle cx="0" cy="0" r={r} fill="url(#moon-light)" />
      <circle cx="0" cy="0" r={r} filter="url(#moon-craters)" />
      {shadowPath && (
        <path d={shadowPath} fill="url(#moon-shadow)" opacity="0.95" />
      )}
      <circle
        cx="0"
        cy="0"
        r={r}
        fill="none"
        stroke="oklch(1 0 0 / 0.08)"
        strokeWidth="1"
      />
    </svg>
  );
}

function buildShadowPath(phase: number, r: number, xRadius: number): string | null {
  if (phase >= 0.49 && phase <= 0.51) return null;
  if (phase < 0.005 || phase > 0.995) {
    return `M ${-r},0 A ${r},${r} 0 1,0 ${r},0 A ${r},${r} 0 1,0 ${-r},0 Z`;
  }
  if (phase < 0.25) {
    return `M 0,${-r} A ${r},${r} 0 0,0 0,${r} A ${xRadius},${r} 0 0,1 0,${-r} Z`;
  }
  if (phase < 0.5) {
    return `M 0,${-r} A ${r},${r} 0 0,0 0,${r} A ${xRadius},${r} 0 0,0 0,${-r} Z`;
  }
  if (phase < 0.75) {
    return `M 0,${-r} A ${r},${r} 0 0,1 0,${r} A ${xRadius},${r} 0 0,1 0,${-r} Z`;
  }
  return `M 0,${-r} A ${r},${r} 0 0,1 0,${r} A ${xRadius},${r} 0 0,0 0,${-r} Z`;
}
