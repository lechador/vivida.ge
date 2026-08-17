import {
  computeElementBalance,
  ELEMENT_ORDER,
  type Element,
} from "@/lib/elements";
import type { NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ELEMENT_VIS: Record<Element, { glyph: string; color: string }> = {
  ცეცხლი: { glyph: "△", color: "oklch(0.7 0.22 30)" },
  მიწა: { glyph: "▽", color: "oklch(0.65 0.13 130)" },
  ჰაერი: { glyph: "△", color: "oklch(0.75 0.16 220)" },
  წყალი: { glyph: "▽", color: "oklch(0.6 0.2 280)" },
};
const ELEMENT_EN: Record<Element, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};

/**
 * Slim element-balance bar — a single segmented bar (fire/earth/air/water by
 * proportion) plus a one-line legend. Replaces the old full-height panel.
 */
export function ElementsCard({
  chart,
  locale = "ka",
}: {
  chart: NatalChartJson;
  locale?: UserLocale;
}) {
  const balance = computeElementBalance(chart);

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-card/60 ring-1 ring-inset ring-foreground/10">
        {ELEMENT_ORDER.map((el) => {
          const pct = balance.percentages[el];
          if (pct <= 0) return null;
          return (
            <div
              key={el}
              style={{ width: `${pct}%`, background: ELEMENT_VIS[el].color }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {ELEMENT_ORDER.map((el) => (
          <span key={el} className="flex items-center gap-1.5">
            <span aria-hidden style={{ color: ELEMENT_VIS[el].color }}>
              {ELEMENT_VIS[el].glyph}
            </span>
            <span
              className={
                el === balance.dominant ? "font-medium" : "text-foreground/80"
              }
            >
              {locale !== "ka" ? ELEMENT_EN[el] : el}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {Math.round(balance.percentages[el])}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
