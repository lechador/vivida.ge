"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check, Compass, RotateCcw, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  TS_QUESTIONS,
  TS_QUESTION_COUNT,
  scoreTrueSign,
  type TsResult,
} from "@/lib/true-sign/quiz";
import { signColor } from "@/lib/zodiac";

/**
 * "რომელი ზოდიაქოს ნიშანი ხარ სინამდვილეში?" — a free, fully client-side
 * personality quiz. One question per screen, auto-advancing; the result reveals
 * the sign you embody (element × modality), with a share button and a natal-
 * chart cross-sell (your BIRTH sign may differ — go find out for real).
 */
export function TrueSignQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<TsResult | null>(null);
  const [copied, setCopied] = useState(false);

  const q = TS_QUESTIONS[index];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / TS_QUESTION_COUNT) * 100);
  const isLast = index === TS_QUESTION_COUNT - 1;

  function choose(optIdx: number) {
    const next = { ...answers, [q.id]: optIdx };
    setAnswers(next);
    if (!isLast) {
      window.setTimeout(() => setIndex((i) => Math.min(i + 1, TS_QUESTION_COUNT - 1)), 200);
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
    const url = "https://www.vivida.ge/quiz/namdvili-nishani";
    const text = `Vivida-ს ტესტმა თქვა, რომ სინამდვილეში ${result.sign.emoji} ${result.sign.labelKa} ვარ! შენ რომელი ხარ?`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "რომელი ნიშანი ხარ სინამდვილეში? · Vivida", text, url });
        return;
      } catch {
        /* dismissed — fall through to copy */
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
    const { sign, element, modality, blurbKa } = result;
    const color = signColor(sign);
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
              შენი ნამდვილი ნიშანი
            </div>
            <div className="mt-3 text-7xl leading-none sm:text-8xl">{sign.emoji}</div>
            <h2 className="mt-3 flex items-center justify-center gap-2 text-3xl font-bold tracking-tight sm:text-4xl">
              <span style={{ color }}>{sign.symbol}</span>
              {sign.labelKa}
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
              style={{
                color,
                borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
                background: `color-mix(in oklch, ${color} 12%, transparent)`,
              }}
            >
              <Sparkles className="size-3.5" />
              {element} · {modality}
            </div>
            <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-foreground/85">
              {blurbKa}
            </p>
          </div>
        </section>

        {/* Natal-chart cross-sell — your BIRTH sign may differ */}
        <Link
          href="/nataluri-ruka"
          className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5 ring-1 ring-foreground/5 transition-colors hover:border-[var(--vivida-cyan)]/60 hover:bg-[var(--vivida-cyan)]/14"
        >
          <span className="flex items-center gap-3">
            <Compass className="size-6 shrink-0 text-[var(--vivida-cyan)]" />
            <span className="text-sm">
              <span className="block font-semibold text-foreground">
                დაბადების ნიშანი სხვაა?
              </span>
              <span className="block text-muted-foreground">
                გაიგე შენი ზუსტი ნიშანი და სრული ნატალური რუკა — უფასოდ.
              </span>
            </span>
          </span>
          <span aria-hidden className="text-[var(--vivida-cyan)] transition-transform group-hover:translate-x-0.5">→</span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="mystic" onClick={share} className="gap-1.5">
            {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
            {copied ? "დაკოპირდა" : "გააზიარე შედეგი"}
          </Button>
          <Button type="button" variant="outline" onClick={restart} className="gap-1.5">
            <RotateCcw className="size-4" />
            თავიდან
          </Button>
          <Button asChild variant="ghost">
            <Link href="/tests">სხვა ტესტები</Link>
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
          <span>კითხვა {index + 1} / {TS_QUESTION_COUNT}</span>
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
          {q.textKa}
        </h2>
        <div className="mt-6 grid gap-2.5">
          {q.options.map((opt, i) => {
            const selected = current === i;
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
                {opt.textKa}
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
          წინა
        </Button>
      </div>
    </div>
  );
}
