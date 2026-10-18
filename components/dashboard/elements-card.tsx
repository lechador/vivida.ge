import {
  computeElementBalance,
  ELEMENT_ORDER,
  type Element,
} from "@/lib/elements";
import type { NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ELEMENT_VIS: Record<Element, { glyph: string; color: string }> = {
  ცეცხლი: { glyph: "△", color: "oklch(0.76 0.12 75)" },
  მიწა: { glyph: "▽", color: "oklch(0.68 0.08 145)" },
  ჰაერი: { glyph: "△", color: "oklch(0.76 0.06 235)" },
  წყალი: { glyph: "▽", color: "oklch(0.64 0.09 255)" },
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
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex h-2 w-full overflow-hidden rounded-xs bg-secondary">
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
            className="flex items-center justify-between rounded-sm border border-border bg-secondary/30 px-3 py-2"
          >
            <span className="flex items-center gap-1.5">
              <span aria-hidden style={{ color: ELEMENT_VIS[el].color }}>
                {ELEMENT_VIS[el].glyph}
              </span>
              <span
                className={
                  el === balance.dominant
                    ? "font-semibold text-foreground"
                    : "text-foreground/80"
                }
              >
                {locale !== "ka" ? ELEMENT_EN[el] : el}
              </span>
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {Math.round(balance.percentages[el])}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
