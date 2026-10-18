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
    <div className="grid gap-3.5 sm:grid-cols-2">
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
            className="scroll-mt-20 rounded-xl border border-border bg-card px-4 py-4 shadow-sm sm:px-5"
          >
            <div className="flex items-center gap-2.5 border-b border-border/70 pb-3 text-sm">
              <span
                aria-hidden
                style={{ color }}
                className="grid size-7 shrink-0 place-items-center rounded-md border border-border/80 bg-background/70 text-base leading-none"
              >
                {meta?.symbol ?? "?"}
              </span>
              <span className="font-semibold text-foreground">
                {en ? (meta?.labelEn ?? key) : (meta?.labelKa ?? key)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="flex min-w-0 items-center gap-1.5 text-foreground/90">
                <span
                  aria-hidden
                  style={{ color }}
                  className="shrink-0 text-center leading-none"
                >
                  {`${sign.symbol}︎`}
                </span>
                <span className="truncate font-medium">
                  {en ? sign.labelEn : sign.labelKa}
                </span>
              </span>
              <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                {formatDegree(body.signDegree)}
                {body.retrograde ? " ℞" : ""}
                {body.house ? ` · ${body.house} ${en ? "H" : "სახ."}` : ""}
              </span>
            </div>
            {text && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                {text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
