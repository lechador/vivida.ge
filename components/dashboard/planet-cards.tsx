import { bodyMeta, formatDegree, signByIndex, signColor } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const PLANETS_TO_SHOW = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

/**
 * Flat planet list — one tight, aligned row per planet (glyph · name · sign ·
 * degree · house) with the interpretation shown inline beneath it (open by
 * default). The positions table links here via #planet-<key> anchors.
 */
export function PlanetCards({
  chart,
  interpretations,
  locale = "ka",
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl">
      {PLANETS_TO_SHOW.map((key) => {
        const body = chart.bodies[key];
        if (!body) return null;
        const meta = bodyMeta(key);
        const sign = signByIndex(body.signIndex);
        const color = signColor(sign);
        const text = interpretations?.[key];

        return (
          <div
            key={key}
            id={`planet-${key}`}
            className="scroll-mt-20 border-t border-border/50 px-4 py-3.5 first:border-t-0 sm:px-5"
          >
            <div className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                style={{ color }}
                className="w-5 shrink-0 text-center text-base leading-none"
              >
                {meta?.symbol ?? "?"}
              </span>
              <span className="w-24 shrink-0 font-medium sm:w-28">
                {en ? meta?.labelEn ?? key : meta?.labelKa ?? key}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <span
                  aria-hidden
                  style={{ color }}
                  className="w-5 shrink-0 text-center leading-none"
                >
                  {`${sign.symbol}︎`}
                </span>
                <span className="truncate">{en ? sign.labelEn : sign.labelKa}</span>
              </span>
              <span className="ml-auto shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                {formatDegree(body.signDegree)}
                {body.retrograde ? " ℞" : ""}
                {body.house ? ` · ${body.house} ${am ? "տուն" : en ? "house" : "სახ."}` : ""}
              </span>
            </div>
            {text && (
              <p className="mt-2 pl-8 text-sm leading-relaxed text-foreground/85">
                {text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
