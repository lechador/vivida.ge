import { aspectKey } from "@/lib/aspects";
import { bodyMeta, signByIndex } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";

const ASPECT_SYMBOL: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const ASPECT_LABEL_KA: Record<string, string> = {
  conjunction: "კონიუნქცია",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრინი",
  opposition: "ოპოზიცია",
};

const FAMILY_TINT: Record<string, string> = {
  harmonic:
    "border-[oklch(0.78_0.18_200/0.45)] bg-gradient-to-br from-[oklch(0.78_0.18_200/0.08)] to-transparent",
  tense:
    "border-[oklch(0.72_0.22_350/0.45)] bg-gradient-to-br from-[oklch(0.72_0.22_350/0.08)] to-transparent",
  neutral:
    "border-[oklch(0.85_0.16_85/0.45)] bg-gradient-to-br from-[oklch(0.85_0.16_85/0.08)] to-transparent",
};

const FAMILY_GLYPH_COLOR: Record<string, string> = {
  harmonic: "text-[oklch(0.78_0.18_200)]",
  tense: "text-[oklch(0.72_0.22_350)]",
  neutral: "text-[oklch(0.85_0.16_85)]",
};

const FAMILY_LABEL_KA: Record<string, string> = {
  harmonic: "ჰარმონიული",
  tense: "დაძაბული",
  neutral: "შერწყმა",
};

function bodyDisplay(chart: NatalChartJson, key: string) {
  if (key === "ascendant") {
    return {
      label: "ამომავალი",
      symbol: "AC",
      sign: signByIndex(chart.ascendant.signIndex),
    };
  }
  if (key === "midheaven") {
    return {
      label: "ზენიტი",
      symbol: "MC",
      sign: signByIndex(chart.midheaven.signIndex),
    };
  }
  const body = chart.bodies[key];
  const meta = bodyMeta(key);
  return {
    label: meta?.labelKa ?? key,
    symbol: meta?.symbol ?? "?",
    sign: body ? signByIndex(body.signIndex) : null,
  };
}

function strengthLabel(orb: number, kind: string): string {
  // Orb tolerances per aspect kind (mirrors lib/aspects.ts). A small fraction
  // of the tolerance = exact; over half = wide. Kept as friendly Georgian
  // adjectives so the card body reads as "feeling," not measurement.
  const TOL: Record<string, number> = {
    conjunction: 10,
    opposition: 10,
    sextile: 6,
    square: 8,
    trine: 8,
  };
  const tol = TOL[kind] ?? 8;
  if (orb < 0.5) return "ზუსტი";
  if (orb < tol * 0.4) return "ძლიერი";
  if (orb < tol * 0.75) return "საშუალო";
  return "მსუბუქი";
}

function orbTooltip(orb: number): string {
  if (orb < 0.5) return "ზუსტი ბმა";
  return `ორბი ${orb.toFixed(1)}°`;
}

/**
 * All chart-internal aspects, sorted with a personal-planet bias so the
 * most-relevant-to-you ones appear first. Returns the full list — the
 * UI shows everything detected.
 */
function sortAspectsForDisplay(
  chart: NatalChartJson
): NatalChartJson["aspects"] {
  if (!chart.aspects) return [];
  const personal = new Set([
    "sun",
    "moon",
    "ascendant",
    "midheaven",
    "mercury",
    "venus",
    "mars",
  ]);
  const isOuter = (k: string) =>
    ["jupiter", "saturn", "uranus", "neptune", "pluto"].includes(k);

  return [...chart.aspects]
    .map((a) => {
      const involvesPersonal = personal.has(a.a) || personal.has(a.b);
      const bothOuter = isOuter(a.a) && isOuter(a.b);
      const score =
        a.intensity + (involvesPersonal ? 0.5 : 0) + (bothOuter ? -0.4 : 0);
      return { ...a, score };
    })
    .sort((x, y) => y.score - x.score);
}

export function AspectCards({
  chart,
  interpretations,
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
}) {
  const aspects = sortAspectsForDisplay(chart);
  if (!aspects || aspects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        ამ რუკაში ძირითადი ასპექტები არ ჩანს.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {aspects.map((a) => {
        const left = bodyDisplay(chart, a.a);
        const right = bodyDisplay(chart, a.b);
        const text = interpretations?.[aspectKey(a.a, a.b, a.kind)];
        const tint = FAMILY_TINT[a.family] ?? FAMILY_TINT.neutral;
        const glyphColor = FAMILY_GLYPH_COLOR[a.family] ?? FAMILY_GLYPH_COLOR.neutral;

        return (
          <article
            key={`${a.a}-${a.b}-${a.kind}`}
            className={`group relative overflow-hidden rounded-2xl border p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:ring-foreground/15 ${tint}`}
            title={orbTooltip(a.orb)}
          >
            <header className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-2xl text-foreground">
                  <span title={left.label}>{left.symbol}</span>
                  <span className={`text-3xl ${glyphColor}`}>
                    {ASPECT_SYMBOL[a.kind]}
                  </span>
                  <span title={right.label}>{right.symbol}</span>
                </div>
                <div className="mt-1.5 text-sm font-medium text-foreground">
                  {left.label} {ASPECT_LABEL_KA[a.kind]} {right.label}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span
                    className={`rounded-full border bg-background/40 px-2 py-0.5 ${glyphColor}`}
                    style={{ borderColor: "currentColor" }}
                  >
                    {FAMILY_LABEL_KA[a.family] ?? a.family}
                  </span>
                  <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-foreground/80">
                    {strengthLabel(a.orb, a.kind)}
                  </span>
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
