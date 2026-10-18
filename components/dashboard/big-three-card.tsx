import { signByIndex, formatDegree, signColor } from "@/lib/zodiac";
import type { PointJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const KIND_LABEL: Record<"sun" | "moon" | "ascendant", string> = {
  sun: "მზე",
  moon: "მთვარე",
  ascendant: "ამომავალი",
};
const KIND_LABEL_EN: Record<"sun" | "moon" | "ascendant", string> = {
  sun: "Sun",
  moon: "Moon",
  ascendant: "Ascendant",
};

const KIND_GLYPH: Record<"sun" | "moon" | "ascendant", string> = {
  sun: "☉",
  moon: "☽",
  ascendant: "AC",
};

const KIND_ACCENT: Record<"sun" | "moon" | "ascendant", string> = {
  sun: "var(--vivida-gold)",
  moon: "var(--vivida-cyan)",
  ascendant: "var(--primary)",
};

export function BigThreeCard({
  kind,
  point,
  interpretation,
  locale = "ka",
}: {
  kind: "sun" | "moon" | "ascendant";
  point: PointJson;
  interpretation?: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const sign = signByIndex(point.signIndex);
  const color = signColor(sign);
  const accent = KIND_ACCENT[kind];

  return (
    <div
      id={`planet-${kind}`}
      className="scroll-mt-20 rounded-xl border border-border bg-card px-4 py-4 shadow-sm sm:px-5"
    >
      <div className="flex items-center gap-2.5 border-b border-border/70 pb-3 text-sm">
        <span
          aria-hidden
          style={{ color: accent }}
          className="grid size-7 shrink-0 place-items-center rounded-md border border-border/80 bg-background/70 font-mono text-sm leading-none"
        >
          {KIND_GLYPH[kind]}
        </span>
        <span className="font-semibold text-foreground">
          {en ? KIND_LABEL_EN[kind] : KIND_LABEL[kind]}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="flex min-w-0 items-center gap-1.5 text-foreground/90">
          <span
            aria-hidden
            style={{ color }}
            className="shrink-0 text-center leading-none"
          >
            {`${sign.symbol}︎`}
          </span>
          <span className="truncate font-medium">
            {en ? sign.labelEn : sign.labelKa}
          </span>
        </span>
        <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
          {formatDegree(point.signDegree)}
          {point.house ? ` · ${point.house} ${en ? "H" : "სახ."}` : ""}
        </span>
      </div>
      {interpretation && (
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">
          {interpretation}
        </p>
      )}
    </div>
  );
}
