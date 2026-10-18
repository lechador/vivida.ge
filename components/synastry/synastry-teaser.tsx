import { Lock } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_LABEL_KA,
  ELEMENT_LABEL_KA,
  overallVerdict,
  type SynastryResult,
} from "@/lib/synastry";
import {
  CATEGORY_LABEL_EN,
  ELEMENT_LABEL_EN,
  overallVerdictEn,
} from "@/lib/synastry-en";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import type { UserLocale } from "@/lib/i18n/user-locale";

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
    <div className="relative mb-6 overflow-hidden rounded-sm border border-border bg-card p-5 sm:p-6">
      <CornerCrosshair position="tl" />
      <CornerCrosshair position="tr" />
      <CornerCrosshair position="bl" />
      <CornerCrosshair position="br" />

      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
        {en ? "SYNASTRY INDEX · PREVIEW" : "თავსებადობის ინდექსი · მიმოხილვა"}
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="font-mono text-5xl font-semibold tabular-nums tracking-tight text-primary">
            {result.overall}
            <span className="text-xl font-normal text-muted-foreground">%</span>
          </div>
          <p className="mt-1 text-base font-medium text-foreground/90">
            {verdict}
          </p>
        </div>
        <div className="space-y-1 font-mono text-xs text-foreground/85">
          <p>
            ☉ {elementLabel[result.elements.sunA]}
            <span className="mx-1.5 text-muted-foreground">↔</span>
            {elementLabel[result.elements.sunB]}
          </p>
          <p>
            ☽ {elementLabel[result.elements.moonA]}
            <span className="mx-1.5 text-muted-foreground">↔</span>
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
                {en ? CATEGORY_LABEL_EN[cat] : CATEGORY_LABEL_KA[cat]}
              </span>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden bg-secondary">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-foreground/85">
                {score}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 border-t border-border pt-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Lock className="size-3.5 text-primary" />
        {en
          ? "Key aspects, strengths and friction points unlock below"
          : "მთავარი ასპექტები, ძლიერი მხარეები და ხახუნის წერტილები ქვემოთ გაიხსნება"}
      </p>
    </div>
  );
}
