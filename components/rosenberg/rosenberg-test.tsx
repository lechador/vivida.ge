"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Heart,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import {
  ROSENBERG_OPTIONS,
  ROSENBERG_QUESTIONS,
} from "@/lib/rosenberg/questions";
import {
  calculateRosenberg,
  type RosenbergResult,
} from "@/lib/rosenberg/scoring";
import { cn } from "@/lib/utils";

export function RosenbergTest() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<RosenbergResult | null>(null);

  const question = ROSENBERG_QUESTIONS[index];
  const current = answers[question.id];
  const isLast = index === ROSENBERG_QUESTIONS.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(
    (answeredCount / ROSENBERG_QUESTIONS.length) * 100,
  );

  const scoreColor = useMemo(() => {
    if (!result) return "var(--vivida-violet)";
    if (result.band === "lower") return "var(--vivida-pink)";
    if (result.band === "higher") return "var(--vivida-cyan)";
    return "var(--vivida-violet)";
  }, [result]);

  function choose(value: number) {
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
    if (!isLast) {
      window.setTimeout(
        () =>
          setIndex((currentIndex) =>
            Math.min(currentIndex + 1, ROSENBERG_QUESTIONS.length - 1),
          ),
        180,
      );
    }
  }

  function showResult() {
    const complete = ROSENBERG_QUESTIONS.every(
      (item) => answers[item.id] !== undefined,
    );
    if (!complete) {
      const missing = ROSENBERG_QUESTIONS.findIndex(
        (item) => answers[item.id] === undefined,
      );
      setIndex(Math.max(0, missing));
      return;
    }
    setResult(calculateRosenberg(answers));
    trackEvent(ANALYTICS_EVENT.testCompleted, {
      test: "rosenberg_self_esteem",
      items: ROSENBERG_QUESTIONS.length,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retake() {
    setAnswers({});
    setIndex(0);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    const arc =
      "conic-gradient(" +
      scoreColor +
      " " +
      result.percentage * 3.6 +
      "deg, color-mix(in oklch, var(--border) 75%, transparent) 0deg)";

    return (
      <div className="space-y-5">
        <section className="overflow-hidden rounded-3xl border border-border bg-card/60 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div
              className="grid size-36 shrink-0 place-items-center rounded-full p-2"
              style={{ background: arc }}
            >
              <div className="grid size-full place-items-center rounded-full bg-card text-center">
                <div>
                  <div className="text-4xl font-bold tabular-nums">
                    {result.score}
                  </div>
                  <div className="text-xs text-muted-foreground">30-დან</div>
                </div>
              </div>
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                შენი შედეგი
              </div>
              <h2 className="mt-1 text-balance text-2xl font-semibold tracking-tight">
                {result.labelKa}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
                {result.summaryKa}
              </p>
            </div>
          </div>
        </section>

        {result.strengths.length > 0 && (
          <ResultSection
            icon={<Check className="size-4" />}
            eyebrow="რაც შენს პასუხებში საყრდენად ჩანს"
            items={result.strengths.map((item) => ({
              title: item.themeKa,
              text: item.strengthKa,
            }))}
            accent="var(--vivida-cyan)"
          />
        )}

        {result.reflections.length > 0 && (
          <ResultSection
            icon={<Heart className="size-4" />}
            eyebrow="სად შეიძლება მეტი ყურადღება გამოგადგეს"
            items={result.reflections.map((item) => ({
              title: item.themeKa,
              text: item.reflectionKa,
            }))}
            accent="var(--vivida-pink)"
          />
        )}

        <section className="rounded-3xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-[var(--vivida-violet)]" />
            ერთი პრაქტიკული ნაბიჯი
          </div>
          <ul className="mt-4 space-y-3">
            {result.nextStepsKa.map((step) => (
              <li
                key={step}
                className="flex gap-3 text-sm leading-relaxed text-foreground/85"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--vivida-violet)]" />
                {step}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={retake}
            className="gap-1.5"
          >
            <RotateCcw className="size-4" />
            თავიდან გავლა
          </Button>
          <Button asChild variant="ghost">
            <Link href="/tests">
              სხვა ტესტები <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <p className="mx-auto max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
          0–14, 15–25 და 26–30 დიაპაზონები მხოლოდ შედეგის გასაგებად
          წარმოდგენილი საორიენტაციო აღწერებია და არა კლინიკური ზღვარი. ეს ტესტი
          არ ადგენს დიაგნოზს და შენი პიროვნების ღირებულებას არ განსაზღვრავს.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="mb-7">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            კითხვა {index + 1} / {ROSENBERG_QUESTIONS.length}
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300"
            style={{ width: progress + "%" }}
          />
        </div>
      </div>

      <div key={question.id} className="animate-in fade-in duration-300">
        <p className="text-balance text-xl font-medium leading-snug sm:min-h-16 sm:text-2xl">
          {question.textKa}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          მონიშნე პასუხი, რომელიც ყველაზე ახლოსაა შენს ჩვეულ განცდასთან.
        </p>

        <div
          role="radiogroup"
          aria-label="შენი პასუხი"
          className="mt-6 grid gap-2.5"
        >
          {ROSENBERG_OPTIONS.map((option) => {
            const selected = current === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(option.value)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all hover:border-[var(--vivida-violet)]/60 hover:bg-[var(--vivida-violet)]/8 sm:text-base",
                  selected
                    ? "border-[var(--vivida-violet)]/70 bg-[var(--vivida-violet)]/12 ring-1 ring-[var(--vivida-violet)]/25"
                    : "border-border bg-background/35",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border",
                    selected
                      ? "border-[var(--vivida-violet)] bg-[var(--vivida-violet)] text-white"
                      : "border-muted-foreground/50",
                  )}
                >
                  {selected && <Check className="size-3" />}
                </span>
                {option.labelKa}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setIndex((currentIndex) => Math.max(0, currentIndex - 1))
          }
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
            onClick={showResult}
            disabled={current === undefined}
          >
            <Sparkles className="size-4" />
            ნახე შედეგი
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setIndex((currentIndex) =>
                Math.min(ROSENBERG_QUESTIONS.length - 1, currentIndex + 1),
              )
            }
            disabled={current === undefined}
          >
            შემდეგი
          </Button>
        )}
      </div>

      <div className="mt-6 flex items-start gap-2.5 border-t border-border/70 pt-5 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
        პასუხები მხოლოდ ამ გვერდზე მუშავდება — ისინი Vivida-ს სერვერზე არ
        იგზავნება და გვერდის განახლების შემდეგ ქრება.
      </div>
    </div>
  );
}

function ResultSection({
  icon,
  eyebrow,
  items,
  accent,
}: {
  icon: ReactNode;
  eyebrow: string;
  items: { title: string; text: string }[];
  accent: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span style={{ color: accent }}>{icon}</span>
        {eyebrow}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-border bg-background/35 p-4"
          >
            <h3 className="text-sm font-semibold" style={{ color: accent }}>
              {item.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
