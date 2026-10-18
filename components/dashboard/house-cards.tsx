import { HOUSE_NUMBERS, houseDef } from "@/lib/houses";
import { bodyMeta, signByIndex, signColor } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const HOUSE_LABEL: Record<number, string> = {
  1: "AC",
  4: "IC",
  7: "DC",
  10: "MC",
};

export function HouseCards({
  chart,
  interpretations,
  locale = "ka",
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const occupants: Record<
    number,
    Array<{ key: string; label: string; symbol: string }>
  > = {};
  for (const [key, body] of Object.entries(chart.bodies)) {
    if (!body.house) continue;
    const meta = bodyMeta(key);
    (occupants[body.house] ??= []).push({
      key,
      label: en ? (meta?.labelEn ?? key) : (meta?.labelKa ?? key),
      symbol: meta?.symbol ?? "?",
    });
  }

  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {HOUSE_NUMBERS.map((n) => {
        const def = houseDef(n);
        const cusp = chart.houses.find((h) => h.number === n);
        const cuspSign = cusp ? signByIndex(cusp.signIndex) : null;
        const color = cuspSign ? signColor(cuspSign) : "oklch(0.75 0.05 240)";
        const planets = occupants[n] ?? [];
        const text = interpretations?.[String(n)];

        return (
          <div
            key={n}
            id={`house-${n}`}
            className="scroll-mt-20 rounded-xl border border-border bg-card px-4 py-4 shadow-sm sm:px-5"
          >
            <div className="flex items-center gap-2.5 border-b border-border/70 pb-3 text-sm">
              <span
                style={{ color }}
                className="grid size-7 shrink-0 place-items-center rounded-md border border-border/80 bg-background/70 font-mono text-xs font-semibold tabular-nums"
              >
                {HOUSE_LABEL[n] ?? n}
              </span>
              <span className="truncate font-semibold text-foreground">
                {en ? def.themeEn : def.themeKa}
              </span>
              {cuspSign && (
                <span className="flex shrink-0 items-center gap-1 text-foreground/85">
                  <span
                    aria-hidden
                    style={{ color }}
                    className="w-4 shrink-0 text-center leading-none"
                  >
                    {`${cuspSign.symbol}︎`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {en ? cuspSign.labelEn : cuspSign.labelKa}
                  </span>
                </span>
              )}
              {planets.length > 0 && (
                <span
                  aria-hidden
                  className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary"
                >
                  {planets.map((p) => (
                    <span key={p.key} title={p.label}>
                      {p.symbol}
                    </span>
                  ))}
                </span>
              )}
            </div>
            {text && (
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/85">
                {text
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
