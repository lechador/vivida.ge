"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Heart,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import {
  ATTACHMENT_OPTIONS,
  ATTACHMENT_QUESTIONS,
} from "@/lib/attachment/questions";
import {
  calculateAttachment,
  type AttachmentResult,
} from "@/lib/attachment/scoring";
import { cn } from "@/lib/utils";

export function AttachmentTest() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AttachmentResult | null>(null);

  const question = ATTACHMENT_QUESTIONS[index];
  const current = answers[question.id];
  const isLast = index === ATTACHMENT_QUESTIONS.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(
    (answeredCount / ATTACHMENT_QUESTIONS.length) * 100,
  );

  function choose(value: number) {
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
    if (!isLast) {
      window.setTimeout(
        () =>
          setIndex((currentIndex) =>
            Math.min(currentIndex + 1, ATTACHMENT_QUESTIONS.length - 1),
          ),
        180,
      );
    }
  }

  function showResult() {
    const complete = ATTACHMENT_QUESTIONS.every(
      (item) => answers[item.id] !== undefined,
    );
    if (!complete) {
      const missing = ATTACHMENT_QUESTIONS.findIndex(
        (item) => answers[item.id] === undefined,
      );
      setIndex(Math.max(0, missing));
      return;
    }
    setResult(calculateAttachment(answers));
    trackEvent(ANALYTICS_EVENT.testCompleted, {
      test: "attachment_style",
      items: ATTACHMENT_QUESTIONS.length,
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
    return (
      <div className="space-y-5">
        <section className="overflow-hidden rounded-3xl border border-border bg-card/60 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              შენი შედეგი
            </div>
            <div className="mt-2 text-5xl">{result.glyph}</div>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight">
              {result.labelKa}
            </h2>
            {result.lean && (
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
                შენი ქულები ორი სტილის საზღვართან ახლოსაა — აღწერა შენს
                დომინანტურ მხარეს ასახავს, მაგრამ მეზობელი სტილის თვისებებიც
                გაქვს.
              </p>
            )}
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/85">
              {result.summaryKa}
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-md">
            <AttachmentMap result={result} />
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border border-border bg-background/35 p-3">
                <div
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: result.hue }}
                >
                  {result.anxiety}
                </div>
                <div className="text-xs text-muted-foreground">
                  შფოთი / 100-დან
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background/35 p-3">
                <div
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: result.hue }}
                >
                  {result.avoidance}
                </div>
                <div className="text-xs text-muted-foreground">
                  აცილება / 100-დან
                </div>
              </div>
            </div>
          </div>
        </section>

        <ResultSection
          icon={<Check className="size-4" />}
          eyebrow="შენი ძლიერი მხარეები"
          items={result.strengths}
          accent="var(--vivida-cyan)"
        />

        <ResultSection
          icon={<Sprout className="size-4" />}
          eyebrow="სად შეიძლება ზრდა"
          items={result.growth}
          accent="var(--vivida-pink)"
        />

        <section className="rounded-3xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Heart className="size-4 text-[var(--vivida-pink)]" />
            პარტნიორისთვის — როგორ გესმოდეს
          </div>
          <ul className="mt-4 space-y-3">
            {result.partnerTipsKa.map((tip) => (
              <li
                key={tip}
                className="flex gap-3 text-sm leading-relaxed text-foreground/85"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--vivida-pink)]" />
                {tip}
              </li>
            ))}
          </ul>
        </section>

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

        <section className="rounded-3xl border border-[var(--vivida-violet)]/25 bg-[var(--vivida-violet)]/7 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
          <h3 className="text-base font-semibold tracking-tight">
            გაიგე, როგორ ეწყობით ერთმანეთს
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground/75">
            მიჯაჭვულობის სტილი ნახევარი სურათია — მეორე ნახევარი თქვენი ორი
            რუკის კომბინაციაა.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <Button asChild variant="mystic">
              <Link href="/synastry">შეამოწმე სინასტრია</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/taro">სიყვარულის ტარო</Link>
            </Button>
          </div>
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
          ტესტი თვითრეფლექსიისთვისაა და დიაგნოზს არ ადგენს. სტილი რუკაა და არა
          განაჩენი — ის ცხოვრების გამოცდილებით იცვლება და შეგნებული მუშაობით
          უსაფრთხოსკენ იხრება.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="mb-7">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            კითხვა {index + 1} / {ATTACHMENT_QUESTIONS.length}
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
          უპასუხე ისე, როგორც ურთიერთობებში უმეტესად გრძნობ — არა იდეალური,
          არამედ ჩვეული ვერსიით.
        </p>

        <div
          role="radiogroup"
          aria-label="შენი პასუხი"
          className="mt-6 grid gap-2.5"
        >
          {ATTACHMENT_OPTIONS.map((option) => {
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
                Math.min(ATTACHMENT_QUESTIONS.length - 1, currentIndex + 1),
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

/** 2D რუკა: X = აცილება, Y = შფოთი. წერტილი = შენი პოზიცია. */
function AttachmentMap({ result }: { result: AttachmentResult }) {
  // 0..100 → 8..152 SVG კოორდინატებში (160×160 viewBox, padding 8)
  const x = 8 + (result.avoidance / 100) * 144;
  const y = 8 + ((100 - result.anxiety) / 100) * 144;
  return (
    <svg
      viewBox="0 0 160 160"
      role="img"
      aria-label={`შფოთი ${result.anxiety}, აცილება ${result.avoidance}`}
      className="mx-auto w-full max-w-60"
    >
      <rect
        x="8"
        y="8"
        width="72"
        height="72"
        rx="10"
        fill="oklch(0.78 0.18 350 / 0.14)"
      />
      <rect
        x="80"
        y="8"
        width="72"
        height="72"
        rx="10"
        fill="oklch(0.78 0.18 305 / 0.14)"
      />
      <rect
        x="8"
        y="80"
        width="72"
        height="72"
        rx="10"
        fill="oklch(0.80 0.15 200 / 0.14)"
      />
      <rect
        x="80"
        y="80"
        width="72"
        height="72"
        rx="10"
        fill="oklch(0.82 0.16 85 / 0.16)"
      />
      <text x="20" y="26" fontSize="8" fill="currentColor" opacity="0.55">
        შფოთიანი
      </text>
      <text x="92" y="26" fontSize="8" fill="currentColor" opacity="0.55">
        შიში+აცილება
      </text>
      <text x="20" y="140" fontSize="8" fill="currentColor" opacity="0.55">
        უსაფრთხო
      </text>
      <text x="92" y="140" fontSize="8" fill="currentColor" opacity="0.55">
        აცილებადი
      </text>
      <line
        x1="80"
        y1="8"
        x2="80"
        y2="152"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeDasharray="3 3"
      />
      <line
        x1="8"
        y1="80"
        x2="152"
        y2="80"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeDasharray="3 3"
      />
      <circle
        cx={x}
        cy={y}
        r="7"
        fill={result.hue}
        stroke="var(--background)"
        strokeWidth="2.5"
      />
    </svg>
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
