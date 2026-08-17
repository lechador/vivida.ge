"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Share2, Sparkles, Trophy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NextTestWidget } from "@/components/tests/next-test-widget";
import {
  FAMOUS_ZODIAC_QUESTIONS,
  FAMOUS_ZODIAC_ROUND,
  ZODIAC_SIGNS,
  professionEn,
  signFor,
  type FamousZodiacQuestion,
} from "@/lib/zodiac-famous-quiz";
import { FAMOUS_ZODIAC_ASSETS } from "@/lib/zodiac-famous-assets";
import { localeHref } from "@/lib/i18n/armenian-routes";

type Answer = { question: FamousZodiacQuestion; selected: string };

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function optionsFor(question: FamousZodiacQuestion) {
  const distractors = shuffle(ZODIAC_SIGNS.filter((sign) => sign.key !== question.sign)).slice(0, 3);
  return shuffle([signFor(question.sign), ...distractors]);
}

import type { UserLocale } from "@/lib/i18n/user-locale";

function resultCopy(score: number, total: number, locale: UserLocale) {
  const pct = total > 0 ? score / total : 0;
  if (locale === "am") {
    if (score === total) return ["Դուք կենդանակերպի իսկական հանրագիտարան եք։", "Դուք ճիշտ որոշեցիք բոլոր հայտնի մարդկանց նշանները։"];
    if (pct >= 0.8) return ["Տպավորիչ է։", "Դուք հիանալի գիտեք հայտնիների կենդանակերպի նշանները։"];
    if (pct >= 0.5) return ["Լավ արդյունք է։", "Մի քանի նշան վրիպեց, բայց հաջորդ փորձը կարող է ավելի հաջող լինել։"];
    return ["Աստղերը մի քանի գաղտնիք պահեցին։", "Դիտեք ճիշտ պատասխանները և փորձեք ևս մեկ անգամ։"];
  }
  if (locale === "en") {
    if (score === total) return ["A true zodiac encyclopedia!", "You identified every celebrity’s sign correctly."];
    if (pct >= 0.8) return ["Impressive!", "You know celebrity zodiac signs remarkably well."];
    if (pct >= 0.5) return ["A solid result!", "A few signs slipped past you—your next round can be even stronger."];
    return ["The stars kept a few secrets.", "Review the correct answers and try another round."];
  }
  if (score === total) return ["ზოდიაქოს ნამდვილი ენციკლოპედია ხარ!", "არც ერთი ვარსკვლავის ნიშანი არ გამოგრჩა."];
  if (pct >= 0.8) return ["შთამბეჭდავია!", "ვარსკვლავების ზოდიაქოს ძალიან კარგად იცნობ."];
  if (pct >= 0.5) return ["კარგი შედეგია!", "რამდენიმე ნიშანი დაგისხლტა — შემდეგ ჯერზე კიდევ უკეთესად ითამაშებ."];
  return ["ვარსკვლავები ცოტა საიდუმლოს ინახავენ.", "შეამოწმე სწორი პასუხები და სცადე თავიდან."];
}

const subscribeToClient = () => () => {};

export function FamousZodiacQuiz({ images, locale = "ka" }: { images: Record<string, string>; locale?: UserLocale }) {
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false
  );

  if (!mounted) return <QuizSkeleton />;
  return <FamousZodiacQuizGame images={images} locale={locale} />;
}

function FamousZodiacQuizGame({ images, locale }: { images: Record<string, string>; locale: UserLocale }) {
  const en = locale === "en";
  const am = locale === "am";
  const [questions, setQuestions] = useState(() =>
    shuffle(FAMOUS_ZODIAC_QUESTIONS).slice(0, FAMOUS_ZODIAC_ROUND)
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const question = questions[index];
  const options = useMemo(() => (question ? optionsFor(question) : []), [question]);
  const score = answers.filter((answer) => answer.selected === answer.question.sign).length;
  const total = questions.length;
  const done = answers.length === total;

  // Warm the browser cache for the next portrait so the crossfade reveals a
  // fully-loaded image instead of flashing a blank frame.
  useEffect(() => {
    const upcoming = questions[index + 1];
    const src = upcoming && images[upcoming.imageId];
    if (src) {
      const img = new window.Image();
      img.src = src;
    }
  }, [index, questions, images]);

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
    setQuestions(shuffle(FAMOUS_ZODIAC_QUESTIONS).slice(0, FAMOUS_ZODIAC_ROUND));
    setIndex(0);
    setAnswers([]);
    setSelected(null);
  }

  async function share() {
    const url = `${window.location.origin}${localeHref("/quiz/varskvlavebis-zodiaqo", locale)}`;
    const text = am ? `Vivida-ի հայտնիների կենդանակերպի վիկտորինայում հավաքեցի ${score}/${total} ✨ Իսկ դո՞ւ որքան կգուշակես։` : en ? `I scored ${score}/${total} on Vivida’s celebrity zodiac quiz ✨ How many can you guess?` : `ვარსკვლავების ზოდიაქოს ქვიზში ${score}/${total} ავიღე ✨ შენ რამდენს გამოიცნობ?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: am ? "Հայտնիների կենդանակերպը · Vivida" : en ? "Celebrity Zodiac Quiz · Vivida" : "ვარსკვლავების ზოდიაქო · Vivida", text, url });
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
    const [title, description] = resultCopy(score, total, locale);
    return (
      <div className="space-y-5">
        <section className="rounded-3xl border border-border bg-card/60 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--vivida-pink)]/15 text-[var(--vivida-pink)] ring-1 ring-[var(--vivida-pink)]/35"><Trophy className="size-6" /></div>
          <div className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{am ? "Ձեր արդյունքը" : en ? "Your result" : "შენი შედეგი"}</div>
          <div className="mt-1 bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-7xl font-bold leading-none tracking-tight text-transparent">{score}<span className="text-3xl">/{total}</span></div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground/80">{description}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="mystic" onClick={share} className="gap-1.5">{copied ? <Check className="size-4" /> : <Share2 className="size-4" />}{copied ? (am ? "Պատճենված է" : en ? "Copied" : "დაკოპირდა") : (am ? "Կիսվել արդյունքով" : en ? "Share result" : "გააზიარე შედეგი")}</Button>
            <Button type="button" variant="outline" onClick={restart} className="gap-1.5"><RotateCcw className="size-4" />{am ? "Խաղալ կրկին" : en ? "Play again" : "თავიდან თამაში"}</Button>
            <Button asChild variant="ghost"><Link href={localeHref("/tests", locale)}>{am ? "Այլ թեստեր" : en ? "More tests" : "სხვა ტესტები"}</Link></Button>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">{am ? "Պատասխաններ" : en ? "Answers" : "პასუხები"}</h2>
          <div className="mt-4 space-y-2.5">
            {answers.map((answer) => {
              const correct = answer.selected === answer.question.sign;
              const actual = signFor(answer.question.sign);
              const picked = signFor(answer.selected);
              return <div key={answer.question.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/35 px-4 py-3">
                <div className="min-w-0"><div className="truncate text-sm font-medium">{answer.question.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{am ? "Ճիշտ պատասխանը" : en ? "Correct answer" : "სწორი პასუხი"}: {actual.glyph} {am ? actual.nameAm : en ? actual.nameEn : actual.nameKa}{!correct && <> · {am ? "Ձեր պատասխանը" : en ? "Your answer" : "შენი პასუხი"}: {picked.glyph} {am ? picked.nameAm : en ? picked.nameEn : picked.nameKa}</>}</div></div>
                <span className={correct ? "text-emerald-400" : "text-rose-400"}>{correct ? <Check className="size-5" /> : <X className="size-5" />}</span>
              </div>;
            })}
          </div>
        </section>

        {!am && <NextTestWidget completed="famous-zodiac" locale={locale} />}

        <details className="rounded-2xl border border-border bg-card/40 px-4 py-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground/80">{am ? "Լուսանկարների աղբյուրներն ու արտոնագրերը" : en ? "Photo sources and licenses" : "ფოტოების წყაროები და ლიცენზიები"}</summary>
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
    <div className="mb-6"><div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground"><span>{am ? "Հարց" : en ? "Question" : "კითხვა"} {index + 1} / {questions.length}</span><span>{Math.round(((index + 1) / questions.length) * 100)}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-border/60"><div className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div></div>
    <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-3xl border border-border bg-background/30">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={question.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image src={images[question.imageId]} alt={am ? question.imageAlt : en ? `${question.name} portrait` : question.imageAlt} width={1200} height={1200} priority className="size-full object-cover" />
        </motion.div>
      </AnimatePresence>
    </div>
    <div className="mt-5 text-center"><div className="text-xs text-muted-foreground">{am ? question.professionAm : en ? professionEn(question) : question.professionKa}</div><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{am ? `Ո՞րն է ${question.name}-ի կենդանակերպի նշանը։` : en ? `What is ${question.name}’s zodiac sign?` : `რომელი ზოდიაქოს ნიშანია ${question.name}?`}</h2></div>
    <div className="mt-6 grid gap-2.5 sm:grid-cols-2">{options.map((option) => { const state = selected && (option.key === question.sign ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-300" : option.key === selected ? "border-rose-400/70 bg-rose-400/10 text-rose-300" : "opacity-45"); return <button key={option.key} type="button" onClick={() => choose(option.key)} disabled={!!selected} className={`flex items-center gap-3 rounded-2xl border border-border bg-background/35 px-4 py-3.5 text-left text-sm font-medium transition hover:border-[var(--vivida-violet)]/60 disabled:cursor-default ${state ?? ""}`}><span className="text-lg">{option.glyph}</span>{am ? option.nameAm : en ? option.nameEn : option.nameKa}</button>; })}</div>
    {selected && <div className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${correct ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300" : "border-rose-400/35 bg-rose-400/10 text-rose-300"}`}>{correct ? (am ? "Ճիշտ է։" : en ? "Correct!" : "სწორია!") : `${am ? "Ճիշտ պատասխանն է" : en ? "The correct answer is" : "სწორი პასუხია"} — ${signFor(question.sign).glyph} ${am ? signFor(question.sign).nameAm : en ? signFor(question.sign).nameEn : signFor(question.sign).nameKa}`}</div>}
    <div className="mt-6 flex justify-end"><Button type="button" variant={selected ? "mystic" : "outline"} onClick={next} disabled={!selected}>{index === questions.length - 1 ? <><Sparkles className="size-4" />{am ? "Տեսնել արդյունքը" : en ? "See result" : "შედეგის ნახვა"}</> : (am ? "Հաջորդը" : en ? "Next" : "შემდეგი")}</Button></div>
  </div>;
}

function QuizSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-border/60" />
      <div className="mx-auto aspect-square max-w-md animate-pulse rounded-3xl bg-background/40" />
      <div className="mx-auto mt-6 h-6 w-3/4 animate-pulse rounded bg-background/40" />
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-2xl bg-background/40" />
        ))}
      </div>
    </div>
  );
}
