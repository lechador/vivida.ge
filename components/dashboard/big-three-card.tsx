import { signByIndex, formatDegree } from "@/lib/zodiac";
import type { PointJson } from "@/db/schema";
import { SignBadge } from "./sign-badge";

const KIND_LABEL: Record<"sun" | "moon" | "ascendant", string> = {
  sun: "მზე",
  moon: "მთვარე",
  ascendant: "ამომავალი",
};

const KIND_GLYPH: Record<"sun" | "moon" | "ascendant", string> = {
  sun: "☉",
  moon: "☽",
  ascendant: "AC",
};

const KIND_GRADIENT: Record<"sun" | "moon" | "ascendant", string> = {
  sun: "from-[var(--vivida-gold)] to-[var(--vivida-pink)]",
  moon: "from-[var(--vivida-cyan)] to-[var(--vivida-violet)]",
  ascendant: "from-[var(--vivida-violet)] to-[var(--vivida-pink)]",
};

export function BigThreeCard({
  kind,
  point,
  interpretation,
}: {
  kind: "sun" | "moon" | "ascendant";
  point: PointJson;
  interpretation?: string;
}) {
  const sign = signByIndex(point.signIndex);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 shadow-[0_30px_80px_-50px_oklch(0.65_0.24_305/0.5)] ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:shadow-[0_30px_80px_-30px_oklch(0.65_0.24_305/0.6)] hover:ring-foreground/15">
      <div
        aria-hidden
        className={`absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br ${KIND_GRADIENT[kind]} opacity-25 blur-2xl transition-opacity group-hover:opacity-40`}
      />

      <header className="relative flex items-start gap-5">
        {/* Hero: zodiac sign glyph — the centerpiece. The Sun/Moon/AC body
            glyph rides as a small corner badge, so identity (sign) reads
            first and role (luminary) reads second. */}
        <div
          className="relative"
          title={`${formatDegree(point.signDegree)} ${sign.labelKa}-ში`}
        >
          <SignBadge sign={sign} size="lg" />
          <span
            className="absolute -bottom-1.5 -right-1.5 grid size-8 place-items-center rounded-full border-2 border-background bg-card text-sm font-medium text-foreground/80 shadow-md"
            aria-hidden
          >
            {KIND_GLYPH[kind]}
          </span>
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="text-sm font-medium text-muted-foreground">
            {KIND_LABEL[kind]}
          </div>
          <h3 className="mt-0.5 text-3xl font-semibold tracking-tight">
            {sign.labelKa}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-foreground/80">
              {sign.element}
            </span>
            <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-foreground/80">
              {sign.modality}
            </span>
          </div>
        </div>
      </header>

      {interpretation && (
        <p className="relative mt-5 text-base leading-relaxed text-foreground/85">
          {interpretation}
        </p>
      )}
    </article>
  );
}
