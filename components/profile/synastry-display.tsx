"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_DESCRIPTOR_KA,
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  ELEMENT_EMOJI,
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
import { SynastryShareButton } from "./synastry-share-button";
import type { CompatibilityCardProps } from "./compatibility-card";
import type { UserLocale } from "@/lib/i18n/user-locale";

const CATEGORY_GRADIENT: Record<string, string> = {
  love: "from-[oklch(0.72_0.22_350)] to-[oklch(0.65_0.24_305)]",
  friendship: "from-[oklch(0.85_0.16_85)] to-[oklch(0.75_0.16_60)]",
  communication: "from-[oklch(0.75_0.16_220)] to-[oklch(0.68_0.18_250)]",
  growth: "from-[oklch(0.65_0.13_130)] to-[oklch(0.55_0.15_165)]",
  chemistry: "from-[oklch(0.7_0.22_30)] to-[oklch(0.65_0.22_15)]",
  business: "from-[oklch(0.72_0.10_270)] to-[oklch(0.62_0.12_245)]",
};

const CATEGORY_RING_COLOR: Record<string, string> = {
  love: "oklch(0.72 0.22 350)",
  friendship: "oklch(0.85 0.16 85)",
  communication: "oklch(0.75 0.16 220)",
  growth: "oklch(0.65 0.13 130)",
  chemistry: "oklch(0.7 0.22 30)",
  business: "oklch(0.72 0.10 270)",
};

function bodyLabelFor(body: string, en: boolean): string {
  return en ? BODY_LABEL_EN[body] ?? body : bodyLabel(body);
}

function aspectLabelFor(kind: SynastryAspect["kind"], en: boolean): string {
  return en ? ASPECT_LABEL_EN[kind] ?? kind : aspectLabel(kind);
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
  /** When set, renders the share-card button in the hero. */
  shareCardProps?: CompatibilityCardProps;
  /**
   * Pre-generated Georgian texts from synastry_interpretation_library, keyed
   * by synastryAspectKey / synastryOverlayKey. Fetched by the server page;
   * missing keys fall back to the deterministic template texts.
   */
  interpretations?: Record<string, string>;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const verdict = en
    ? overallVerdictEn(result.overall)
    : overallVerdict(result.overall);
  const narrative = overallNarrative(result.overall);
  const { strengths, growth } = splitByValence(result.topAspects);
  const [activeAspect, setActiveAspect] = useState<SynastryAspect | null>(null);

  return (
    <div className="space-y-10">
      {/* Hero ring + overall */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-pink)]/15 p-8 ring-1 ring-foreground/10 backdrop-blur-xl">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 size-72 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-30 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <OverallRing percent={result.overall} />
          <div className="text-center sm:text-left">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
              {en ? "Overall compatibility" : "ერთობლივი თავსებადობა"}
            </div>
            <h2 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {verdict}
              </span>
            </h2>
            <p className="mt-3 max-w-md text-pretty text-base text-foreground/85">
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

      {/* Per-category cards with narratives */}
      <section>
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">
            {en ? "Six areas" : "ექვსი სფერო"}
          </h3>
          <span className="text-xs text-muted-foreground">
            {en
              ? `How different energies develop between you and ${partnerName}`
              : `როგორ ვითარდება სხვადასხვა ენერგია შენსა და ${partnerName}-ს შორის`}
          </span>
        </header>
        <div className="space-y-3">
          {CATEGORIES.map((cat, i) => {
            const score = result.scores[cat];
            return (
              <motion.article
                key={cat}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 px-4 py-3.5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15 sm:px-5"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{
                    background: `radial-gradient(circle, ${CATEGORY_RING_COLOR[cat]} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative flex items-center gap-4">
                  <div
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-xl"
                    style={{
                      background: `color-mix(in oklch, ${CATEGORY_RING_COLOR[cat]} 14%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${CATEGORY_RING_COLOR[cat]} 30%, transparent)`,
                    }}
                  >
                    {CATEGORY_EMOJI[cat]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex min-w-0 items-baseline gap-2">
                        <h4 className="text-sm font-semibold tracking-tight sm:text-base">
                          {en ? CATEGORY_LABEL_EN[cat] : CATEGORY_LABEL_KA[cat]}
                        </h4>
                        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                          {en
                            ? CATEGORY_DESCRIPTOR_EN[cat]
                            : CATEGORY_DESCRIPTOR_KA[cat]}
                        </span>
                      </div>
                      <span
                        className="text-base font-semibold tabular-nums sm:text-lg"
                        style={{ color: CATEGORY_RING_COLOR[cat] }}
                      >
                        {score}%
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/80 sm:line-clamp-1 sm:text-[13px]">
                      {narrateCategory(cat as SynastryCategory, score)}
                    </p>
                    <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-card/60">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_GRADIENT[cat]}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score}%` }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          delay: 0.15 + i * 0.06,
                          duration: 0.8,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* Top cross-aspects */}
      {result.topAspects.length > 0 && (
        <section>
          <header className="mb-4">
            <h3 className="text-xl font-semibold tracking-tight">
              {en ? "Key connections" : "მთავარი კავშირები"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {en
                ? "The closest links between the two natal charts"
                : "ცის წერტილები, რომლებიც ერთმანეთს ყველაზე ახლოს ეხმიანებიან"}
            </p>
          </header>
          <ul className="grid gap-3 sm:grid-cols-2">
            {result.topAspects.map((a, i) => (
              <AspectRow
                key={`${a.a}-${a.b}-${a.kind}`}
                aspect={a}
                index={i}
                text={interpretations[synastryAspectKey(a.a, a.b, a.kind)]}
                onSelect={() => setActiveAspect(a)}
                locale={locale}
              />
            ))}
          </ul>
        </section>
      )}

      {/* House overlays — where each one's planets land in the other's life */}
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
        <section className="grid gap-6 sm:grid-cols-2">
          <ValenceColumn
            title={en ? "Strengths" : "ძლიერი მხარეები"}
            description={
              en
                ? "Harmonious links where energy flows more freely"
                : "ჰარმონიული კავშირები — სადაც ენერგია თავისუფლად მიედინება"
            }
            icon={<Sparkles className="size-4" />}
            accent="oklch(0.78 0.18 200)"
            aspects={strengths}
            empty={
              en
                ? "There are fewer harmonious aspects, so this connection grows through conscious effort."
                : "ცის რუკაში ჰარმონიული ასპექტები ნაკლებია — ეს ნიშნავს, რომ კავშირი მცდელობით აშენდება."
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
            accent="oklch(0.72 0.22 350)"
            aspects={growth}
            empty={
              en
                ? "No major tense aspects stand out, suggesting a naturally calmer dynamic."
                : "ბოლო ცის რუკას მძაფრი დაძაბულობა არ ახლავს — ბუნებრივად მშვიდი დინამიკა."
            }
            onSelect={setActiveAspect}
            locale={locale}
          />
        </section>
      )}

      {/* The meta "how the number is built" — closes the story */}
      <ScoreBreakdown breakdown={result.breakdown} locale={locale} />

      <AspectDialog
        aspect={activeAspect}
        text={
          activeAspect
            ? interpretations[
                synastryAspectKey(activeAspect.a, activeAspect.b, activeAspect.kind)
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
  index,
  text,
  onSelect,
  locale,
}: {
  aspect: SynastryAspect;
  index: number;
  /** Library interpretation — shown (clamped) instead of the template line. */
  text?: string;
  onSelect: () => void;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const valence = aspectValence(aspect.kind);
  const accent =
    valence === "harmonious"
      ? "oklch(0.78 0.18 200)"
      : valence === "tense"
        ? "oklch(0.72 0.22 350)"
        : "oklch(0.78 0.18 305)";
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="group flex w-full items-start gap-3 rounded-2xl border border-border bg-card/55 p-4 text-left ring-1 ring-foreground/5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-card/75 hover:ring-foreground/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`${bodyLabelFor(aspect.a, en)} ${aspectLabelFor(aspect.kind, en)} ${bodyLabelFor(aspect.b, en)} — ${en ? "details" : "დეტალები"}`}
      >
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl text-lg"
          style={{
            background: `color-mix(in oklch, ${accent} 18%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
            color: accent,
          }}
          title={aspectLabelFor(aspect.kind, en)}
        >
          {aspectGlyph(aspect.kind)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 text-sm font-medium">
            <span>{bodyLabelFor(aspect.a, en)}</span>
            <span style={{ color: accent }}>{aspectGlyph(aspect.kind)}</span>
            <span>{bodyLabelFor(aspect.b, en)}</span>
            <span className="ml-auto text-[11px] tabular-nums text-muted-foreground/80">
              {aspect.orb.toFixed(1)}°
            </span>
          </div>
          <div
            className={
              text
                ? "mt-0.5 line-clamp-2 text-xs leading-relaxed text-foreground/80"
                : "mt-0.5 text-xs leading-relaxed text-foreground/80"
            }
          >
            {text ?? describeAspect(aspect)}
          </div>
          <div
            className="mt-1.5 text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: accent }}
          >
            {en ? "View details →" : "სრულად ნახვა →"}
          </div>
        </div>
      </button>
    </motion.li>
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
  const en = locale === "en";
  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl"
      style={{
        boxShadow: `0 0 32px -16px ${accent}`,
      }}
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 size-32 rounded-full opacity-25 blur-2xl"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
        }}
      />
      <header className="relative mb-4 flex items-center gap-2">
        <span
          className="grid size-8 place-items-center rounded-full"
          style={{
            background: `color-mix(in oklch, ${accent} 22%, transparent)`,
            color: accent,
          }}
        >
          {icon}
        </span>
        <div>
          <div className="text-base font-semibold tracking-tight">{title}</div>
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
                className="flex w-full items-baseline gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-card/60 focus-visible:bg-card/60 focus-visible:outline-none"
              >
                <span style={{ color: accent }} className="text-base">
                  {aspectGlyph(a.kind)}
                </span>
                <span className="font-medium">
                  {bodyLabelFor(a.a, en)}
                  <span className="mx-1 text-muted-foreground">·</span>
                  {bodyLabelFor(a.b, en)}
                </span>
                <span className="ml-auto text-[11px] text-muted-foreground/80">
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

/**
 * "Whose planet lands in whose house" — the house-overlay layer, previously a
 * bare list inside the score breakdown, now a first-class section with the
 * pre-generated interpretation under each overlay.
 */
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
  const en = locale === "en";
  return (
    <section>
      <header className="mb-4">
        <h3 className="text-xl font-semibold tracking-tight">
          {en ? "House overlays" : "სახლების გადაფარვა"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {en
            ? "Where one person’s planets activate areas of the other person’s life"
            : "სად ხვდება ერთის პლანეტები მეორის ცხოვრებაში — და რომელ სფეროს ააქტიურებს"}
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {overlays.map((o, i) => {
          const text = interpretations[synastryOverlayKey(o.body, o.house)];
          const mine = o.source === "a";
          const accent = mine
            ? "oklch(0.78 0.18 305)"
            : "oklch(0.78 0.18 200)";
          return (
            <motion.li
              key={`${o.source}-${o.body}-${o.house}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: i * 0.05,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-md"
            >
              <div
                aria-hidden
                className="absolute -right-8 -top-8 size-20 rounded-full opacity-20 blur-2xl"
                style={{
                  background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                }}
              />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-medium">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: `color-mix(in oklch, ${accent} 16%, transparent)`,
                      color: accent,
                    }}
                  >
                    {mine ? (en ? "Yours" : "შენი") : en ? partnerName : `${partnerName}-ის`}
                  </span>
                  <span>{bodyLabelFor(o.body, en)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground/90">
                    {mine ? (en ? partnerName : `${partnerName}-ის`) : en ? "Yours" : "შენი"}{" "}
                    {en
                      ? HOUSE_LABEL_EN[o.house] ?? `House ${o.house}`
                      : HOUSE_LABEL_KA[o.house] ?? `${o.house}-ე სახლი`}
                  </span>
                </div>
                {text && (
                  <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                    {text}
                  </p>
                )}
              </div>
            </motion.li>
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
  /** Library interpretation — the dialog's lead text when present. */
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

  const breakdown = aspectBreakdown(aspect);
  const en = locale === "en";
  const valence = aspectValence(aspect.kind);
  const accent =
    valence === "harmonious"
      ? "oklch(0.78 0.18 200)"
      : valence === "tense"
        ? "oklch(0.72 0.22 350)"
        : "oklch(0.78 0.18 305)";

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 40%, transparent), 0 0 24px -8px ${accent}`,
                color: accent,
              }}
            >
              {aspectGlyph(aspect.kind)}
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {breakdown.title}
              </DialogTitle>
              <DialogDescription className="mt-0.5 flex items-center gap-2 text-xs">
                <span style={{ color: accent }}>
                  {aspectLabelFor(aspect.kind, en)}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span className="tabular-nums text-muted-foreground/80">
                  {en ? "Orb" : "ორბი"} {aspect.orb.toFixed(2)}°
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Pre-generated library interpretation — the lead when present */}
          {text && (
            <div
              className="rounded-xl border p-4"
              style={{
                background: `color-mix(in oklch, ${accent} 7%, transparent)`,
                borderColor: `color-mix(in oklch, ${accent} 30%, transparent)`,
              }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                {en ? "What this means for the pair" : "რას ნიშნავს ეს წყვილისთვის"}
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
              accent="oklch(0.78 0.16 200)"
              tone="positive"
            />
            <BreakdownBlock
              label={en ? "What needs attention" : "რას მიხედო"}
              body={breakdown.negative}
              accent="oklch(0.7 0.22 25)"
              tone="negative"
            />
          </div>

          <BreakdownBlock
            label={en ? "How to use this" : "რა გავაკეთოთ ამით"}
            body={breakdown.takeaway}
          />

          <p className="text-[11px] italic text-muted-foreground/80">
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
  tone,
}: {
  label: string;
  body: string;
  accent?: string;
  compact?: boolean;
  tone?: "positive" | "negative";
}) {
  if (!body) return null;
  const tinted = tone && accent
    ? {
        background: `color-mix(in oklch, ${accent} 8%, transparent)`,
        borderColor: `color-mix(in oklch, ${accent} 32%, transparent)`,
      }
    : undefined;
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-border/60 bg-card/40 p-3"
          : "rounded-xl border border-border bg-card/55 p-4"
      }
      style={tinted}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
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
  const en = locale === "en";
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      <ElementChip a={sunA} b={sunB} label={en ? "Sun" : "მზე"} locale={locale} />
      <ElementChip a={moonA} b={moonB} label={en ? "Moon" : "მთვარე"} locale={locale} />
    </div>
  );
}

function ElementChip({
  a,
  b,
  label,
  locale,
}: {
  a: ChartElement;
  b: ChartElement;
  label: string;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const same = a === b;
  const compatible =
    (a === "fire" && b === "air") ||
    (a === "air" && b === "fire") ||
    (a === "earth" && b === "water") ||
    (a === "water" && b === "earth");
  const tone = same
    ? "border-[var(--vivida-violet)]/45 bg-[var(--vivida-violet)]/10"
    : compatible
      ? "border-[var(--vivida-cyan)]/45 bg-[var(--vivida-cyan)]/10"
      : "border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/10";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${tone}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span>
        {ELEMENT_EMOJI[a]} {en ? ELEMENT_LABEL_EN[a] : ELEMENT_LABEL_KA[a]}
      </span>
      <span className="text-muted-foreground/70">↔</span>
      <span>
        {ELEMENT_EMOJI[b]} {en ? ELEMENT_LABEL_EN[b] : ELEMENT_LABEL_KA[b]}
      </span>
    </span>
  );
}

function ScoreBreakdown({
  breakdown,
  locale,
}: {
  breakdown: SynastryResult["breakdown"];
  locale: UserLocale;
}) {
  const en = locale === "en";
  const total =
    Math.abs(breakdown.aspectPoints) +
    Math.abs(breakdown.housePoints) +
    Math.abs(breakdown.elementPoints) || 1;
  const rows: Array<{
    label: string;
    value: number;
    accent: string;
    note: string;
  }> = [
    {
      label: en ? "Chart aspects" : "ცის ასპექტები",
      value: breakdown.aspectPoints,
      accent: "oklch(0.78 0.18 305)",
      note: en
        ? "Planets connected by meaningful angles across the two charts—the tighter the aspect, the stronger it tends to feel."
        : "ორ რუკაში სწორი კუთხეებით დაკავშირებული პლანეტები — რაც უფრო ზუსტია, მით ძლიერი.",
    },
    {
      label: en ? "House overlays" : "სახლების გადაფარვა",
      value: breakdown.housePoints,
      accent: "oklch(0.78 0.18 200)",
      note: en
        ? "Where one person’s planets fall in the other person’s houses and activate an area of life."
        : "ერთის პლანეტა მეორის რომელ სახლში ხვდება — სად ააქტიურებს ცხოვრების სფეროს.",
    },
    {
      label: en ? "Element chemistry" : "ელემენტების ქიმია",
      value: breakdown.elementPoints,
      accent: "oklch(0.85 0.16 85)",
      note: en
        ? "The Sun and Moon elements provide a baseline picture of energetic compatibility."
        : "მზის და მთვარის ელემენტები — საბაზისო ენერგეტიკული თავსებადობა.",
    },
  ];
  return (
    <section className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-4">
        <h3 className="text-base font-semibold tracking-tight">
          {en ? "What shapes this score" : "რამ შექმნა ეს რიცხვი"}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {en
            ? "Three independent sources combine to create the overall compatibility score."
            : "სამი დამოუკიდებელი წყარო ერთად ქმნის საერთო თავსებადობის ქულას."}
        </p>
      </header>
      <ul className="space-y-3">
        {rows.map((r) => {
          const pct = Math.round((Math.abs(r.value) / total) * 100);
          return (
            <li key={r.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium" style={{ color: r.accent }}>
                  {r.label}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {r.value > 0 ? "+" : ""}
                  {r.value.toFixed(1)}
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: r.accent }}
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

/** Animated SVG donut showing the overall percentage. */
function OverallRing({ percent }: { percent: number }) {
  const size = 156;
  const strokeWidth = 12;
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
        <defs>
          <linearGradient id="overall-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.72 0.22 350)" />
            <stop offset="50%" stopColor="oklch(0.65 0.24 305)" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 200)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="oklch(0.27 0.04 280 / 0.6)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#overall-grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums tracking-tight">
          {percent}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}
