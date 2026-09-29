import { Lock } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  ELEMENT_EMOJI,
  ELEMENT_LABEL_KA,
  overallVerdict,
  type SynastryResult,
} from "@/lib/synastry";
import {
  CATEGORY_LABEL_EN,
  ELEMENT_LABEL_EN,
  overallVerdictEn,
} from "@/lib/synastry-en";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Locked-synastry teaser: the overall compatibility number, verdict and
 * elemental pairing are fully visible; the per-category breakdown shows
 * real labels + real bars blurred. Scores are cheap deterministic compute,
 * so nothing paid (AI narrative, weekly updates) runs for locked viewers.
 */
export function SynastryTeaser({
  result,
  locale,
}: {
  result: SynastryResult;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const verdict = en
    ? overallVerdictEn(result.overall)
    : overallVerdict(result.overall);
  const elementLabel = en ? ELEMENT_LABEL_EN : ELEMENT_LABEL_KA;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--vivida-pink)]/30 bg-gradient-to-br from-[var(--vivida-pink)]/12 via-card/60 to-[var(--vivida-violet)]/12 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {en ? "Compatibility score" : "თავსებადობის ქულა"}
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-5xl font-semibold tabular-nums tracking-tight">
            {result.overall}
            <span className="text-xl font-normal text-muted-foreground">%</span>
          </div>
          <p className="mt-1 text-base font-medium text-foreground/90">
            {verdict}
          </p>
        </div>
        <div className="space-y-1 text-sm text-foreground/85">
          <p>
            ☉ {ELEMENT_EMOJI[result.elements.sunA]}{" "}
            {elementLabel[result.elements.sunA]}
            <span className="mx-1.5 text-muted-foreground">↔</span>
            {ELEMENT_EMOJI[result.elements.sunB]}{" "}
            {elementLabel[result.elements.sunB]}
          </p>
          <p>
            ☽ {ELEMENT_EMOJI[result.elements.moonA]}{" "}
            {elementLabel[result.elements.moonA]}
            <span className="mx-1.5 text-muted-foreground">↔</span>
            {ELEMENT_EMOJI[result.elements.moonB]}{" "}
            {elementLabel[result.elements.moonB]}
          </p>
        </div>
      </div>

      <div aria-hidden className="mt-5 space-y-2.5 select-none blur-[5px]">
        {CATEGORIES.map((cat) => {
          const score = result.scores[cat];
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs text-foreground/85">
                {CATEGORY_EMOJI[cat]}{" "}
                {en ? CATEGORY_LABEL_EN[cat] : CATEGORY_LABEL_KA[cat]}
              </span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink))]"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-foreground/85">
                {score}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Lock className="size-3.5 text-[var(--vivida-gold)]" />
        {en
          ? "Key aspects, strengths and friction points unlock below"
          : "მთავარი ასპექტები, ძლიერი მხარეები და ხახუნის წერტილები ქვემოთ გაიხსნება"}
      </p>
    </div>
  );
}
