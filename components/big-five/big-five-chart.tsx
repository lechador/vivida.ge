import {
  BIG5_LEVEL_LABEL,
  BIG5_LEVEL_LABEL_EN,
  BIG5_LEVEL_LABEL_PL,
  type BigFiveResult,
} from "@/lib/big-five/scoring";
import { TraitRadar, type RadarPoint } from "@/components/tests/trait-radar";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * The summary section of the Big Five result, the radar + a labelled score bar per
 * trait. This is the "profile shape"; the written per-trait analysis lives in
 * BigFiveDetail (gated).
 */
export function BigFiveChart({
  result,
  locale = "ka",
}: {
  result: BigFiveResult;
  locale?: UserLocale;
}) {
  const pl = locale === "pl";
  const en = locale === "en";

  const SHORT_KA: Record<string, string> = {
    openness: "ღიაობა",
    conscientiousness: "სინდის.",
    extraversion: "ექსტრავ.",
    agreeableness: "თანხმ.",
    neuroticism: "ნევროტ.",
  };
  const SHORT_EN: Record<string, string> = {
    openness: "Openness",
    conscientiousness: "Conscient.",
    extraversion: "Extraver.",
    agreeableness: "Agreeabl.",
    neuroticism: "Neurotic.",
  };
  const SHORT_PL: Record<string, string> = {
    openness: "Otwartość",
    conscientiousness: "Sumien.",
    extraversion: "Ekstraw.",
    agreeableness: "Ugodow.",
    neuroticism: "Neurot.",
  };

  const levelLabels = pl
    ? BIG5_LEVEL_LABEL_PL
    : en
      ? BIG5_LEVEL_LABEL_EN
      : BIG5_LEVEL_LABEL;

  const points: RadarPoint[] = result.traits.map((t) => ({
    key: t.key,
    label: pl ? t.namePl : en ? t.nameEn : t.nameKa,
    shortLabel: (pl ? SHORT_PL : en ? SHORT_EN : SHORT_KA)[t.key],
    score: t.score,
    hue: t.hue,
  }));

  return (
    <div className="rounded-3xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {pl
          ? "Twój profil osobowości"
          : en
            ? "Your personality profile"
            : "შენი პიროვნების პროფილი"}
      </h2>
      <TraitRadar points={points} locale={locale} />

      <div className="mt-5 space-y-3">
        {result.traits.map((t) => (
          <div key={t.key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span>{t.glyph}</span>
                {pl ? t.namePl : en ? t.nameEn : t.nameKa}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-px text-[10px] font-semibold"
                  style={{
                    color: t.hue,
                    background: `color-mix(in oklch, ${t.hue} 15%, transparent)`,
                  }}
                >
                  {levelLabels[t.level]}
                </span>
                <span
                  className="tabular-nums font-bold"
                  style={{ color: t.hue }}
                >
                  {t.score}
                </span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${t.score}%`,
                  background: `linear-gradient(90deg, color-mix(in oklch, ${t.hue} 55%, transparent), ${t.hue})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
