"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronLeft, Focus, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LikertSubmitResult = { ok: true } | { ok: false; error: string };
export type LikertOption = { value: number; labelKa: string; labelEn?: string };
export type LikertItem = { id: number; textKa: string; textEn?: string };

const FOCUS_KEY = "vivida_test_focus"; // shared across the tests

/**
 * A generic one-statement-per-screen Likert questionnaire (agree↔disagree,
 * auto-advancing, focus mode). The parent owns save + navigate via `onSubmit`.
 * Reused by the Big Five test; the mid value of the scale is treated as
 * neutral for the graduated agree(cyan)/disagree(pink) styling.
 */
import type { UserLocale } from "@/lib/i18n/user-locale";

export function LikertQuiz({
  questions,
  scale,
  onSubmit,
  submitLabel = "ნახე შედეგი",
  workingLabel = "ვთვლი შენს პროფილს…",
  locale = "ka",
}: {
  questions: LikertItem[];
  scale: LikertOption[];
  onSubmit: (answers: Record<number, number>) => Promise<LikertSubmitResult>;
  submitLabel?: string;
  workingLabel?: string;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const am = locale === "am";
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();

  const [focus, setFocus] = useState(true);
  useEffect(() => {
    let off = false;
    try {
      off = localStorage.getItem(FOCUS_KEY) === "off";
    } catch {
      /* ignore */
    }
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (off) setFocus(false);
  }, []);
  function toggleFocus() {
    setFocus((on) => {
      const next = !on;
      try {
        localStorage.setItem(FOCUS_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // Agree (high) on the left → disagree (low) on the right; mid = neutral.
  const ordered = useMemo(
    () => [...scale].sort((a, b) => b.value - a.value),
    [scale]
  );
  const mid = useMemo(
    () => (Math.max(...scale.map((s) => s.value)) + Math.min(...scale.map((s) => s.value))) / 2,
    [scale]
  );

  const total = questions.length;
  const q = questions[index];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === total - 1;
  const allAnswered = answeredCount === total;
  const current = answers[q.id];
  const progressPct = Math.round((answeredCount / total) * 100);

  function pick(value: number) {
    setAnswers((a) => ({ ...a, [q.id]: value }));
    setError(null);
    if (!isLast) {
      window.setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 220);
    }
  }

  function submit() {
    if (!allAnswered) {
      const missing = questions.findIndex((qq) => answers[qq.id] === undefined);
      if (missing >= 0) setIndex(missing);
      setError(am ? "Խնդրում ենք պատասխանել բոլոր հարցերին։" : en ? "Please answer every question." : "გთხოვ, უპასუხე ყველა კითხვას.");
      return;
    }
    setError(null);
    startSubmit(async () => {
      const res = await onSubmit(answers);
      if (!res.ok) setError(res.error);
    });
  }

  if (submitting) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-10 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
          <Sparkles className="size-7 animate-pulse text-[var(--vivida-violet)]" />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">{workingLabel}</h2>
        <Loader2 className="mx-auto mt-6 size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {focus && (
        <div
          aria-hidden
          onClick={toggleFocus}
          className="fixed inset-0 z-30 cursor-pointer bg-[oklch(0.05_0.02_290/0.6)] backdrop-blur-[3px] animate-in fade-in duration-500"
        />
      )}

      <div
        className={cn(
          "rounded-3xl border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8",
          focus
            ? "relative z-40 border-[var(--vivida-violet)]/40 vivida-focus-card"
            : "border-border"
        )}
      >
        <button
          type="button"
          onClick={toggleFocus}
          aria-pressed={focus}
          aria-label={focus ? (am ? "Անջատել կենտրոնացման ռեժիմը" : en ? "Exit focus mode" : "ფოკუს-რეჟიმის გამორთვა") : (am ? "Միացնել կենտրոնացման ռեժիմը" : en ? "Enter focus mode" : "ფოკუს-რეჟიმის ჩართვა")}
          title={focus ? (am ? "Անջատել կենտրոնացման ռեժիմը" : en ? "Exit focus mode" : "ფოკუს-რეჟიმის გამორთვა") : (am ? "Կենտրոնացման ռեժիմ" : en ? "Focus mode" : "ფოკუს-რეჟიმი")}
          className={cn(
            "absolute -right-2.5 -top-2.5 grid size-8 place-items-center rounded-full border backdrop-blur-xl transition-all hover:scale-105 sm:-right-3 sm:-top-3",
            focus
              ? "border-[var(--vivida-violet)]/60 bg-[oklch(0.18_0.07_300/0.85)] text-[var(--vivida-cyan)] shadow-[0_0_18px_-4px_oklch(0.65_0.24_305/0.8)]"
              : "border-border bg-card/80 text-muted-foreground"
          )}
        >
          <Focus className="size-4" />
        </button>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              {am ? "Հարց" : en ? "Question" : "კითხვა"} {index + 1} / {total}
            </span>
            <span className="tabular-nums">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div key={q.id} className="animate-in fade-in duration-300">
          <p className="min-h-[3.5rem] text-balance text-lg font-medium leading-snug sm:text-xl">
            {am || en ? q.textEn ?? q.textKa : q.textKa}
          </p>

          <div
            role="radiogroup"
            aria-label={am ? "Ձեր պատասխանը" : en ? "Your answer" : "შენი პასუხი"}
            className="mt-7 flex items-center justify-center gap-2 sm:gap-3"
          >
            {ordered.map((opt) => {
              const selected = current === opt.value;
              const magnitude = Math.abs(opt.value - mid); // 0,1,2
              const sizeCls =
                magnitude >= 2
                  ? "size-12 sm:size-14"
                  : magnitude >= 1
                    ? "size-10 sm:size-11"
                    : "size-8 sm:size-9";
              const tone =
                opt.value > mid
                  ? "var(--vivida-cyan)"
                  : opt.value < mid
                    ? "var(--vivida-pink)"
                    : "var(--muted-foreground)";
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={am || en ? opt.labelEn ?? opt.labelKa : opt.labelKa}
                  title={am || en ? opt.labelEn ?? opt.labelKa : opt.labelKa}
                  onClick={() => pick(opt.value)}
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full border-2 transition-all duration-150 hover:scale-110",
                    sizeCls
                  )}
                  style={{
                    borderColor: `color-mix(in oklch, ${tone} ${selected ? "100%" : "45%"}, transparent)`,
                    backgroundColor: selected
                      ? `color-mix(in oklch, ${tone} 22%, transparent)`
                      : "transparent",
                    boxShadow: selected ? `0 0 18px -4px ${tone}` : undefined,
                  }}
                >
                  {selected && (
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: tone }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span>{am ? "Համաձայն եմ" : en ? "Agree" : "ვეთანხმები"}</span>
            <span>{am ? "Համաձայն չեմ" : en ? "Disagree" : "არ ვეთანხმები"}</span>
          </div>
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="gap-1"
          >
            <ChevronLeft className="size-4" />
            {am ? "Նախորդը" : en ? "Previous" : "წინა"}
          </Button>

          {isLast ? (
            <Button
              type="button"
              variant="mystic"
              size="lg"
              onClick={submit}
              disabled={current === undefined}
            >
              <Sparkles className="size-4" />
              {submitLabel}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              disabled={current === undefined}
            >
              {am ? "Հաջորդը" : en ? "Next" : "შემდეგი"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
