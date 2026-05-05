import { HOUSE_NUMBERS, houseDef } from "@/lib/houses";
import { bodyMeta, signByIndex } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import { SignBadge } from "./sign-badge";

export function HouseCards({
  chart,
  interpretations,
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
}) {
  // Build a quick lookup of which planets occupy each house
  const occupants: Record<number, Array<{ key: string; label: string; symbol: string }>> = {};
  for (const [key, body] of Object.entries(chart.bodies)) {
    if (!body.house) continue;
    const meta = bodyMeta(key);
    (occupants[body.house] ??= []).push({
      key,
      label: meta?.labelKa ?? key,
      symbol: meta?.symbol ?? "?",
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {HOUSE_NUMBERS.map((n) => {
        const def = houseDef(n);
        const cusp = chart.houses.find((h) => h.number === n);
        const cuspSign = cusp ? signByIndex(cusp.signIndex) : null;
        const planets = occupants[n] ?? [];
        const text = interpretations?.[String(n)];

        const isAxis = n === 1 || n === 4 || n === 7 || n === 10;

        return (
          <article
            key={n}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
          >
            <header className="mb-4 flex items-start gap-4">
              {/* Cusp sign as a small badge with the house number floating
                  above it — sign + number form the house's identity. */}
              {cuspSign ? (
                <div className="relative">
                  <SignBadge sign={cuspSign} size="sm" />
                  <span
                    aria-hidden
                    className="absolute -top-2 -left-2 grid size-6 place-items-center rounded-full border-2 border-background bg-[var(--vivida-cyan)]/95 text-[11px] font-bold text-background shadow-sm"
                  >
                    {n}
                  </span>
                </div>
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-card/60 text-base font-semibold text-[var(--vivida-cyan)] ring-1 ring-foreground/10">
                  {n}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold tracking-tight">
                    {def.labelKa}
                  </h3>
                  {planets.length > 0 ? (
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                      {planets.map((p) => (
                        <span
                          key={p.key}
                          title={p.label}
                          className="grid size-6 place-items-center rounded-full border border-border/60 bg-background/60 text-[11px]"
                        >
                          {p.symbol}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="shrink-0 rounded-full bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      ცარიელი
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {def.themeKa}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {cuspSign && (
                    <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-foreground/80">
                      <span aria-hidden className="mr-1">
                        {cuspSign.symbol}
                      </span>
                      {cuspSign.labelKa}
                    </span>
                  )}
                  {isAxis && (
                    <span className="rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-2 py-0.5 font-semibold text-[var(--vivida-violet)]">
                      ღერძი
                    </span>
                  )}
                </div>
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
