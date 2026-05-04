"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_DESCRIPTOR_KA,
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  overallVerdict,
  type SynastryAspect,
  type SynastryCategory,
  type SynastryResult,
} from "@/lib/synastry";
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
} from "@/lib/synastry-interpretation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORY_GRADIENT: Record<string, string> = {
  love: "from-[oklch(0.72_0.22_350)] to-[oklch(0.65_0.24_305)]",
  friendship: "from-[oklch(0.85_0.16_85)] to-[oklch(0.75_0.16_60)]",
  communication: "from-[oklch(0.75_0.16_220)] to-[oklch(0.68_0.18_250)]",
  growth: "from-[oklch(0.65_0.13_130)] to-[oklch(0.55_0.15_165)]",
  chemistry: "from-[oklch(0.7_0.22_30)] to-[oklch(0.65_0.22_15)]",
};

const CATEGORY_RING_COLOR: Record<string, string> = {
  love: "oklch(0.72 0.22 350)",
  friendship: "oklch(0.85 0.16 85)",
  communication: "oklch(0.75 0.16 220)",
  growth: "oklch(0.65 0.13 130)",
  chemistry: "oklch(0.7 0.22 30)",
};

export function SynastryDisplay({
  result,
  partnerName,
}: {
  result: SynastryResult;
  partnerName: string;
}) {
  const verdict = overallVerdict(result.overall);
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
              ერთობლივი თავსებადობა
            </div>
            <h2 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {verdict}
              </span>
            </h2>
            <p className="mt-3 max-w-md text-pretty text-base text-foreground/85">
              {narrative}
            </p>
          </div>
        </div>
      </div>

      {/* Per-category cards with narratives */}
      <section>
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">
            ხუთი სფერო
          </h3>
          <span className="text-xs text-muted-foreground">
            როგორ ვითარდება სხვადასხვა ენერგია შენსა და {partnerName}-ს შორის
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
                          {CATEGORY_LABEL_KA[cat]}
                        </h4>
                        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                          {CATEGORY_DESCRIPTOR_KA[cat]}
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
              მთავარი კავშირები
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              ცის წერტილები, რომლებიც ერთმანეთს ყველაზე ახლოს ეხმიანებიან
            </p>
          </header>
          <ul className="grid gap-3 sm:grid-cols-2">
            {result.topAspects.map((a, i) => (
              <AspectRow
                key={`${a.a}-${a.b}-${a.kind}`}
                aspect={a}
                index={i}
                onSelect={() => setActiveAspect(a)}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Strengths × growth */}
      {(strengths.length > 0 || growth.length > 0) && (
        <section className="grid gap-6 sm:grid-cols-2">
          <ValenceColumn
            title="ძლიერი მხარეები"
            description="ჰარმონიული კავშირები — სადაც ენერგია თავისუფლად მიედინება"
            icon={<Sparkles className="size-4" />}
            accent="oklch(0.78 0.18 200)"
            aspects={strengths}
            empty="ცის რუკაში ჰარმონიული ასპექტები ნაკლებია — ეს ნიშნავს, რომ კავშირი მცდელობით აშენდება."
            onSelect={setActiveAspect}
          />
          <ValenceColumn
            title="ზრდის წერტილები"
            description="დაძაბულობა, რომელიც სწორად მიდგომისას სიღრმეს აჩენს"
            icon={<Heart className="size-4" />}
            accent="oklch(0.72 0.22 350)"
            aspects={growth}
            empty="ბოლო ცის რუკას მძაფრი დაძაბულობა არ ახლავს — ბუნებრივად მშვიდი დინამიკა."
            onSelect={setActiveAspect}
          />
        </section>
      )}

      <AspectDialog
        aspect={activeAspect}
        onClose={() => setActiveAspect(null)}
      />
    </div>
  );
}

function AspectRow({
  aspect,
  index,
  onSelect,
}: {
  aspect: SynastryAspect;
  index: number;
  onSelect: () => void;
}) {
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
        aria-label={`${bodyLabel(aspect.a)} ${aspectLabel(aspect.kind)} ${bodyLabel(aspect.b)} — დეტალები`}
      >
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl text-lg"
          style={{
            background: `color-mix(in oklch, ${accent} 18%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
            color: accent,
          }}
          title={aspectLabel(aspect.kind)}
        >
          {aspectGlyph(aspect.kind)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 text-sm font-medium">
            <span>{bodyLabel(aspect.a)}</span>
            <span style={{ color: accent }}>{aspectGlyph(aspect.kind)}</span>
            <span>{bodyLabel(aspect.b)}</span>
            <span className="ml-auto text-[11px] tabular-nums text-muted-foreground/80">
              {aspect.orb.toFixed(1)}°
            </span>
          </div>
          <div className="mt-0.5 text-xs leading-relaxed text-foreground/80">
            {describeAspect(aspect)}
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
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  aspects: SynastryAspect[];
  empty: string;
  onSelect: (a: SynastryAspect) => void;
}) {
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
                  {bodyLabel(a.a)}
                  <span className="mx-1 text-muted-foreground">·</span>
                  {bodyLabel(a.b)}
                </span>
                <span className="ml-auto text-[11px] text-muted-foreground/80">
                  {aspectLabel(a.kind)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function AspectDialog({
  aspect,
  onClose,
}: {
  aspect: SynastryAspect | null;
  onClose: () => void;
}) {
  if (!aspect) {
    return (
      <Dialog open={false} onOpenChange={onClose}>
        <DialogContent className="sr-only" />
      </Dialog>
    );
  }

  const breakdown = aspectBreakdown(aspect);
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
                  {aspectLabel(aspect.kind)}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span className="tabular-nums text-muted-foreground/80">
                  ორბი {aspect.orb.toFixed(2)}°
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <BreakdownBlock
            label="ასპექტის არსი"
            body={breakdown.aspectMeaning}
            accent={accent}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <BreakdownBlock
              label={bodyLabel(aspect.a)}
              body={breakdown.bodyADescription}
              compact
            />
            <BreakdownBlock
              label={bodyLabel(aspect.b)}
              body={breakdown.bodyBDescription}
              compact
            />
          </div>

          <BreakdownBlock
            label="რა დინამიკა იქმნება"
            body={breakdown.dynamic}
            accent={accent}
          />

          <BreakdownBlock
            label="რა გავაკეთოთ ამით"
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
          ? "rounded-xl border border-border/60 bg-card/40 p-3"
          : "rounded-xl border border-border bg-card/55 p-4"
      }
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
