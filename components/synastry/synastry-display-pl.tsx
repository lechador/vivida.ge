import { Heart, Sparkles } from "lucide-react";

import {
  CATEGORIES,
  type SynastryAspect,
  type SynastryResult,
} from "@/lib/synastry";
import {
  ASPECT_GLYPH,
  ASPECT_LABEL_PL,
  BODY_LABEL_PL,
  CATEGORY_DESCRIPTOR_PL,
  CATEGORY_LABEL_PL,
  ELEMENT_LABEL_PL,
  HOUSE_LABEL_PL,
  aspectTone,
  categoryNarrativePl,
  describeAspectPl,
  describeOverlayPl,
  overallNarrativePl,
  overallVerdictPl,
} from "@/lib/synastry-pl";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import { SynastryShareButton } from "@/components/profile/synastry-share-button";
import type { CompatibilityCardProps } from "@/components/profile/compatibility-card";

const CATEGORY_CODE: Record<string, string> = {
  love: "01",
  friendship: "02",
  communication: "03",
  growth: "04",
  chemistry: "05",
  business: "06",
};

function aspectAccent(aspect: SynastryAspect): string {
  const tone = aspectTone(aspect.kind);
  return tone === "harmonious"
    ? "oklch(0.80 0.12 80)"
    : tone === "tense"
      ? "oklch(0.68 0.12 35)"
      : "oklch(0.76 0.06 235)";
}

export function SynastryDisplayPl({
  result,
  partnerName,
  shareCardProps,
}: {
  result: SynastryResult;
  partnerName: string;
  shareCardProps?: CompatibilityCardProps;
}) {
  const harmonious = result.topAspects.filter(
    (a) => aspectTone(a.kind) === "harmonious",
  );
  const tense = result.topAspects.filter((a) => aspectTone(a.kind) === "tense");

  return (
    <div className="space-y-10">
      <article className="relative overflow-hidden rounded-sm border border-border bg-card p-6 sm:p-8">
        <CornerCrosshair position="tl" />
        <CornerCrosshair position="tr" />
        <CornerCrosshair position="bl" />
        <CornerCrosshair position="br" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <div className="grid size-36 shrink-0 place-items-center rounded-sm border border-primary/40 bg-background/70 p-3">
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                INDEKS
              </div>
              <strong className="mt-1 block font-mono text-4xl font-semibold tabular-nums text-primary">
                {result.overall}%
              </strong>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                SYNASTRIA
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              OGÓLNA ZGODNOŚĆ · INDEKS KOMPOZYTOWY
            </div>
            <h2 className="mt-1.5 text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {overallVerdictPl(result.overall)}
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
              {overallNarrativePl(result.overall)}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-border pt-3 font-mono text-xs text-muted-foreground sm:justify-start">
              <span>
                ☉ SŁOŃCE: {ELEMENT_LABEL_PL[result.elements.sunA]} ↔{" "}
                {ELEMENT_LABEL_PL[result.elements.sunB]}
              </span>
              <span>·</span>
              <span>
                ☽ KSIĘŻYC: {ELEMENT_LABEL_PL[result.elements.moonA]} ↔{" "}
                {ELEMENT_LABEL_PL[result.elements.moonB]}
              </span>
            </div>
          </div>
        </div>
      </article>

      <section>
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              01 · OSIE RELACJI
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              Sześć sfer
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Jak poszczególne energie rozwijają się między Tobą a {partnerName}
          </span>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const score = result.scores[cat];
            return (
              <article
                key={cat}
                className="flex flex-col justify-between rounded-sm border border-border bg-card p-5"
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {CATEGORY_CODE[cat]}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-foreground/80">
                      {score}%
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-semibold text-foreground">
                    {CATEGORY_LABEL_PL[cat]}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {CATEGORY_DESCRIPTOR_PL[cat]}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-foreground/85">
                    {categoryNarrativePl(cat, score)}
                  </p>
                </div>
                <div className="mt-4 h-1 overflow-hidden bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {result.topAspects.length > 0 && (
        <section>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            02 · ASPEKTY MIĘDZYKOSMOGRAMOWE
          </div>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Kluczowe połączenia
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Najściślejsze powiązania między Twoimi planetami a planetami{" "}
            {partnerName}
          </p>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
            {result.topAspects.map((aspect) => {
              const accent = aspectAccent(aspect);
              return (
                <li
                  key={`${aspect.a}-${aspect.b}-${aspect.kind}`}
                  className="bg-card p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-background font-mono text-base"
                      style={{ color: accent }}
                    >
                      {ASPECT_GLYPH[aspect.kind]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2 text-sm font-medium text-foreground">
                        <span>
                          Twoje {BODY_LABEL_PL[aspect.a] ?? aspect.a}{" "}
                          <span style={{ color: accent }}>
                            {ASPECT_LABEL_PL[aspect.kind]}
                          </span>{" "}
                          {partnerName}: {BODY_LABEL_PL[aspect.b] ?? aspect.b}
                        </span>
                        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                          {aspect.orb.toFixed(1)}°
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                        {describeAspectPl(aspect)}
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
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            03 · NAKŁADANIE DOMÓW (OVERLAY)
          </div>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Planety w domach partnera
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Gdzie planety jednej osoby lądują w życiu i sferach drugiej
          </p>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
            {result.breakdown.topOverlays.map((overlay, index) => {
              const mine = overlay.source === "a";
              return (
                <li
                  key={`${overlay.source}-${overlay.body}-${overlay.house}-${index}`}
                  className="bg-card p-4 sm:p-5"
                >
                  <div className="text-sm font-medium text-foreground">
                    <span className="text-primary">
                      {mine ? "Twoje" : `${partnerName}:`}
                    </span>{" "}
                    {BODY_LABEL_PL[overlay.body] ?? overlay.body} →{" "}
                    {mine ? `${partnerName}:` : "Twój"}{" "}
                    {HOUSE_LABEL_PL[overlay.house] ?? `${overlay.house}. dom`}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                    {describeOverlayPl(overlay.body, overlay.house)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
        <AspectGroup
          title="Mocne strony"
          description="Harmonijne więzi, w których energia płynie swobodnie"
          icon={<Sparkles className="size-4" />}
          aspects={harmonious}
          empty="Ten kosmogram zawiera mniej łatwych aspektów, więc jego siła budowana jest poprzez uważność i wspólną praktykę."
        />
        <AspectGroup
          title="Punkty wzrostu"
          description="Napięcia tworzące głębię przy świadomym podejściu"
          icon={<Heart className="size-4" />}
          aspects={tense}
          empty="Wśród głównych kontaktów brak silnych napiętych aspektów, co wskazuje na naturalnie spokojniejszą dynamikę."
        />
      </section>

      <section className="rounded-sm border border-border bg-card p-5 sm:p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          METODOLOGIA · WAGI TELEMETRYCZNE
        </div>
        <h3 className="mt-1 font-semibold text-foreground">
          Jak powstaje ten wynik
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Vivida łączy aspekty międzykosmogramowe, nakładanie domów i
          pokrewieństwo żywiołów. Wynik jest przewodnikiem po dynamice relacji,
          a nie sztywną prognozą.
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border bg-border text-center">
          <div className="bg-background/60 p-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Aspekty
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-foreground">
              {result.breakdown.aspectPoints}
            </dd>
          </div>
          <div className="bg-background/60 p-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Domy
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-foreground">
              {result.breakdown.housePoints}
            </dd>
          </div>
          <div className="bg-background/60 p-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Żywioły
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-foreground">
              {result.breakdown.elementPoints}
            </dd>
          </div>
        </dl>
      </section>

      {shareCardProps && (
        <div className="flex justify-center">
          <SynastryShareButton cardProps={shareCardProps} locale="pl" />
        </div>
      )}
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
    <article className="bg-card p-5 sm:p-6">
      <header className="mb-4 flex items-center gap-2.5 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-sm border border-border bg-background text-primary">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
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
              <span className="font-medium text-foreground">
                {BODY_LABEL_PL[aspect.a] ?? aspect.a} ·{" "}
                {BODY_LABEL_PL[aspect.b] ?? aspect.b}
              </span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {ASPECT_LABEL_PL[aspect.kind]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
