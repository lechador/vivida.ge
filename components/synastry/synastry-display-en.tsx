import { Heart, Sparkles } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_EMOJI,
  type SynastryAspect,
  type SynastryResult,
} from "@/lib/synastry";
import {
  ASPECT_GLYPH,
  ASPECT_LABEL_EN,
  BODY_LABEL_EN,
  CATEGORY_DESCRIPTOR_EN,
  CATEGORY_LABEL_EN,
  ELEMENT_EMOJI_EN,
  ELEMENT_LABEL_EN,
  HOUSE_LABEL_EN,
  aspectTone,
  categoryNarrativeEn,
  describeAspectEn,
  describeOverlayEn,
  overallNarrativeEn,
  overallVerdictEn,
} from "@/lib/synastry-en";

const CATEGORY_COLOR: Record<string, string> = {
  love: "oklch(0.72 0.22 350)",
  friendship: "oklch(0.85 0.16 85)",
  communication: "oklch(0.75 0.16 220)",
  growth: "oklch(0.65 0.13 130)",
  chemistry: "oklch(0.7 0.22 30)",
  business: "oklch(0.72 0.10 270)",
};

function aspectAccent(aspect: SynastryAspect): string {
  const tone = aspectTone(aspect.kind);
  return tone === "harmonious"
    ? "oklch(0.78 0.18 200)"
    : tone === "tense"
      ? "oklch(0.72 0.22 350)"
      : "oklch(0.78 0.18 305)";
}

export function SynastryDisplayEn({
  result,
  partnerName,
}: {
  result: SynastryResult;
  partnerName: string;
}) {
  const harmonious = result.topAspects.filter(
    (a) => aspectTone(a.kind) === "harmonious",
  );
  const tense = result.topAspects.filter((a) => aspectTone(a.kind) === "tense");

  return (
    <div className="space-y-10">
      <article className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-pink)]/15 p-8 ring-1 ring-foreground/10 backdrop-blur-xl">
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <div className="grid size-36 shrink-0 place-items-center rounded-full bg-[conic-gradient(var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] p-2 shadow-[0_0_40px_-10px_var(--vivida-violet)]">
            <div className="grid size-full place-items-center rounded-full bg-card/95">
              <div className="text-center">
                <strong className="block text-4xl tabular-nums">
                  {result.overall}%
                </strong>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  overall
                </span>
              </div>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
              Overall compatibility
            </div>
            <h2 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {overallVerdictEn(result.overall)}
              </span>
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85">
              {overallNarrativeEn(result.overall)}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs sm:justify-start">
              <span className="rounded-full border border-border bg-card/60 px-3 py-1.5">
                Sun: {ELEMENT_EMOJI_EN[result.elements.sunA]}{" "}
                {ELEMENT_LABEL_EN[result.elements.sunA]} ↔{" "}
                {ELEMENT_EMOJI_EN[result.elements.sunB]}{" "}
                {ELEMENT_LABEL_EN[result.elements.sunB]}
              </span>
              <span className="rounded-full border border-border bg-card/60 px-3 py-1.5">
                Moon: {ELEMENT_EMOJI_EN[result.elements.moonA]}{" "}
                {ELEMENT_LABEL_EN[result.elements.moonA]} ↔{" "}
                {ELEMENT_EMOJI_EN[result.elements.moonB]}{" "}
                {ELEMENT_LABEL_EN[result.elements.moonB]}
              </span>
            </div>
          </div>
        </div>
      </article>

      <section>
        <header className="mb-4">
          <h3 className="text-xl font-semibold tracking-tight">
            Six areas of compatibility
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            How different parts of the connection develop between you and{" "}
            {partnerName}
          </p>
        </header>
        <div className="space-y-3">
          {CATEGORIES.map((category) => {
            const score = result.scores[category];
            const color = CATEGORY_COLOR[category];
            return (
              <article
                key={category}
                className="rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-foreground/5 text-xl">
                    {CATEGORY_EMOJI[category]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">
                          {CATEGORY_LABEL_EN[category]}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {CATEGORY_DESCRIPTOR_EN[category]}
                        </p>
                      </div>
                      <strong className="tabular-nums" style={{ color }}>
                        {score}%
                      </strong>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                      {categoryNarrativeEn(category, score)}
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${score}%`, background: color }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {result.topAspects.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold tracking-tight">
            Key chart connections
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The closest links between your planets and {partnerName}&apos;s
            planets
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.topAspects.map((aspect) => {
              const accent = aspectAccent(aspect);
              return (
                <li
                  key={`${aspect.a}-${aspect.b}-${aspect.kind}`}
                  className="rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-md"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-foreground/5 text-lg"
                      style={{ color: accent }}
                    >
                      {ASPECT_GLYPH[aspect.kind]}
                    </span>
                    <div>
                      <div className="text-sm font-medium">
                        Your {BODY_LABEL_EN[aspect.a] ?? aspect.a}{" "}
                        <span style={{ color: accent }}>
                          {ASPECT_LABEL_EN[aspect.kind]}
                        </span>{" "}
                        {partnerName}&apos;s{" "}
                        {BODY_LABEL_EN[aspect.b] ?? aspect.b}{" "}
                        <span className="text-xs text-muted-foreground">
                          · {aspect.orb.toFixed(1)}°
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                        {describeAspectEn(aspect)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {result.breakdown.topOverlays.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold tracking-tight">
            House overlays
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Where one person&apos;s planets land in the other person&apos;s life
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.breakdown.topOverlays.map((overlay, index) => {
              const mine = overlay.source === "a";
              return (
                <li
                  key={`${overlay.source}-${overlay.body}-${overlay.house}-${index}`}
                  className="rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5"
                >
                  <div className="text-sm font-medium">
                    <span className="text-[var(--vivida-violet)]">
                      {mine ? "Your" : `${partnerName}'s`}
                    </span>{" "}
                    {BODY_LABEL_EN[overlay.body] ?? overlay.body} →{" "}
                    {mine ? `${partnerName}'s` : "your"}{" "}
                    {HOUSE_LABEL_EN[overlay.house] ?? `house ${overlay.house}`}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                    {describeOverlayEn(overlay.body, overlay.house)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid gap-6 sm:grid-cols-2">
        <AspectGroup
          title="Strengths"
          description="Harmonious links where energy moves more freely"
          icon={<Sparkles className="size-4" />}
          aspects={harmonious}
          empty="This chart has fewer easy aspects, so its strengths are likely to be built through attention and practice."
        />
        <AspectGroup
          title="Growth points"
          description="Tension that can create depth when handled consciously"
          icon={<Heart className="size-4" />}
          aspects={tense}
          empty="There are no strong tense aspects among the closest contacts, suggesting a naturally calmer dynamic."
        />
      </section>

      <section className="rounded-2xl border border-border bg-card/45 p-5 ring-1 ring-foreground/5">
        <h3 className="font-semibold">How this score is built</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Vivida combines cross-chart aspects, house overlays, and elemental
          affinity. The result is a guide to the relationship&apos;s patterns,
          not a fixed prediction.
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-foreground/5 p-3">
            <dt className="text-xs text-muted-foreground">Aspects</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {result.breakdown.aspectPoints}
            </dd>
          </div>
          <div className="rounded-xl bg-foreground/5 p-3">
            <dt className="text-xs text-muted-foreground">Houses</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {result.breakdown.housePoints}
            </dd>
          </div>
          <div className="rounded-xl bg-foreground/5 p-3">
            <dt className="text-xs text-muted-foreground">Elements</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {result.breakdown.elementPoints}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function AspectGroup({
  title,
  description,
  icon,
  aspects,
  empty,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  aspects: SynastryAspect[];
  empty: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5">
      <header className="mb-4 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-foreground/5 text-[var(--vivida-cyan)]">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </header>
      {aspects.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {aspects.slice(0, 4).map((aspect) => (
            <li
              key={`${aspect.a}-${aspect.b}-${aspect.kind}`}
              className="flex items-center gap-2 text-sm"
            >
              <span style={{ color: aspectAccent(aspect) }}>
                {ASPECT_GLYPH[aspect.kind]}
              </span>
              <span className="font-medium">
                {BODY_LABEL_EN[aspect.a] ?? aspect.a} ·{" "}
                {BODY_LABEL_EN[aspect.b] ?? aspect.b}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {ASPECT_LABEL_EN[aspect.kind]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
