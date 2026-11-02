"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Check,
  Compass,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { localizedHref } from "@/lib/seo/public-paths";
import {
  TS_QUESTIONS,
  TS_QUESTIONS_EN,
  TS_QUESTIONS_PL,
  TS_QUESTION_COUNT,
  TS_ELEMENT_EN,
  TS_ELEMENT_PL,
  TS_MODALITY_EN,
  TS_MODALITY_PL,
  scoreTrueSign,
  type TsResult,
} from "@/lib/true-sign/quiz";

import { signColor } from "@/lib/zodiac";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * "რომელი ზოდიაქოს ნიშანი ხარ სინამდვილეში?", a free, fully client-side
 * personality quiz. One question per screen, auto-advancing; the result reveals
 * the sign you embody (element × modality), with a share button and a natal-
 * chart cross-sell (your BIRTH sign may differ, go find out for real).
 */
export function TrueSignQuiz({ locale = "ka" }: { locale?: UserLocale }) {
  const pl = locale === "pl";
  const en = locale === "en";
  const questions = pl ? TS_QUESTIONS_PL : en ? TS_QUESTIONS_EN : TS_QUESTIONS;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<TsResult | null>(null);
  const [copied, setCopied] = useState(false);

  const q = questions[index];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / TS_QUESTION_COUNT) * 100);
  const isLast = index === TS_QUESTION_COUNT - 1;

  function choose(optIdx: number) {
    const next = { ...answers, [q.id]: optIdx };
    setAnswers(next);
    if (!isLast) {
      window.setTimeout(
        () => setIndex((i) => Math.min(i + 1, TS_QUESTION_COUNT - 1)),
        200,
      );
    } else {
      window.setTimeout(() => setResult(scoreTrueSign(next)), 220);
    }
  }

  function restart() {
    setAnswers({});
    setIndex(0);
    setResult(null);
  }

  async function share() {
    if (!result) return;
    const url = `${window.location.origin}${localizedHref("/quiz/namdvili-nishani", locale)}`;
    const signName = pl
      ? (result.sign.labelPl ?? result.sign.labelEn)
      : en
        ? result.sign.labelEn
        : result.sign.labelKa;
    const text = pl
      ? `Test Vivida wskazał, że mój charakter najbardziej odpowiada znakowi ${result.sign.emoji} ${signName}! A Ty jakim znakiem jesteś?`
      : en
        ? `Vivida says my personality matches ${result.sign.emoji} ${result.sign.labelEn}! Which sign are you?`
        : `Vivida-ს ტესტმა თქვა, რომ სინამდვილეში ${result.sign.emoji} ${result.sign.labelKa} ვარ! შენ რომელი ხარ?`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: pl
            ? "Jakim znakiem zodiaku naprawdę jesteś? · Vivida"
            : en
              ? "Which zodiac sign matches your personality? · Vivida"
              : "რომელი ნიშანი ხარ სინამდვილეში? · Vivida",
          text,
          url,
        });
        return;
      } catch {
        /* dismissed, fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  // ── Result ─────────────────────────────────────────────────────────────
  if (result) {
    const { sign, element, modality, blurbKa, blurbEn, blurbPl } = result;
    const color = signColor(sign);
    const signLabel = pl
      ? (sign.labelPl ?? sign.labelEn)
      : en
        ? sign.labelEn
        : sign.labelKa;
    const elementLabel = pl
      ? TS_ELEMENT_PL[element]
      : en
        ? TS_ELEMENT_EN[element]
        : element;
    const modalityLabel = pl
      ? TS_MODALITY_PL[modality]
      : en
        ? TS_MODALITY_EN[modality]
        : modality;
    const blurb = pl ? blurbPl : en ? blurbEn : blurbKa;

    return (
      <div className="space-y-5">
        <section
          className="relative overflow-hidden rounded-3xl border p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10"
          style={{
            borderColor: `color-mix(in oklch, ${color} 45%, transparent)`,
            background: `color-mix(in oklch, ${color} 8%, var(--card))`,
          }}
        >
          <div
            aria-hidden
            className="absolute -right-16 -top-16 size-56 rounded-full opacity-30 blur-3xl"
            style={{ background: color }}
          />
          <div className="relative">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {pl
                ? "Dopasowanie zodiaku do Twojej osobowości"
                : en
                  ? "Your personality’s zodiac match"
                  : "შენი ნიშანი ხასიათის მიხედვით"}
            </div>
            <div className="mt-3 text-7xl leading-none sm:text-8xl">
              {sign.emoji}
            </div>
            <h2 className="mt-3 flex items-center justify-center gap-2 text-3xl font-bold tracking-tight sm:text-4xl">
              <span style={{ color }}>{sign.symbol}</span>
              {signLabel}
            </h2>
            <div
              className="mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
              style={{
                color,
                borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
                background: `color-mix(in oklch, ${color} 12%, transparent)`,
              }}
            >
              <Sparkles className="size-3.5" />
              {elementLabel} · {modalityLabel}
            </div>
            <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-foreground/85">
              {blurb}
            </p>
          </div>
        </section>

        {/* Natal-chart cross-sell, your BIRTH sign may differ */}
        <Link
          href={localizedHref("/nataluri-ruka", locale)}
          className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5 ring-1 ring-foreground/5 transition-colors hover:border-[var(--vivida-cyan)]/60 hover:bg-[var(--vivida-cyan)]/14"
        >
          <span className="flex items-center gap-3">
            <Compass className="size-6 shrink-0 text-[var(--vivida-cyan)]" />
            <span className="text-sm">
              <span className="block font-semibold text-foreground">
                {pl
                  ? "Twój znak urodzenia jest inny?"
                  : en
                    ? "Is your birth sign different?"
                    : "დაბადების ნიშანი სხვაა?"}
              </span>
              <span className="block text-muted-foreground">
                {pl
                  ? "Poznaj swój dokładny znak urodzenia i odkryj pełny horoskop urodzeniowy za darmo."
                  : en
                    ? "Find your exact birth sign and explore your natal chart for free."
                    : "გაიგე შენი დაბადების ზუსტი ნიშანი და ნახე სრული ნატალური რუკა, უფასოდ."}
              </span>
            </span>
          </span>
          <span
            aria-hidden
            className="text-[var(--vivida-cyan)] transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="mystic"
            onClick={share}
            className="gap-1.5"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Share2 className="size-4" />
            )}
            {copied
              ? pl
                ? "Skopiowano"
                : en
                  ? "Copied"
                  : "დაკოპირდა"
              : pl
                ? "Udostępnij wynik"
                : en
                  ? "Share result"
                  : "გააზიარე შედეგი"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={restart}
            className="gap-1.5"
          >
            <RotateCcw className="size-4" />
            {pl ? "Od nowa" : en ? "Restart" : "თავიდან"}
          </Button>
          <Button asChild variant="ghost">
            <Link href={localizedHref("/tests", locale)}>
              {pl ? "Więcej testów" : en ? "More tests" : "სხვა ტესტები"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────
  const current = answers[q.id];
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            {pl
              ? `Pytanie ${index + 1} / ${TS_QUESTION_COUNT}`
              : en
                ? `Question ${index + 1} / ${TS_QUESTION_COUNT}`
                : `კითხვა ${index + 1} / ${TS_QUESTION_COUNT}`}
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300"
            style={{ width: `${((index + 1) / TS_QUESTION_COUNT) * 100}%` }}
          />
        </div>
      </div>

      <div key={q.id} className="animate-in fade-in duration-300">
        <h2 className="min-h-[3rem] text-balance text-xl font-semibold leading-snug sm:text-2xl">
          {pl ? (q.textPl ?? q.textEn ?? q.textKa) : en ? q.textEn : q.textKa}
        </h2>
        <div className="mt-6 grid gap-2.5">
          {q.options.map((opt, i) => {
            const selected = current === i;
            const optText = pl
              ? (opt.textPl ?? opt.textEn ?? opt.textKa)
              : en
                ? opt.textEn
                : opt.textKa;
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition hover:border-[var(--vivida-violet)]/60 ${
                  selected
                    ? "border-[var(--vivida-violet)]/70 bg-[var(--vivida-violet)]/12"
                    : "border-border bg-background/35"
                }`}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                    selected
                      ? "border-[var(--vivida-violet)] bg-[var(--vivida-violet)]"
                      : "border-border"
                  }`}
                >
                  {selected && <Check className="size-3 text-white" />}
                </span>
                {optText}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="gap-1"
        >
          <ChevronLeft className="size-4" />
          {pl ? "Wstecz" : en ? "Back" : "წინა"}
        </Button>
      </div>
    </div>
  );
}
