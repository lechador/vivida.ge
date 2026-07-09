"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MBTI_QUESTIONS, MBTI_LIKERT } from "@/lib/mbti-questions";

export type MbtiSubmitResult = { ok: true } | { ok: false; error: string };

/**
 * The Astro-MBTI quiz — one Georgian statement per screen, answered on a
 * 5-point agree↔disagree scale (16Personalities-style), auto-advancing so it
 * feels quick. On the final answer it hands the answers to `onSubmit`, which
 * owns what happens next (save + navigate). The quiz shows a "working" state
 * while that runs, and surfaces an error if it comes back not-ok.
 */
export function MbtiQuiz({
  onSubmit,
  submitLabel = "დასრულება",
  workingLabel = "ვამუშავებ…",
}: {
  onSubmit: (answers: Record<number, number>) => Promise<MbtiSubmitResult>;
  submitLabel?: string;
  workingLabel?: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();

  const total = MBTI_QUESTIONS.length;
  const q = MBTI_QUESTIONS[index];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === total - 1;
  const allAnswered = answeredCount === total;
  const current = answers[q.id];

  const progressPct = Math.round((answeredCount / total) * 100);

  function pick(value: number) {
    setAnswers((a) => ({ ...a, [q.id]: value }));
    setError(null);
    if (!isLast) {
      // brief pause so the selection registers visually before advancing
      window.setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 240);
    }
  }

  function submit() {
    if (!allAnswered) {
      // jump to the first unanswered question
      const missing = MBTI_QUESTIONS.findIndex((qq) => answers[qq.id] === undefined);
      if (missing >= 0) setIndex(missing);
      setError("გთხოვ, უპასუხე ყველა კითხვას.");
      return;
    }
    setError(null);
    startSubmit(async () => {
      const res = await onSubmit(answers);
      // On ok the caller has navigated away; only surface failures.
      if (!res.ok) setError(res.error);
    });
  }

  // ── Working state (while onSubmit runs) ──────────────────────────────────
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

  // ── Quiz ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            კითხვა {index + 1} / {total}
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

      {/* Question */}
      <div key={q.id} className="animate-in fade-in duration-300">
        <p className="min-h-[3.5rem] text-balance text-lg font-medium leading-snug sm:text-xl">
          {q.textKa}
        </p>

        {/* Likert scale — graduated agree (cyan) ↔ disagree (pink) */}
        <div
          role="radiogroup"
          aria-label="შენი პასუხი"
          className="mt-7 flex items-center justify-center gap-3 sm:gap-4"
        >
          {MBTI_LIKERT.map((opt) => {
            const selected = current === opt.value;
            const magnitude = Math.abs(opt.value); // 0,1,2
            const size =
              magnitude === 2 ? "size-14" : magnitude === 1 ? "size-11" : "size-9";
            const tone =
              opt.value > 0
                ? "var(--vivida-cyan)"
                : opt.value < 0
                  ? "var(--vivida-pink)"
                  : "var(--muted-foreground)";
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={opt.labelKa}
                title={opt.labelKa}
                onClick={() => pick(opt.value)}
                className={cn(
                  "grid shrink-0 place-items-center rounded-full border-2 transition-all duration-150 hover:scale-110",
                  size
                )}
                style={{
                  borderColor: `color-mix(in oklch, ${tone} ${selected ? "100%" : "45%"}, transparent)`,
                  backgroundColor: selected
                    ? `color-mix(in oklch, ${tone} 22%, transparent)`
                    : "transparent",
                  boxShadow: selected
                    ? `0 0 18px -4px ${tone}`
                    : undefined,
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
          <span>ვეთანხმები</span>
          <span>არ ვეთანხმები</span>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
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
            შემდეგი
          </Button>
        )}
      </div>
    </div>
  );
}
