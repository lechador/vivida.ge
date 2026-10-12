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

/**
 * Flat houses list, one tight, aligned row per house (axis/number · theme ·
 * cusp sign · occupant planets) with the interpretation inline beneath it
 * (open by default).
 */
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
      label: en ? meta?.labelEn ?? key : meta?.labelKa ?? key,
      symbol: meta?.symbol ?? "?",
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl">
      {HOUSE_NUMBERS.map((n) => {
        const def = houseDef(n);
        const cusp = chart.houses.find((h) => h.number === n);
        const cuspSign = cusp ? signByIndex(cusp.signIndex) : null;
        const color = cuspSign ? signColor(cuspSign) : "oklch(0.6 0.1 285)";
        const planets = occupants[n] ?? [];
        const text = interpretations?.[String(n)];

        return (
          <div
            key={n}
            id={`house-${n}`}
            className="scroll-mt-20 border-t border-border/50 px-4 py-3.5 first:border-t-0 sm:px-5"
          >
            <div className="flex items-center gap-3 text-sm">
              <span
                style={{ color }}
                className="w-6 shrink-0 text-center font-semibold tabular-nums"
              >
                {HOUSE_LABEL[n] ?? n}
              </span>
              {/* No truncate: titles are curated to ≤16 chars, and if one ever
                  outgrows the column it wraps instead of clipping. */}
              <span className="w-32 shrink-0 font-medium sm:w-44">
                {en ? def.themeEn : def.themeKa}
              </span>
              {cuspSign && (
                <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                  <span
                    aria-hidden
                    style={{ color }}
                    className="w-5 shrink-0 text-center leading-none"
                  >
                    {`${cuspSign.symbol}︎`}
                  </span>
                  <span className="truncate">{en ? cuspSign.labelEn : cuspSign.labelKa}</span>
                </span>
              )}
              {planets.length > 0 && (
                <span
                  aria-hidden
                  className="ml-auto flex shrink-0 items-center gap-1 text-foreground/70"
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
              <div className="mt-2 space-y-2 pl-9 text-sm leading-relaxed text-foreground/85">
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
