import {
  computeElementBalance,
  ELEMENT_ORDER,
  type Element,
} from "@/lib/elements";
import type { NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ELEMENT_VIS: Record<Element, { glyph: string; color: string }> = {
  ცეცხლი: { glyph: "△", color: "oklch(0.78 0.16 55)" },
  მიწა: { glyph: "▽", color: "oklch(0.74 0.15 150)" },
  ჰაერი: { glyph: "△", color: "oklch(0.78 0.16 205)" },
  წყალი: { glyph: "▽", color: "oklch(0.72 0.17 285)" },
};
const ELEMENT_EN: Record<Element, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};

export function ElementsCard({
  chart,
  locale = "ka",
}: {
  chart: NatalChartJson;
  locale?: UserLocale;
}) {
  const balance = computeElementBalance(chart);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-background/80 ring-1 ring-border/70">
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
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {ELEMENT_ORDER.map((el) => (
          <div
            key={el}
            className="flex items-center justify-between rounded-lg border border-border bg-background/65 px-3.5 py-2.5"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden style={{ color: ELEMENT_VIS[el].color }}>
                {ELEMENT_VIS[el].glyph}
              </span>
              <span
                className={
                  el === balance.dominant
                    ? "font-semibold text-foreground"
                    : "text-foreground/85"
                }
              >
                {locale !== "ka" ? ELEMENT_EN[el] : el}
              </span>
            </span>
            <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
              {Math.round(balance.percentages[el])}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
