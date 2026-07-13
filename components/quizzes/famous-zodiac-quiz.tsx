"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, RotateCcw, Share2, Sparkles, Trophy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  FAMOUS_ZODIAC_QUESTIONS,
  ZODIAC_SIGNS,
  signFor,
  type FamousZodiacQuestion,
} from "@/lib/zodiac-famous-quiz";
import { FAMOUS_ZODIAC_ASSETS } from "@/lib/zodiac-famous-assets";

type Answer = { question: FamousZodiacQuestion; selected: string };

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function optionsFor(question: FamousZodiacQuestion) {
  const distractors = shuffle(ZODIAC_SIGNS.filter((sign) => sign.key !== question.sign)).slice(0, 3);
  return shuffle([signFor(question.sign), ...distractors]);
}

function resultCopy(score: number) {
  if (score === 10) return ["ზოდიაქოს ნამდვილი ენციკლოპედია ხარ!", "არც ერთი ვარსკვლავის ნიშანი არ გამოგრჩა."];
  if (score >= 8) return ["შთამბეჭდავია!", "ვარსკვლავების ზოდიაქოს ძალიან კარგად იცნობ."];
  if (score >= 5) return ["კარგი შედეგია!", "რამდენიმე ნიშანი დაგისხლტა — შემდეგ ჯერზე კიდევ უკეთესად ითამაშებ."];
  return ["ვარსკვლავები ცოტა საიდუმლოს ინახავენ.", "შეამოწმე სწორი პასუხები და სცადე თავიდან."];
}

export function FamousZodiacQuiz({ images }: { images: Record<string, string> }) {
  const [questions, setQuestions] = useState(() => shuffle(FAMOUS_ZODIAC_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const question = questions[index];
  const options = useMemo(() => (question ? optionsFor(question) : []), [question]);
  const score = answers.filter((answer) => answer.selected === answer.question.sign).length;
  const done = answers.length === questions.length;

  function choose(key: string) {
    if (selected) return;
    setSelected(key);
  }

  function next() {
    if (!selected) return;
    const nextAnswers = [...answers, { question, selected }];
    setAnswers(nextAnswers);
    setSelected(null);
    setIndex((current) => current + 1);
  }

  function restart() {
    setQuestions(shuffle(FAMOUS_ZODIAC_QUESTIONS));
    setIndex(0);
    setAnswers([]);
    setSelected(null);
  }

  async function share() {
    const url = "https://www.vivida.ge/quiz/varskvlavebis-zodiaqo";
    const text = `ვარსკვლავების ზოდიაქოს ქვიზში ${score}/10 ავიღე ✨ შენ რამდენს გამოიცნობ?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "ვარსკვლავების ზოდიაქო · Vivida", text, url });
        return;
      } catch {
        // A dismissed share sheet is harmless; use the copy fallback.
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard availability varies by browser.
    }
  }

  if (done) {
    const [title, description] = resultCopy(score);
    return (
      <div className="space-y-5">
        <section className="rounded-3xl border border-border bg-card/60 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--vivida-pink)]/15 text-[var(--vivida-pink)] ring-1 ring-[var(--vivida-pink)]/35"><Trophy className="size-6" /></div>
          <div className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">შენი შედეგი</div>
          <div className="mt-1 bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-7xl font-bold leading-none tracking-tight text-transparent">{score}<span className="text-3xl">/10</span></div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground/80">{description}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="mystic" onClick={share} className="gap-1.5">{copied ? <Check className="size-4" /> : <Share2 className="size-4" />}{copied ? "დაკოპირდა" : "გააზიარე შედეგი"}</Button>
            <Button type="button" variant="outline" onClick={restart} className="gap-1.5"><RotateCcw className="size-4" />თავიდან თამაში</Button>
            <Button asChild variant="ghost"><Link href="/tests">სხვა ტესტები</Link></Button>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">პასუხები</h2>
          <div className="mt-4 space-y-2.5">
            {answers.map((answer) => {
              const correct = answer.selected === answer.question.sign;
              const actual = signFor(answer.question.sign);
              const picked = signFor(answer.selected);
              return <div key={answer.question.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/35 px-4 py-3">
                <div className="min-w-0"><div className="truncate text-sm font-medium">{answer.question.name}</div><div className="mt-0.5 text-xs text-muted-foreground">სწორი პასუხი: {actual.glyph} {actual.nameKa}{!correct && <> · შენი პასუხი: {picked.glyph} {picked.nameKa}</>}</div></div>
                <span className={correct ? "text-emerald-400" : "text-rose-400"}>{correct ? <Check className="size-5" /> : <X className="size-5" />}</span>
              </div>;
            })}
          </div>
        </section>

        <details className="rounded-2xl border border-border bg-card/40 px-4 py-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground/80">ფოტოების წყაროები და ლიცენზიები</summary>
          <ul className="mt-3 space-y-1.5 leading-relaxed">
            {FAMOUS_ZODIAC_ASSETS.map((asset) => (
              <li key={asset.id}>
                <a href={asset.sourcePage} target="_blank" rel="noreferrer" className="text-[var(--vivida-cyan)] hover:underline">
                  {asset.id.replaceAll("-", " ")}
                </a>{" "}· {asset.license}
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  }

  const correct = selected === question.sign;
  return <div className="rounded-3xl border border-border bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
    <div className="mb-6"><div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground"><span>კითხვა {index + 1} / {questions.length}</span><span>{Math.round(((index + 1) / questions.length) * 100)}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-border/60"><div className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div></div>
    <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-border bg-background/30"><Image src={images[question.imageId]} alt={question.imageAlt} width={1200} height={1200} priority className="aspect-square w-full object-cover" /></div>
    <div className="mt-5 text-center"><div className="text-xs text-muted-foreground">{question.professionKa}</div><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">რომელი ზოდიაქოს ნიშანია {question.name}?</h2></div>
    <div className="mt-6 grid gap-2.5 sm:grid-cols-2">{options.map((option) => { const state = selected && (option.key === question.sign ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-300" : option.key === selected ? "border-rose-400/70 bg-rose-400/10 text-rose-300" : "opacity-45"); return <button key={option.key} type="button" onClick={() => choose(option.key)} disabled={!!selected} className={`flex items-center gap-3 rounded-2xl border border-border bg-background/35 px-4 py-3.5 text-left text-sm font-medium transition hover:border-[var(--vivida-violet)]/60 disabled:cursor-default ${state ?? ""}`}><span className="text-lg">{option.glyph}</span>{option.nameKa}</button>; })}</div>
    {selected && <div className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${correct ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300" : "border-rose-400/35 bg-rose-400/10 text-rose-300"}`}>{correct ? "სწორია!" : `სწორი პასუხია — ${signFor(question.sign).glyph} ${signFor(question.sign).nameKa}`}</div>}
    <div className="mt-6 flex justify-end"><Button type="button" variant={selected ? "mystic" : "outline"} onClick={next} disabled={!selected}>{index === questions.length - 1 ? <><Sparkles className="size-4" />შედეგის ნახვა</> : "შემდეგი"}</Button></div>
  </div>;
}
