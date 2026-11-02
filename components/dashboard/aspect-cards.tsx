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
const ASPECT_LABEL_PL: Record<string, string> = {
  conjunction: "koniunkcja",
  sextile: "sekstyl",
  square: "kwadratura",
  trine: "trygon",
  opposition: "opozycja",
};

const FAMILY_ORDER = ["harmonic", "tense", "neutral"] as const;
type Family = (typeof FAMILY_ORDER)[number];

const FAMILY_META: Record<
  Family,
  { color: string; labelKa: string; labelEn: string; labelPl: string }
> = {
  harmonic: {
    color: "var(--vivida-cyan)",
    labelKa: "ჰარმონიული",
    labelEn: "Harmonious",
    labelPl: "Harmonijne",
  },
  tense: {
    color: "var(--vivida-pink)",
    labelKa: "დაძაბული",
    labelEn: "Dynamic",
    labelPl: "Dynamiczne",
  },
  neutral: {
    color: "var(--vivida-gold)",
    labelKa: "შერწყმული",
    labelEn: "Concentrated",
    labelPl: "Skoncentrowane",
  },
};

function bodyLabel(key: string, locale: UserLocale): string {
  if (key === "ascendant") {
    return locale === "pl"
      ? "Ascendent"
      : locale === "en"
        ? "Ascendant"
        : "ამომავალი";
  }
  if (key === "midheaven") {
    return locale === "pl"
      ? "Medium Coeli"
      : locale === "en"
        ? "Midheaven"
        : "ზენიტი";
  }
  const meta = bodyMeta(key);
  if (locale === "pl") return meta?.labelPl ?? key;
  if (locale === "en") return meta?.labelEn ?? key;
  return meta?.labelKa ?? key;
}

export function AspectCards({
  chart,
  interpretations,
  locale = "ka",
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
  locale?: UserLocale;
}) {
  const isPl = locale === "pl";
  const en = locale === "en";
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | Family>("all");
  const aspects = chart.aspects ?? [];

  if (aspects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {isPl
          ? "Nie znaleziono głównych aspektów."
          : en
            ? "No major aspects were found."
            : "მნიშვნელოვანი ასპექტები ვერ მოიძებნა."}
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

  const visibleFamilies =
    activeFilter === "all" ? FAMILY_ORDER : ([activeFilter] as const);

  return (
    <div className="space-y-5">
      {/* Segmented control bar (Zero-Pill discipline) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div
          role="tablist"
          aria-label={
            isPl
              ? "Filtruj aspekty według natury"
              : en
                ? "Filter aspects by family"
                : "ასპექტების ფილტრი"
          }
          className="inline-flex divide-x divide-border overflow-hidden rounded-sm border border-border bg-background"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
              activeFilter === "all"
                ? "bg-primary/15 font-medium text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isPl ? "Wszystkie" : en ? "All" : "ყველა"} ({aspects.length})
          </button>
          {FAMILY_ORDER.map((fam) => {
            const count = byFamily[fam].length;
            if (count === 0) return null;
            const meta = FAMILY_META[fam];
            const isSelected = activeFilter === fam;
            return (
              <button
                key={fam}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveFilter(fam)}
                className={cn(
                  "px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
                  isSelected
                    ? "bg-primary/15 font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isPl ? meta.labelPl : en ? meta.labelEn : meta.labelKa} (
                {count})
              </button>
            );
          })}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {isPl
            ? "SORTOWANE WG ORB (0.0° →)"
            : en
              ? "SORTED BY TIGHTEST ORB (0.0° →)"
              : "დალაგებულია უმცირესი ორბით"}
        </span>
      </div>

      {visibleFamilies.map((family) => {
        const items = [...byFamily[family]].sort((a, b) => a.orb - b.orb);
        if (items.length === 0) return null;
        const meta = FAMILY_META[family];

        return (
          <div key={family}>
            <div
              className="mb-2 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em]"
              style={{ color: meta.color }}
            >
              {isPl ? meta.labelPl : en ? meta.labelEn : meta.labelKa}
              <span className="text-muted-foreground">· {items.length}</span>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {items.map((a) => {
                const k = aspectKey(a.a, a.b, a.kind);
                const text = interpretations?.[k];
                const open = openKey === k;
                return (
                  <div key={k}>
                    <button
                      type="button"
                      onClick={() => text && setOpenKey(open ? null : k)}
                      disabled={!text}
                      aria-expanded={open}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors sm:px-5",
                        text && "cursor-pointer hover:bg-secondary/40",
                      )}
                    >
                      <span
                        aria-hidden
                        style={{ color: meta.color }}
                        className="w-5 shrink-0 text-center text-base leading-none"
                      >
                        {ASPECT_SYMBOL[a.kind] ?? "·"}
                      </span>
                      <span className="font-medium text-foreground">
                        {bodyLabel(a.a, locale)}
                      </span>
                      <span className="text-muted-foreground">
                        {(isPl
                          ? ASPECT_LABEL_PL
                          : en
                            ? ASPECT_LABEL_EN
                            : ASPECT_LABEL_KA)[a.kind] ?? a.kind}
                      </span>
                      <span className="font-medium text-foreground">
                        {bodyLabel(a.b, locale)}
                      </span>
                      <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                        {a.orb.toFixed(1)}°
                      </span>
                      {text && (
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-150",
                            open && "rotate-180",
                          )}
                        />
                      )}
                    </button>
                    {open && text && (
                      <div className="border-t border-border bg-secondary/20 px-4 pb-3.5 pt-2.5 text-sm leading-relaxed text-foreground/90 sm:px-5">
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
