import { bodyMeta, formatDegree, signByIndex, signColor } from "@/lib/zodiac";
import type { NatalChartJson, PointJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ROW_KEYS = [
  "sun",
  "moon",
  "ascendant",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

const GRID = "grid grid-cols-[1.3fr_1.3fr_auto_2.5rem] items-center gap-x-3";
const GLYPH = "w-6 shrink-0 text-center text-base leading-none";

function pointFor(chart: NatalChartJson, key: string): PointJson | null {
  if (key === "ascendant") return chart.ascendant ?? null;
  return chart.bodies[key] ?? null;
}

export function PositionsTable({
  chart,
  locale = "ka",
}: {
  chart: NatalChartJson;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const planetHeader = en ? "Planet" : "პლანეტა";
  const signHeader = en ? "Sign" : "ნიშანი";
  const degreeHeader = en ? "Degree" : "გრადუსი";
  const houseHeader = en ? "House" : "სახლი";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div
        className={`${GRID} border-b border-border bg-background/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:px-5`}
      >
        <span>{planetHeader}</span>
        <span>{signHeader}</span>
        <span className="text-right">{degreeHeader}</span>
        <span className="text-right">{houseHeader}</span>
      </div>
      <ul className="divide-y divide-border">
        {ROW_KEYS.map((key) => {
          const point = pointFor(chart, key);
          if (!point) return null;
          const meta = bodyMeta(key);
          const sign = signByIndex(point.signIndex);
          const color = signColor(sign);
          const house = key === "ascendant" ? 1 : point.house;
          const planetLabel = en
            ? (meta?.labelEn ?? key)
            : (meta?.labelKa ?? key);
          const signLabel = en ? sign.labelEn : sign.labelKa;

          return (
            <li key={key}>
              <a
                href={`#planet-${key}`}
                className={`${GRID} px-4 py-2.5 text-sm transition-colors hover:bg-secondary/40 sm:px-5`}
              >
                <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                  <span aria-hidden style={{ color }} className={GLYPH}>
                    {meta?.symbol ?? "?"}
                  </span>
                  <span className="truncate">{planetLabel}</span>
                </span>

                <span className="flex min-w-0 items-center gap-2 text-foreground/85">
                  <span aria-hidden style={{ color }} className={GLYPH}>
                    {`${sign.symbol}︎`}
                  </span>
                  <span className="truncate">{signLabel}</span>
                </span>

                <span className="whitespace-nowrap text-right font-mono text-xs tabular-nums text-foreground/85">
                  {formatDegree(point.signDegree)}
                  {point.retrograde && (
                    <span className="ml-1 text-[11px] text-primary">℞</span>
                  )}
                </span>

                <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {house ?? "—"}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const HOUSE_LABEL: Record<number, string> = {
  1: "AC",
  4: "IC",
  7: "DC",
  10: "MC",
};

export function HousesTable({
  chart,
  locale = "ka",
}: {
  chart: NatalChartJson;
  locale?: UserLocale;
}) {
  const houses = [...chart.houses].sort((a, b) => a.number - b.number);
  return (
    <div className="grid gap-x-8 sm:grid-cols-2">
      {houses.map((h) => {
        const sign = signByIndex(h.signIndex);
        const color = signColor(sign);
        const signLabel = locale === "en" ? sign.labelEn : sign.labelKa;
        return (
          <a
            key={h.number}
            href={`#house-${h.number}`}
            className="flex items-center gap-3 border-b border-border py-2.5 text-sm transition-colors last:border-b-0 hover:text-primary"
          >
            <span className="w-7 shrink-0 font-mono text-xs font-medium tabular-nums text-muted-foreground">
              {HOUSE_LABEL[h.number] ?? h.number}
            </span>
            <span aria-hidden style={{ color }} className={GLYPH}>
              {`${sign.symbol}︎`}
            </span>
            <span className="truncate text-foreground">{signLabel}</span>
          </a>
        );
      })}
    </div>
  );
}
