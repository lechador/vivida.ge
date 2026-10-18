"use client";

import { signByIndex } from "@/lib/zodiac";
import { LunarPhaseDisc } from "@/components/brand/celestial-icons";
import type { MoonPhaseRow } from "@/actions/moon-phase";
import { PHASE_LABEL_EN } from "@/lib/moon-phase";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Editorial Celestial Lunar Telemetry Card.
 * Presents live lunar phase, illumination percentage, and lunar age in
 * tabular numerals alongside the bespoke LunarPhaseDisc SVG.
 */
export function MoonPhaseCard({
  data,
  onRead,
  locale = "ka",
}: {
  data: MoonPhaseRow;
  onRead?: () => void;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const { snapshot } = data;
  const sign = signByIndex(snapshot.signIndex);
  const illumPct = Math.round(snapshot.illumination * 100);

  return (
    <article className="rounded-md border border-border bg-card p-5 sm:p-6">
      {/* Top Telemetry Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-4">
        <div className="min-w-0">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            {en ? "Lunar Telemetry" : "დღევანდელი მთვარე"}
          </div>
          <div className="mt-1.5 text-sm font-medium text-foreground">
            {en ? PHASE_LABEL_EN[data.snapshot.phaseKey] : data.phaseLabelKa}{" "}
            <span className="text-muted-foreground">·</span>{" "}
            <span className="font-mono text-primary">{sign.symbol}</span>{" "}
            <span>{en ? sign.labelEn : data.signKa}</span>
          </div>
          {/* Unboxed tabular lunar metrics */}
          <div className="mt-1.5 font-mono text-xs tabular-nums text-muted-foreground">
            <span>
              {en ? `${illumPct}% illuminated` : `${illumPct}% განათება`}
            </span>{" "}
            ·{" "}
            <span>
              {snapshot.ageDays.toFixed(1)} {en ? "days" : "დღე"}
            </span>
          </div>
        </div>
        <LunarPhaseDisc
          phaseAngle={snapshot.phaseAngle}
          size={56}
          className="shrink-0"
        />
      </div>

      <h3 className="mt-4 text-pretty text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
        {data.headline}
      </h3>

      <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted-foreground">
        {data.summary}
      </p>

      {/* Unboxed inline themes separated by middle dots */}
      {data.themes && data.themes.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-primary">
          {data.themes.map((theme, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden className="text-muted-foreground">
                  ·
                </span>
              )}
              <span>{theme}</span>
            </span>
          ))}
        </div>
      )}

      <details
        className="group mt-4 border-t border-border/70 pt-3"
        onToggle={(event) => {
          if (event.currentTarget.open) onRead?.();
        }}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span>{en ? "Continue reading" : "გააგრძელე კითხვა"}</span>
          <span
            aria-hidden
            className="font-mono transition-transform group-open:rotate-90"
          >
            ›
          </span>
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
