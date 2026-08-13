"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Figure, FigureBlank } from "@/lib/iq/figures";
import {
  IQ_ANSWERS_STORAGE_KEY,
  IQ_TIME_LIMIT_SEC,
  STEM_PROMPT_EN,
  STEM_PROMPT_KA,
  type IqItem,
} from "@/lib/iq/items";
import {
  IQ_ADAPTIVE_LENGTH,
  firstAdaptiveItem,
  nextAdaptiveItem,
} from "@/lib/iq/adaptive";

/**
 * The timed, *adaptive* IQ test (computerised adaptive testing). One item per
 * screen; after each answer we re-estimate ability (EAP) and serve the item
 * whose difficulty best matches it, so strong takers climb into genuinely hard
 * territory and everyone reaches a precise score in fewer items. Fixed length
 * (IQ_ADAPTIVE_LENGTH); no going back — that would invalidate the adaptive path.
 * A global countdown auto-submits at zero. Answers are stashed in localStorage
 * and scored on /iq-testi/shedegi — no server round-trip needed.
 */
export function IqTestClient({ locale = "ka" }: { locale?: "ka" | "en" }) {
  const router = useRouter();
  const en = locale === "en";

  const [administered, setAdministered] = useState<IqItem[]>(() => [
    firstAdaptiveItem(),
  ]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(IQ_TIME_LIMIT_SEC);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const step = administered.length; // 1-based count of items shown so far
  const q = administered[step - 1];
  const isLast = step >= IQ_ADAPTIVE_LENGTH;
  const answered = answers[q.id] !== undefined;
  const progressPct = Math.round((step / IQ_ADAPTIVE_LENGTH) * 100);

  // Refs so the countdown can finish with the latest state without re-arming.
  const answersRef = useRef(answers);
  const administeredRef = useRef(administered);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    administeredRef.current = administered;
  }, [administered]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  function finish(finalAnswers: Record<string, number>) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    // Every administered item counts; anything unanswered → -1 (incorrect).
    const complete: Record<string, number> = { ...finalAnswers };
    for (const it of administeredRef.current)
      if (!(it.id in complete)) complete[it.id] = -1;
    try {
      localStorage.setItem(
        IQ_ANSWERS_STORAGE_KEY,
        JSON.stringify({
          answers: complete,
          timeUsedSec: IQ_TIME_LIMIT_SEC - timeLeftRef.current,
          attemptId: crypto.randomUUID(),
        })
      );
    } catch {
      /* private mode — result page will bounce back if it can't read */
    }
    trackEvent(ANALYTICS_EVENT.testCompleted, {
      test: "iq",
      items: administeredRef.current.length,
      time_used_sec: IQ_TIME_LIMIT_SEC - timeLeftRef.current,
    });
    router.push("/iq-testi/shedegi");
  }

  // One stable countdown — never re-armed, so answering never resets it.
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          finish(answersRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(optIdx: number) {
    setAnswers((a) => ({ ...a, [q.id]: optIdx }));
  }

  // Forward-only: record this answer (or -1 skip), re-estimate θ, serve the
  // next best-matched item — or finish once the fixed length is reached.
  function advance() {
    const chosen = answers[q.id] ?? -1;
    const nextAnswers = { ...answers, [q.id]: chosen };
    if (step >= IQ_ADAPTIVE_LENGTH) {
      finish(nextAnswers);
      return;
    }
    const correct = administered.map((it) => nextAnswers[it.id] === it.answer);
    const next = nextAdaptiveItem(administered, correct);
    if (!next) {
      finish(nextAnswers);
      return;
    }
    setAnswers(nextAnswers);
    setAdministered((prev) => [...prev, next]);
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const lowTime = timeLeft <= 60;

  if (submitting) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-10 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
          <Sparkles className="size-7 animate-pulse text-[var(--vivida-violet)]" />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          {en ? "Calculating your result…" : "ვთვლი შენს შედეგს…"}
        </h2>
        <Loader2 className="mx-auto mt-6 size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      {/* Progress + timer */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            {en ? "Task" : "დავალება"} {step} / {IQ_ADAPTIVE_LENGTH}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 tabular-nums",
              lowTime && "text-[var(--vivida-pink)]"
            )}
          >
            <Clock className="size-3.5" />
            {mm}:{ss}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stem */}
      <div key={q.id} className="animate-in fade-in duration-300">
        <IqStem item={q} locale={locale} />

        {(en ? STEM_PROMPT_EN : STEM_PROMPT_KA)[q.stem.type] && (
          <p className="mb-4 mt-6 text-center text-sm text-foreground/80">
            {(en ? STEM_PROMPT_EN : STEM_PROMPT_KA)[q.stem.type]}
          </p>
        )}

        {/* Options */}
        <IqOptions
          item={q}
          selected={answers[q.id]}
          onPick={pick}
          locale={locale}
        />
      </div>

      {/* Nav — adaptive: forward only */}
      <div className="mt-8 flex items-center justify-end gap-3">
        {isLast ? (
          <Button type="button" variant="mystic" size="lg" onClick={advance}>
            <Sparkles className="size-4" />
            {en ? "Finish" : "დასრულება"}
          </Button>
        ) : (
          <Button
            type="button"
            variant={answered ? "mystic" : "outline"}
            onClick={advance}
          >
            {answered
              ? en
                ? "Next"
                : "შემდეგი"
              : en
                ? "Skip"
                : "გამოტოვება"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Stem rendering ───────────────────────────────────────────────────────────
function Cell({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid aspect-square place-items-center rounded-xl border",
        muted
          ? "border-dashed border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/5 text-[var(--vivida-violet)]"
          : "border-border bg-background/40"
      )}
    >
      {children}
    </div>
  );
}

function IqStem({ item, locale }: { item: IqItem; locale: "ka" | "en" }) {
  const s = item.stem;

  if (s.type === "logic") {
    return (
      <p className="min-h-[3.5rem] text-balance text-center text-lg font-medium leading-snug sm:text-xl">
        {locale === "en" ? s.textEn : s.textKa}
      </p>
    );
  }

  if (s.type === "number-series") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {s.sequence.map((n, i) => (
          <span
            key={i}
            className="grid h-12 min-w-12 place-items-center rounded-xl border border-border bg-background/40 px-3 text-xl font-semibold tabular-nums sm:h-14 sm:min-w-14 sm:text-2xl"
          >
            {n}
          </span>
        ))}
        <span className="grid h-12 min-w-12 place-items-center rounded-xl border border-dashed border-[var(--vivida-violet)]/60 bg-[var(--vivida-violet)]/5 px-3 text-xl font-bold text-[var(--vivida-violet)] sm:h-14 sm:min-w-14 sm:text-2xl">
          ?
        </span>
      </div>
    );
  }

  if (s.type === "matrix") {
    return (
      <div className="mx-auto grid max-w-[300px] grid-cols-3 gap-2">
        {s.cells.map((cell, i) => (
          <Cell key={i} muted={cell === null}>
            {cell === null ? <FigureBlank size={54} /> : <Figure spec={cell} size={64} />}
          </Cell>
        ))}
      </div>
    );
  }

  if (s.type === "analogy") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <Cell>
          <Figure spec={s.a} size={58} />
        </Cell>
        <span className="text-lg text-muted-foreground">→</span>
        <Cell>
          <Figure spec={s.b} size={58} />
        </Cell>
        <span className="mx-1 text-muted-foreground">::</span>
        <Cell>
          <Figure spec={s.c} size={58} />
        </Cell>
        <span className="text-lg text-muted-foreground">→</span>
        <Cell muted>
          <FigureBlank size={48} />
        </Cell>
      </div>
    );
  }

  // odd-one-out has no separate stem — the options are the figures.
  return null;
}

function IqOptions({
  item,
  selected,
  onPick,
  locale,
}: {
  item: IqItem;
  selected: number | undefined;
  onPick: (i: number) => void;
  locale: "ka" | "en";
}) {
  const isFigure = item.options[0]?.kind === "figure";

  return (
    <div
      className={cn(
        "mt-2 grid gap-2.5 sm:gap-3",
        isFigure ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1"
      )}
    >
      {item.options.map((opt, i) => {
        const active = selected === i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            aria-pressed={active}
            className={cn(
              "group relative rounded-xl border-2 transition-all",
              isFigure
                ? "grid aspect-square place-items-center p-2"
                : "px-4 py-3.5 text-left text-[15px] font-medium",
              active
                ? "border-[var(--vivida-cyan)] bg-[var(--vivida-cyan)]/10 text-foreground shadow-[0_0_20px_-6px_var(--vivida-cyan)]"
                : "border-border bg-background/40 text-foreground/85 hover:border-[var(--vivida-violet)]/50 hover:bg-[var(--vivida-violet)]/5"
            )}
          >
            {opt.kind === "figure" ? (
              <Figure spec={opt.spec} size={68} />
            ) : (
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                    active
                      ? "border-[var(--vivida-cyan)] text-[var(--vivida-cyan)]"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {locale === "en" ? opt.textEn ?? opt.text : opt.text}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
