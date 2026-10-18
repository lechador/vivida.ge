"use client";

import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_DESCRIPTOR_KA,
  CATEGORY_LABEL_KA,
  ELEMENT_LABEL_KA,
  HOUSE_LABEL_KA,
  overallVerdict,
  type ChartElement,
  type SynastryAspect,
  type SynastryCategory,
  type SynastryHouseOverlay,
  type SynastryResult,
} from "@/lib/synastry";
import {
  ASPECT_LABEL_EN,
  BODY_LABEL_EN,
  CATEGORY_DESCRIPTOR_EN,
  CATEGORY_LABEL_EN,
  ELEMENT_LABEL_EN,
  HOUSE_LABEL_EN,
  overallVerdictEn,
} from "@/lib/synastry-en";
import {
  aspectBreakdown,
  aspectGlyph,
  aspectLabel,
  aspectValence,
  bodyLabel,
  describeAspect,
  narrateCategory,
  overallNarrative,
  splitByValence,
  synastryAspectKey,
  synastryOverlayKey,
} from "@/lib/synastry-interpretation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import { SynastryShareButton } from "./synastry-share-button";
import type { CompatibilityCardProps } from "./compatibility-card";
import type { UserLocale } from "@/lib/i18n/user-locale";

const CATEGORY_CODE: Record<string, string> = {
  love: "01",
  friendship: "02",
  communication: "03",
  growth: "04",
  chemistry: "05",
  business: "06",
};

function bodyLabelFor(body: string, en: boolean): string {
  return en ? (BODY_LABEL_EN[body] ?? body) : bodyLabel(body);
}

function aspectLabelFor(kind: SynastryAspect["kind"], en: boolean): string {
  return en ? (ASPECT_LABEL_EN[kind] ?? kind) : aspectLabel(kind);
}

export function SynastryDisplay({
  result,
  partnerName,
  shareCardProps,
  interpretations = {},
  locale = "ka",
}: {
  result: SynastryResult;
  partnerName: string;
  shareCardProps?: CompatibilityCardProps;
  interpretations?: Record<string, string>;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const verdict = en
    ? overallVerdictEn(result.overall)
    : overallVerdict(result.overall);
  const narrative = overallNarrative(result.overall, locale);
  const { strengths, growth } = splitByValence(result.topAspects);
  const [activeAspect, setActiveAspect] = useState<SynastryAspect | null>(null);

  return (
    <div className="space-y-10">
      {/* Hero ring + overall in a Swiss-grid Architectural Ledger */}
      <div className="relative overflow-hidden rounded-sm border border-border bg-card p-6 sm:p-8">
        <CornerCrosshair position="tl" />
        <CornerCrosshair position="tr" />
        <CornerCrosshair position="bl" />
        <CornerCrosshair position="br" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <OverallRing percent={result.overall} />
          <div className="text-center sm:text-left">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              {en
                ? "OVERALL COMPATIBILITY · COMPOSITE INDEX"
                : "ერთობლივი თავსებადობა · კომპოზიტური ინდექსი"}
            </div>
            <h2 className="mt-1.5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {verdict}
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
              {narrative}
            </p>
            <ElementPairing
              sunA={result.elements.sunA}
              sunB={result.elements.sunB}
              moonA={result.elements.moonA}
              moonB={result.elements.moonB}
              locale={locale}
            />
            {shareCardProps && (
              <div className="mt-5">
                <SynastryShareButton
                  cardProps={shareCardProps}
                  locale={locale}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Per-category 6-axis Swiss grid */}
      <section>
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              01 · {en ? "RELATIONAL AXES" : "ურთიერთობის ღერძები"}
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {en ? "Six areas" : "ექვსი სფერო"}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {en
              ? `How different energies develop between you and ${partnerName}`
              : `როგორ ვითარდება სხვადასხვა ენერგია შენსა და ${partnerName}-ს შორის`}
          </span>
        </header>

        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const score = result.scores[cat];
            return (
              <article
                key={cat}
                className="flex flex-col justify-between bg-card p-5 transition-colors hover:bg-secondary/20"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2.5">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        AXIS {CATEGORY_CODE[cat] ?? "00"}
                      </span>
                      <h4 className="mt-0.5 text-base font-semibold tracking-tight text-foreground">
                        {en ? CATEGORY_LABEL_EN[cat] : CATEGORY_LABEL_KA[cat]}
                      </h4>
                    </div>
                    <span className="font-mono text-lg font-semibold tabular-nums text-primary">
                      {score}%
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {en
                      ? CATEGORY_DESCRIPTOR_EN[cat]
                      : CATEGORY_DESCRIPTOR_KA[cat]}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/85">
                    {narrateCategory(cat as SynastryCategory, score, locale)}
                  </p>
                </div>

                <div className="mt-4 h-1 overflow-hidden bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Top cross-aspects */}
      {result.topAspects.length > 0 && (
        <section>
          <header className="mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              02 · {en ? "INTER-CHART ASPECTS" : "რუკათაშორისი ასპექტები"}
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {en ? "Key connections" : "მთავარი კავშირები"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {en
                ? "The closest links between the two natal charts"
                : "ცის წერტილები, რომლებიც ერთმანეთს ყველაზე ახლოს ეხმიანებიან"}
            </p>
          </header>
          <ul className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
            {result.topAspects.map((a) => (
              <AspectRow
                key={`${a.a}-${a.b}-${a.kind}`}
                aspect={a}
                text={interpretations[synastryAspectKey(a.a, a.b, a.kind)]}
                onSelect={() => setActiveAspect(a)}
                locale={locale}
              />
            ))}
          </ul>
        </section>
      )}

      {/* House overlays */}
      {result.breakdown.topOverlays.length > 0 && (
        <OverlaySection
          overlays={result.breakdown.topOverlays}
          partnerName={partnerName}
          interpretations={interpretations}
          locale={locale}
        />
      )}

      {/* Strengths × growth */}
      {(strengths.length > 0 || growth.length > 0) && (
        <section className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
          <ValenceColumn
            title={en ? "Strengths" : "ძლიერი მხარეები"}
            description={
              en
                ? "Harmonious links where energy flows more freely"
                : "ჰარმონიული კავშირები, სადაც ენერგია თავისუფლად მიედინება"
            }
            icon={<Sparkles className="size-4" />}
            accent="oklch(0.80 0.12 80)"
            aspects={strengths}
            empty={
              en
                ? "There are fewer harmonious aspects, so this connection grows through conscious effort."
                : "ცის რუკაში ჰარმონიული ასპექტები ნაკლებია, ეს ნიშნავს, რომ კავშირი მცდელობით აშენდება."
            }
            onSelect={setActiveAspect}
            locale={locale}
          />
          <ValenceColumn
            title={en ? "Growth points" : "ზრდის წერტილები"}
            description={
              en
                ? "Tension that can create depth when handled with care"
                : "დაძაბულობა, რომელიც სწორად მიდგომისას სიღრმეს აჩენს"
            }
            icon={<Heart className="size-4" />}
            accent="oklch(0.68 0.12 35)"
            aspects={growth}
            empty={
              en
                ? "No major tense aspects stand out, suggesting a naturally calmer dynamic."
                : "ბოლო ცის რუკას მძაფრი დაძაბულობა არ ახლავს, ბუნებრივად მშვიდი დინამიკა."
            }
            onSelect={setActiveAspect}
            locale={locale}
          />
        </section>
      )}

      {/* Score breakdown */}
      <ScoreBreakdown breakdown={result.breakdown} locale={locale} />

      <AspectDialog
        aspect={activeAspect}
        text={
          activeAspect
            ? interpretations[
                synastryAspectKey(
                  activeAspect.a,
                  activeAspect.b,
                  activeAspect.kind,
                )
              ]
            : undefined
        }
        onClose={() => setActiveAspect(null)}
        locale={locale}
      />
    </div>
  );
}

function AspectRow({
  aspect,
  text,
  onSelect,
  locale,
}: {
  aspect: SynastryAspect;
  text?: string;
  onSelect: () => void;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const valence = aspectValence(aspect.kind);
  const accent =
    valence === "harmonious"
      ? "oklch(0.80 0.12 80)"
      : valence === "tense"
        ? "oklch(0.68 0.12 35)"
        : "oklch(0.76 0.06 235)";
  return (
    <li className="bg-card">
      <button
        type="button"
        onClick={onSelect}
        className="group flex h-full w-full items-start gap-3.5 p-4 text-left transition-colors hover:bg-secondary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
        aria-label={`${bodyLabelFor(aspect.a, en)} ${aspectLabelFor(aspect.kind, en)} ${bodyLabelFor(aspect.b, en)}, ${en ? "details" : "დეტალები"}`}
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-background font-mono text-base"
          style={{ color: accent }}
          title={aspectLabelFor(aspect.kind, en)}
        >
          {aspectGlyph(aspect.kind)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 text-sm font-medium text-foreground">
            <span>{bodyLabelFor(aspect.a, en)}</span>
            <span style={{ color: accent }}>{aspectGlyph(aspect.kind)}</span>
            <span>{bodyLabelFor(aspect.b, en)}</span>
            <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
              {aspect.orb.toFixed(1)}°
            </span>
          </div>
          <div
            className={
              text
                ? "mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/80"
                : "mt-1 text-xs leading-relaxed text-foreground/80"
            }
          >
            {text ?? describeAspect(aspect, locale)}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary opacity-75 transition-opacity group-hover:opacity-100">
            {en ? "Inspect aspect →" : "სრულად ნახვა →"}
          </div>
        </div>
      </button>
    </li>
  );
}

function ValenceColumn({
  title,
  description,
  icon,
  accent,
  aspects,
  empty,
  onSelect,
  locale,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  aspects: SynastryAspect[];
  empty: string;
  onSelect: (a: SynastryAspect) => void;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  return (
    <article className="bg-card p-5 sm:p-6">
      <header className="mb-4 flex items-center gap-2.5 border-b border-border pb-3">
        <span
          className="grid size-8 place-items-center rounded-sm border border-border bg-background"
          style={{ color: accent }}
        >
          {icon}
        </span>
        <div>
          <div className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </div>
          <div className="text-[11px] text-muted-foreground">{description}</div>
        </div>
      </header>
      {aspects.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {aspects.slice(0, 4).map((a) => (
            <li key={`${a.a}-${a.b}-${a.kind}`}>
              <button
                type="button"
                onClick={() => onSelect(a)}
                className="flex w-full items-baseline gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none"
              >
                <span style={{ color: accent }} className="text-base">
                  {aspectGlyph(a.kind)}
                </span>
                <span className="font-medium text-foreground">
                  {bodyLabelFor(a.a, en)}
                  <span className="mx-1 text-muted-foreground">·</span>
                  {bodyLabelFor(a.b, en)}
                </span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {aspectLabelFor(a.kind, en)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function OverlaySection({
  overlays,
  partnerName,
  interpretations,
  locale,
}: {
  overlays: SynastryHouseOverlay[];
  partnerName: string;
  interpretations: Record<string, string>;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  return (
    <section>
      <header className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          03 · {en ? "HOUSE OVERLAYS" : "სახლების გადაფარვა"}
        </div>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          {en ? "House overlays" : "სახლების გადაფარვა"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {en
            ? "Where one person’s planets activate areas of the other person’s life"
            : "სად ხვდება ერთის პლანეტები მეორის ცხოვრებაში, და რომელ სფეროს ააქტიურებს"}
        </p>
      </header>
      <ul className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
        {overlays.map((o, i) => {
          const text = interpretations[synastryOverlayKey(o.body, o.house)];
          const mine = o.source === "a";
          return (
            <li
              key={`${o.source}-${o.body}-${o.house}-${i}`}
              className="bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-medium text-foreground">
                <span className="font-mono text-xs uppercase tracking-wider text-primary">
                  {mine
                    ? en
                      ? "Yours"
                      : "შენი"
                    : en
                      ? partnerName
                      : `${partnerName}-ის`}
                </span>
                <span>{bodyLabelFor(o.body, en)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-foreground/90">
                  {mine
                    ? en
                      ? partnerName
                      : `${partnerName}-ის`
                    : en
                      ? "Yours"
                      : "შენი"}{" "}
                  {en
                    ? (HOUSE_LABEL_EN[o.house] ?? `House ${o.house}`)
                    : (HOUSE_LABEL_KA[o.house] ?? `${o.house}-ე სახლი`)}
                </span>
              </div>
              {text && (
                <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                  {text}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function AspectDialog({
  aspect,
  text,
  onClose,
  locale,
}: {
  aspect: SynastryAspect | null;
  text?: string;
  onClose: () => void;
  locale: UserLocale;
}) {
  if (!aspect) {
    return (
      <Dialog open={false} onOpenChange={onClose}>
        <DialogContent className="sr-only" />
      </Dialog>
    );
  }

  const breakdown = aspectBreakdown(aspect, locale);
  const en = locale !== "ka";
  const valence = aspectValence(aspect.kind);
  const accent =
    valence === "harmonious"
      ? "oklch(0.80 0.12 80)"
      : valence === "tense"
        ? "oklch(0.68 0.12 35)"
        : "oklch(0.76 0.06 235)";

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className="grid size-11 shrink-0 place-items-center rounded-sm border border-border bg-background font-mono text-2xl"
              style={{ color: accent }}
            >
              {aspectGlyph(aspect.kind)}
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {breakdown.title}
              </DialogTitle>
              <DialogDescription className="mt-0.5 flex items-center gap-2 font-mono text-xs">
                <span style={{ color: accent }}>
                  {aspectLabelFor(aspect.kind, en)}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span className="tabular-nums text-muted-foreground">
                  {en ? "ORB" : "ორბი"} {aspect.orb.toFixed(2)}°
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {text && (
            <div className="rounded-sm border border-primary/30 bg-primary/5 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                {en
                  ? "What this means for the pair"
                  : "რას ნიშნავს ეს წყვილისთვის"}
              </div>
              <div className="mt-1.5 space-y-2.5">
                {text
                  .split(/\n{2,}|\n/)
                  .filter((p) => p.trim())
                  .map((p, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-foreground/90"
                    >
                      {p.trim()}
                    </p>
                  ))}
              </div>
            </div>
          )}

          <BreakdownBlock
            label={en ? "Aspect meaning" : "ასპექტის არსი"}
            body={breakdown.aspectMeaning}
            accent={accent}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <BreakdownBlock
              label={bodyLabelFor(aspect.a, en)}
              body={breakdown.bodyADescription}
              compact
            />
            <BreakdownBlock
              label={bodyLabelFor(aspect.b, en)}
              body={breakdown.bodyBDescription}
              compact
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <BreakdownBlock
              label={en ? "What works" : "რა მუშაობს"}
              body={breakdown.positive}
              accent="oklch(0.80 0.12 80)"
            />
            <BreakdownBlock
              label={en ? "What needs attention" : "რას მიხედო"}
              body={breakdown.negative}
              accent="oklch(0.68 0.12 35)"
            />
          </div>

          <BreakdownBlock
            label={en ? "How to use this" : "რა გავაკეთოთ ამით"}
            body={breakdown.takeaway}
          />

          <p className="font-mono text-[11px] text-muted-foreground">
            {breakdown.tightnessNote}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BreakdownBlock({
  label,
  body,
  accent,
  compact = false,
}: {
  label: string;
  body: string;
  accent?: string;
  compact?: boolean;
}) {
  if (!body) return null;
  return (
    <div
      className={
        compact
          ? "rounded-sm border border-border bg-background/50 p-3"
          : "rounded-sm border border-border bg-card p-4"
      }
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{ color: accent ?? "var(--muted-foreground)" }}
      >
        {label}
      </div>
      <p
        className={
          compact
            ? "mt-1 text-xs leading-relaxed text-foreground/85"
            : "mt-1.5 text-sm leading-relaxed text-foreground/90"
        }
      >
        {body}
      </p>
    </div>
  );
}

function ElementPairing({
  sunA,
  sunB,
  moonA,
  moonB,
  locale,
}: {
  sunA: ChartElement;
  sunB: ChartElement;
  moonA: ChartElement;
  moonB: ChartElement;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-3 font-mono text-xs text-muted-foreground sm:justify-start">
      <span>
        ☉ {en ? "SUN" : "მზე"}: {en ? ELEMENT_LABEL_EN[sunA] : ELEMENT_LABEL_KA[sunA]} ↔{" "}
        {en ? ELEMENT_LABEL_EN[sunB] : ELEMENT_LABEL_KA[sunB]}
      </span>
      <span>·</span>
      <span>
        ☽ {en ? "MOON" : "მთვარე"}: {en ? ELEMENT_LABEL_EN[moonA] : ELEMENT_LABEL_KA[moonA]} ↔{" "}
        {en ? ELEMENT_LABEL_EN[moonB] : ELEMENT_LABEL_KA[moonB]}
      </span>
    </div>
  );
}

function ScoreBreakdown({
  breakdown,
  locale,
}: {
  breakdown: SynastryResult["breakdown"];
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const total =
    Math.abs(breakdown.aspectPoints) +
      Math.abs(breakdown.housePoints) +
      Math.abs(breakdown.elementPoints) || 1;
  const rows: Array<{
    label: string;
    value: number;
    note: string;
  }> = [
    {
      label: en ? "Chart aspects" : "ცის ასპექტები",
      value: breakdown.aspectPoints,
      note: en
        ? "Planets connected by meaningful angles across the two charts."
        : "ორ რუკაში სწორი კუთხეებით დაკავშირებული პლანეტები.",
    },
    {
      label: en ? "House overlays" : "სახლების გადაფარვა",
      value: breakdown.housePoints,
      note: en
        ? "Where one person’s planets fall in the other person’s houses."
        : "ერთის პლანეტა მეორის რომელ სახლში ხვდება.",
    },
    {
      label: en ? "Element chemistry" : "ელემენტების ქიმია",
      value: breakdown.elementPoints,
      note: en
        ? "The Sun and Moon elements provide a baseline picture of compatibility."
        : "მზის და მთვარის ელემენტები, საბაზისო ენერგეტიკული თავსებადობა.",
    },
  ];
  return (
    <section className="rounded-sm border border-border bg-card p-5 sm:p-6">
      <header className="mb-4 border-b border-border pb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          METHODOLOGY · TELEMETRY WEIGHTS
        </div>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-foreground">
          {en ? "What shapes this score" : "რამ შექმნა ეს რიცხვი"}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {en
            ? "Three independent sources combine to create the overall compatibility score."
            : "სამი დამოუკიდებელი წყარო ერთად ქმნის საერთო თავსებადობის ქულას."}
        </p>
      </header>
      <ul className="space-y-4">
        {rows.map((r) => {
          const pct = Math.round((Math.abs(r.value) / total) * 100);
          return (
            <li key={r.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{r.label}</span>
                <span className="font-mono text-xs tabular-nums text-primary">
                  {r.value > 0 ? "+" : ""}
                  {r.value.toFixed(1)}
                </span>
              </div>
              <div className="relative h-1 overflow-hidden bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {r.note}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function OverallRing({ percent }: { percent: number }) {
  const size = 148;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          INDEX
        </span>
        <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-primary">
          {percent}%
        </span>
      </div>
    </div>
  );
}
