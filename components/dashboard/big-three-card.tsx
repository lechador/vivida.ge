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

  return (
    <div
      id={`planet-${kind}`}
      className="scroll-mt-20 border-t border-border px-4 py-4 first:border-t-0 sm:px-5"
    >
      <div className="flex items-center gap-3 text-sm">
        <span
          aria-hidden
          style={{ color }}
          className="w-6 shrink-0 text-center font-mono text-base leading-none"
        >
          {KIND_GLYPH[kind]}
        </span>
        <span className="w-24 shrink-0 font-semibold text-foreground sm:w-28">
          {en ? KIND_LABEL_EN[kind] : KIND_LABEL[kind]}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-foreground/85">
          <span
            aria-hidden
            style={{ color }}
            className="w-5 shrink-0 text-center leading-none"
          >
            {`${sign.symbol}︎`}
          </span>
          <span className="truncate">{en ? sign.labelEn : sign.labelKa}</span>
        </span>
        <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
          {formatDegree(point.signDegree)}
          {point.house ? ` · ${point.house} ${en ? "house" : "სახ."}` : ""}
        </span>
      </div>
      {interpretation && (
        <p className="mt-2.5 pl-9 text-sm leading-relaxed text-foreground/85">
          {interpretation}
        </p>
      )}
    </div>
  );
}
