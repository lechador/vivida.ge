"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { aspectKey } from "@/lib/aspects";
import { bodyMeta } from "@/lib/zodiac";
import type { NatalChartJson, NatalAspectJson } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

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
const ASPECT_LABEL_EN: Record<string, string> = {
  conjunction: "conjunction",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposition",
};

const FAMILY_ORDER = ["harmonic", "tense", "neutral"] as const;
type Family = (typeof FAMILY_ORDER)[number];

const FAMILY_META: Record<Family, { color: string; labelKa: string; labelEn: string }> = {
  harmonic: { color: "oklch(0.78 0.18 200)", labelKa: "ჰარმონიული", labelEn: "Harmonious" },
  tense: { color: "oklch(0.72 0.22 350)", labelKa: "დაძაბული", labelEn: "Dynamic" },
  neutral: { color: "oklch(0.85 0.16 85)", labelKa: "შერწყმული", labelEn: "Concentrated" },
};

function bodyLabel(key: string, locale: UserLocale): string {
  if (key === "ascendant") return locale !== "ka" ? "Ascendant" : "ამომავალი";
  if (key === "midheaven") return locale !== "ka" ? "Midheaven" : "ზენიტი";
  const meta = bodyMeta(key);
  return locale !== "ka" ? meta?.labelEn ?? key : meta?.labelKa ?? key;
}

/**
 * Flat aspects list, grouped by family (harmonic / tense / neutral), tightest
 * orb first. One scannable row per aspect — glyph · A · kind · B · orb — with
 * the interpretation expanding inline. Replaces the old big aspect cards.
 */
export function AspectCards({
  chart,
  interpretations,
  locale = "ka",
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const [openKey, setOpenKey] = useState<string | null>(null);
  const aspects = chart.aspects ?? [];

  if (aspects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {en ? "No major aspects were found." : "მნიშვნელოვანი ასპექტები ვერ მოიძებნა."}
      </p>
    );
  }

  const byFamily: Record<Family, NatalAspectJson[]> = {
    harmonic: [],
    tense: [],
    neutral: [],
  };
  for (const a of aspects) {
    const fam: Family = a.family in byFamily ? (a.family as Family) : "neutral";
    byFamily[fam].push(a);
  }

  return (
    <div className="space-y-6">
      {FAMILY_ORDER.map((family) => {
        const items = [...byFamily[family]].sort((a, b) => a.orb - b.orb);
        if (items.length === 0) return null;
        const meta = FAMILY_META[family];

        return (
          <div key={family}>
            <div
              className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider"
              style={{ color: meta.color }}
            >
              {en ? meta.labelEn : meta.labelKa}
              <span className="text-muted-foreground">· {items.length}</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl">
              {items.map((a) => {
                const k = aspectKey(a.a, a.b, a.kind);
                const text = interpretations?.[k];
                const open = openKey === k;
                return (
                  <div
                    key={k}
                    className="border-t border-border/50 first:border-t-0"
                  >
                    <button
                      type="button"
                      onClick={() => text && setOpenKey(open ? null : k)}
                      disabled={!text}
                      aria-expanded={open}
                      className={cn(
                        "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors sm:px-5",
                        text && "cursor-pointer hover:bg-card/70"
                      )}
                    >
                      <span
                        aria-hidden
                        style={{ color: meta.color }}
                        className="w-5 shrink-0 text-center text-base leading-none"
                      >
                        {ASPECT_SYMBOL[a.kind] ?? "·"}
                      </span>
                      <span className="font-medium">{bodyLabel(a.a, locale)}</span>
                      <span className="text-muted-foreground">
                        {(en ? ASPECT_LABEL_EN : ASPECT_LABEL_KA)[a.kind] ?? a.kind}
                      </span>
                      <span className="font-medium">{bodyLabel(a.b, locale)}</span>
                      <span className="ml-auto shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                        {a.orb.toFixed(1)}°
                      </span>
                      {text && (
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                            open && "rotate-180"
                          )}
                        />
                      )}
                    </button>
                    {open && text && (
                      <div className="border-t border-border/40 px-4 pb-3 pt-2 text-sm leading-relaxed text-foreground/90 sm:px-5">
                        {text}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
