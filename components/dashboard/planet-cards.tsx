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
  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
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
            className="scroll-mt-20 px-4 py-4 sm:px-5"
          >
            <div className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                style={{ color }}
                className="w-5 shrink-0 text-center text-base leading-none"
              >
                {meta?.symbol ?? "?"}
              </span>
              <span className="w-24 shrink-0 font-semibold text-foreground sm:w-28">
                {en ? (meta?.labelEn ?? key) : (meta?.labelKa ?? key)}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-foreground/85">
                <span
                  aria-hidden
                  style={{ color }}
                  className="w-5 shrink-0 text-center leading-none"
                >
                  {`${sign.symbol}︎`}
                </span>
                <span className="truncate">
                  {en ? sign.labelEn : sign.labelKa}
                </span>
              </span>
              <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                {formatDegree(body.signDegree)}
                {body.retrograde ? " ℞" : ""}
                {body.house ? ` · ${body.house} ${en ? "house" : "სახ."}` : ""}
              </span>
            </div>
            {text && (
              <p className="mt-2.5 pl-8 text-sm leading-relaxed text-foreground/85">
                {text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
