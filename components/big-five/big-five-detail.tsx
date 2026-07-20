import { Sparkles } from "lucide-react";

import {
  BIG5_LEVEL_LABEL,
  BIG5_TRAIT_INTERP,
  big5HeadlineKa,
  type BigFiveResult,
} from "@/lib/big-five/scoring";

/**
 * The deep tier of the Big Five result — a written interpretation per trait
 * (matched to the level), framed neutrally since every pole is a valid
 * personality. Pure/server-safe so it renders on the saved page and (blurred)
 * on the anonymous teaser.
 */
export function BigFiveDetail({ result }: { result: BigFiveResult }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-4 text-center ring-1 ring-foreground/5">
        <Sparkles className="mx-auto mb-1.5 size-5 text-[var(--vivida-violet)]" />
        <p className="text-base font-semibold">{big5HeadlineKa(result)}</p>
      </div>

      {result.traits.map((t) => (
        <article
          key={t.key}
          className="rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{t.glyph}</span>
              <div>
                <h3 className="font-semibold leading-tight">{t.nameKa}</h3>
                <p className="text-[11px] text-muted-foreground">{t.taglineKa}</p>
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-2xl font-bold tabular-nums leading-none"
                style={{ color: t.hue }}
              >
                {t.score}
              </div>
              <div
                className="mt-1 rounded-full px-2 py-px text-[10px] font-semibold"
                style={{
                  color: t.hue,
                  background: `color-mix(in oklch, ${t.hue} 16%, transparent)`,
                }}
              >
                {BIG5_LEVEL_LABEL[t.level]}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {BIG5_TRAIT_INTERP[t.key][t.level]}
          </p>
        </article>
      ))}
    </div>
  );
}
