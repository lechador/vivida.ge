"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { animalForYear } from "@/lib/seo/chinese-zodiac";

import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * "ზოდიაქოს ნიშანი წლების მიხედვით", type a birth year, get the Chinese
 * animal. Pure client, no API (the mapping is deterministic).
 */
export function ChineseYearFinder({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale === "en";
  const [year, setYear] = useState("");
  const [result, setResult] = useState<ReturnType<typeof animalForYear> | null>(
    null,
  );

  function find() {
    const y = Number(year);
    if (!Number.isInteger(y) || y < 1900 || y > 2100) {
      setResult(null);
      return;
    }
    setResult(animalForYear(y));
  }

  const linkHref = `/chinuri-horoskopi/${result?.slug}`;

  const animalName = en ? result?.nameEn : result?.nameKa;

  const animalMeta = en
    ? `${result?.elementEn} · ${result?.polarityEn}`
    : `${result?.element} · ${result?.polarity}`;

  return (
    <div className="rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          find();
        }}
        className="space-y-3"
      >
        <Label htmlFor="cz-year">{en ? "Birth year" : "დაბადების წელი"}</Label>
        <div className="flex gap-3">
          <Input
            id="cz-year"
            inputMode="numeric"
            placeholder={en ? "e.g. 1995" : "მაგ. 1995"}
            value={year}
            onChange={(e) =>
              setYear(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="text-base tabular-nums"
          />
          <Button type="submit" variant="mystic" size="lg" className="shrink-0">
            {en ? "Find" : "გაიგე"}
          </Button>
        </div>
      </form>

      {result && (
        <Link
          href={linkHref}
          className="mt-4 flex items-center gap-4 rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-4 transition-colors hover:bg-[var(--vivida-violet)]/14"
        >
          <span className="text-4xl" aria-hidden>
            {result.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">
              {en ? "Your Chinese zodiac sign is" : "შენი ჩინური ნიშანია"}
            </div>
            <div className="text-xl font-semibold tracking-tight">
              {animalName}
            </div>
            <div className="text-xs text-muted-foreground">{animalMeta}</div>
          </div>
          <span aria-hidden className="text-muted-foreground">
            →
          </span>
        </Link>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {en
          ? "If you were born in January or early February, you may belong to the previous animal year because Chinese New Year changes date each year."
          : "თუ იანვარში ან თებერვლის დასაწყისში დაიბადე, შესაძლოა წინა წლის ცხოველი იყოს, ჩინური ახალი წელი იცვლება იანვრის ბოლოს/თებერვალში."}
      </p>
    </div>
  );
}
