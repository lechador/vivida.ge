import { bodyMeta, signByIndex, formatDegree } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";

const ORDER = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

export function PlanetList({ chart }: { chart: NatalChartJson }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl">
      <header className="flex items-center justify-between border-b border-border/50 p-5">
        <h3 className="text-lg font-semibold">პლანეტები</h3>
        <span className="text-xs text-muted-foreground">
          ნიშანი · გრადუსი · სახლი
        </span>
      </header>
      <ul className="divide-y divide-border/40">
        {ORDER.map((key) => {
          const body = chart.bodies[key];
          if (!body) return null;
          const meta = bodyMeta(key);
          const sign = signByIndex(body.signIndex);
          return (
            <li
              key={key}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-accent/5"
            >
              <span className="text-2xl text-muted-foreground/80">
                {meta?.symbol ?? "?"}
              </span>
              <div>
                <div className="font-medium text-foreground">
                  {meta?.labelKa ?? key}{" "}
                  <span className="text-muted-foreground">
                    {sign.labelKa}-ში
                  </span>
                  {body.retrograde && (
                    <span className="ml-2 rounded bg-[var(--vivida-pink)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--vivida-pink)]">
                      რეტროგრადული
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDegree(body.signDegree)}
                  {body.house ? ` · ${body.house}-ე სახლი` : ""}
                </div>
              </div>
              <span className="text-2xl text-muted-foreground/60">
                {sign.symbol}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
