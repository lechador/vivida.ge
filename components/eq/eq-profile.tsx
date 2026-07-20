import { ArrowUpRight, Sprout } from "lucide-react";

import {
  EQ_BAND_META,
  EQ_DOMAIN_INTERP,
  EQ_DOMAIN_TIP,
  type EqResult,
} from "@/lib/eq/scoring";
import { EqRadar } from "@/components/eq/eq-radar";

/**
 * The deep EQ profile — the radar, a strength/growth pair, and a card per
 * domain (score, band, interpretation, a concrete practice). Pure/server-safe
 * so it renders on the saved page and (blurred) on the anonymous teaser.
 */
export function EqProfile({ result }: { result: EqResult }) {
  const top = result.domains.find((d) => d.key === result.topKey)!;
  const low = result.domains.find((d) => d.key === result.lowKey)!;

  return (
    <div className="space-y-5">
      {/* Radar */}
      <div className="rounded-3xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          შენი ემოციური რუკა
        </h2>
        <EqRadar domains={result.domains} />
      </div>

      {/* Strength + growth */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-4 ring-1 ring-foreground/5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--vivida-cyan)]">
            <ArrowUpRight className="size-4" />
            შენი ძალა
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-lg font-semibold">
            <span>{top.glyph}</span>
            {top.nameKa}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">
            {EQ_DOMAIN_INTERP[top.key][top.band]}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/8 p-4 ring-1 ring-foreground/5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--vivida-pink)]">
            <Sprout className="size-4" />
            ზრდის სივრცე
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-lg font-semibold">
            <span>{low.glyph}</span>
            {low.nameKa}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">
            {EQ_DOMAIN_TIP[low.key]}
          </p>
        </div>
      </div>

      {/* Per-domain cards */}
      <div className="space-y-3">
        {result.domains.map((d) => (
          <article
            key={d.key}
            className="rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{d.glyph}</span>
                <div>
                  <h3 className="font-semibold leading-tight">{d.nameKa}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {d.taglineKa}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: d.hue }}
                >
                  {d.score}
                </div>
                <div
                  className="mt-1 rounded-full px-2 py-px text-[10px] font-semibold"
                  style={{
                    color: EQ_BAND_META[d.band].hue,
                    background: `color-mix(in oklch, ${EQ_BAND_META[d.band].hue} 16%, transparent)`,
                  }}
                >
                  {EQ_BAND_META[d.band].labelKa}
                </div>
              </div>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${d.score}%`,
                  background: `linear-gradient(90deg, color-mix(in oklch, ${d.hue} 55%, transparent), ${d.hue})`,
                }}
              />
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {EQ_DOMAIN_INTERP[d.key][d.band]}
            </p>
            <p className="mt-2 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <span aria-hidden>💡</span>
              {EQ_DOMAIN_TIP[d.key]}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
