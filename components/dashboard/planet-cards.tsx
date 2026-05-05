import { bodyMeta, formatDegree, signByIndex } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import { SignBadge } from "./sign-badge";

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
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PLANETS_TO_SHOW.map((key) => {
        const body = chart.bodies[key];
        if (!body) return null;
        const meta = bodyMeta(key);
        const sign = signByIndex(body.signIndex);
        const text = interpretations?.[key];

        return (
          <article
            key={key}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
          >
            <header className="mb-4 flex items-start gap-4">
              {/* Sign badge: the zodiac glyph leads, planet symbol rides
                  as a small corner — the sign is the modifier that gives
                  this planet its flavor for this person. */}
              <div
                className="relative"
                title={`${formatDegree(body.signDegree)} ${sign.labelKa}-ში`}
              >
                <SignBadge sign={sign} size="md" />
                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-background bg-card text-[11px] font-medium text-foreground/80 shadow-sm"
                >
                  {meta?.symbol ?? "?"}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {meta?.labelKa ?? key}
                  </h3>
                  <span className="text-base text-muted-foreground">
                    {sign.labelKa}-ში
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {meta?.meaningKa}
                </div>
                {(body.house || body.retrograde) && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {body.house && (
                      <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-foreground/80">
                        {body.house}-ე სახლი
                      </span>
                    )}
                    {body.retrograde && (
                      <span className="rounded-full bg-[var(--vivida-pink)]/15 px-2 py-0.5 font-semibold text-[var(--vivida-pink)]">
                        რეტროგრადული
                      </span>
                    )}
                  </div>
                )}
              </div>
            </header>

            {text && (
              <p className="text-base leading-relaxed text-foreground/85">
                {text}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
