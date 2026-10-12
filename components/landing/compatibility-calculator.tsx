"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, RotateCcw, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pairSlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { fbTrack, fbTrackCustom } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { CalcPair, CalcSign } from "@/lib/compatibility-calculator-data";

const SCORE_COLOR: Record<string, string> = {
  ძლიერი: "oklch(0.78 0.18 305)",
  ჰარმონიული: "oklch(0.78 0.16 200)",
  გამომწვევი: "oklch(0.72 0.20 30)",
  Strong: "oklch(0.78 0.18 305)",
  Harmonious: "oklch(0.78 0.16 200)",
  Dynamic: "oklch(0.72 0.20 30)",
};

const EASE = [0.22, 1, 0.36, 1] as const;

type Slot = "a" | "b";

export function CompatibilityCalculator({
  signs,
  pairs,
  locale = "ka",
}: {
  signs: CalcSign[];
  pairs: Record<string, CalcPair>;
  locale?: "ka" | "en";
}) {
  const en = locale === "en";
  const [a, setA] = useState<ZodiacSlug | null>(null);
  const [b, setB] = useState<ZodiacSlug | null>(null);
  const [active, setActive] = useState<Slot>("a");
  const [result, setResult] = useState<CalcPair | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const signMap = Object.fromEntries(signs.map((s) => [s.slug, s]));
  const signA = a ? signMap[a] : null;
  const signB = b ? signMap[b] : null;

  function pick(slug: ZodiacSlug) {
    if (active === "a") {
      setA(slug);
      setActive("b");
    } else {
      setB(slug);
      setActive("a");
    }
    setResult(null);
  }

  function calculate() {
    if (!a || !b) return;
    const slug = pairSlug(a, b);
    const pair = pairs[slug];
    if (!pair) return;
    setResult(pair);
    // Ad-optimization signal: cold traffic that actually engages.
    fbTrack("ViewContent", {
      content_name: "compatibility_result",
      content_category: "compatibility",
    });
    fbTrackCustom("CompatibilityCheck", {
      pair: slug,
      percent: pair.percent,
    });
    trackEvent(ANALYTICS_EVENT.compatibilityCheckCompleted, {
      pair: slug,
      percent: pair.percent,
      score: pair.score,
      surface: "home_calculator",
    });
    // Let the reveal mount, then scroll it into view on small screens.
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  function reset() {
    setA(null);
    setB(null);
    setActive("a");
    setResult(null);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Chosen-pair slots */}
      <div className="flex items-stretch gap-3 sm:gap-4">
        <Slot
          label={en ? "Your sign" : "შენი ნიშანი"}
          sign={signA}
          active={active === "a"}
          onClick={() => setActive("a")}
        />
        <div className="flex shrink-0 items-center justify-center pt-7">
          <Heart
            className="size-6 text-[var(--vivida-pink)] sm:size-7"
            fill="currentColor"
          />
        </div>
        <Slot
          label={en ? "Their sign" : "მისი ნიშანი"}
          sign={signB}
          active={active === "b"}
          onClick={() => setActive("b")}
        />
      </div>

      {/* Sign picker */}
      <div className="mt-5 rounded-3xl border border-border bg-card/55 p-3 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-4">
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {signs.map((s) => {
            const selected = s.slug === a || s.slug === b;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => pick(s.slug)}
                title={s.label}
                aria-pressed={selected}
                className="group flex flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-all hover:bg-white/5"
                style={
                  selected
                    ? {
                        background: `color-mix(in oklch, ${s.color} 16%, transparent)`,
                        boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${s.color} 45%, transparent)`,
                      }
                    : undefined
                }
              >
                <span
                  className="text-xl leading-none transition-transform group-hover:scale-110 sm:text-2xl"
                  style={{ color: s.color }}
                >
                  {s.symbol}
                </span>
                <span className="truncate text-[10px] leading-tight text-muted-foreground sm:text-xs">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculate / reset */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <Button
          variant="mystic"
          size="lg"
          disabled={!a || !b}
          onClick={calculate}
          className="bg-[linear-gradient(120deg,var(--vivida-cyan),var(--vivida-pink))]"
        >
          <Sparkles className="size-5" />
          {result
            ? en
              ? "Calculate again"
              : "ხელახლა გამოთვალე"
            : en
              ? "Calculate compatibility"
              : "გამოთვალე თავსებადობა"}
        </Button>
        {(a || b) && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-4" />
            {en ? "Reset" : "თავიდან"}
          </button>
        )}
      </div>

      {/* Result reveal */}
      <AnimatePresence mode="wait">
        {result && signA && signB && (
          <motion.div
            key={result.slug}
            ref={resultRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-8"
          >
            <ResultCard
              result={result}
              signA={signA}
              signB={signB}
              locale={locale}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slot({
  label,
  sign,
  active,
  onClick,
}: {
  label: string;
  sign: CalcSign | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-2"
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className="grid aspect-square w-full max-w-[120px] place-items-center rounded-3xl border text-4xl backdrop-blur-xl transition-all sm:text-5xl"
        style={{
          borderColor: sign
            ? `color-mix(in oklch, ${sign.color} 45%, transparent)`
            : active
              ? "var(--vivida-cyan)"
              : "var(--border)",
          background: sign
            ? `color-mix(in oklch, ${sign.color} 14%, transparent)`
            : "color-mix(in oklch, var(--card) 55%, transparent)",
          color: sign?.color ?? "var(--muted-foreground)",
          boxShadow: active
            ? "0 0 0 2px color-mix(in oklch, var(--vivida-cyan) 55%, transparent)"
            : undefined,
        }}
      >
        {sign ? sign.symbol : "?"}
      </span>
      <span className="text-sm font-medium text-foreground/90">
        {sign ? sign.label : "—"}
      </span>
    </button>
  );
}

function ResultCard({
  result,
  signA,
  signB,
  locale,
}: {
  result: CalcPair;
  signA: CalcSign;
  signB: CalcSign;
  locale: "ka" | "en";
}) {
  const en = locale === "en";
  const color = SCORE_COLOR[result.score] ?? "var(--vivida-violet)";
  const percent = useCountUp(result.percent);

  async function share() {
    const url = `${en ? "https://www.vividaastro.com" : "https://www.vivida.ge"}/zodiac/tavsebadoba/${result.slug}`;
    const text = en
      ? `${signA.label} × ${signB.label}, ${result.percent}% compatibility on Vivida ✨`
      : `${signA.label} × ${signB.label}, ${result.percent}% თავსებადობა Vivida-ზე ✨`;
    fbTrackCustom("CompatibilityShare", { pair: result.slug });
    try {
      if (navigator.share) {
        await navigator.share({
          title: en ? "Vivida compatibility" : "Vivida თავსებადობა",
          text,
          url,
        });
        trackEvent(ANALYTICS_EVENT.compatibilityShare, {
          pair: result.slug,
          method: "native",
        });
        return;
      }
    } catch {
      // user cancelled the share sheet, nothing to do.
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      trackEvent(ANALYTICS_EVENT.compatibilityShare, {
        pair: result.slug,
        method: "clipboard",
      });
    } catch {
      // clipboard blocked, silently ignore, the full-analysis link remains.
    }
  }

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <article
      className="relative overflow-hidden rounded-3xl border p-6 text-center ring-1 ring-foreground/10 backdrop-blur-xl sm:p-9"
      style={{
        borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
        background: `linear-gradient(135deg, color-mix(in oklch, ${signA.color} 13%, transparent), color-mix(in oklch, ${signB.color} 13%, transparent))`,
      }}
    >
      <div
        aria-hidden
        className="absolute -right-24 -top-24 size-72 rounded-full opacity-30 blur-3xl"
        style={{
          background: `conic-gradient(from 0deg, ${signA.color}, ${signB.color}, ${signA.color})`,
        }}
      />

      <div className="relative flex items-center justify-center gap-3 text-sm font-medium">
        <span style={{ color: signA.color }}>
          {signA.symbol} {signA.label}
        </span>
        <span className="text-muted-foreground/60">×</span>
        <span style={{ color: signB.color }}>
          {signB.symbol} {signB.label}
        </span>
      </div>

      {/* Percent ring */}
      <div className="relative mx-auto mt-5 grid size-36 place-items-center sm:size-40">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="color-mix(in oklch, var(--foreground) 10%, transparent)"
            strokeWidth="9"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C - (C * result.percent) / 100 }}
            transition={{ duration: 1.1, ease: EASE }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span
            className="text-4xl font-bold tabular-nums tracking-tight sm:text-5xl"
            style={{ color }}
          >
            {percent}%
          </span>
        </div>
      </div>

      <div
        className="relative mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
        style={{
          borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
          background: `color-mix(in oklch, ${color} 12%, transparent)`,
          color,
        }}
      >
        <span className="font-semibold">{result.score}</span>
        <span className="text-foreground/70">
          {en ? "compatibility" : "თავსებადობა"}
        </span>
      </div>

      <p className="relative mx-auto mt-4 max-w-md text-pretty text-base text-foreground/90 sm:text-lg">
        {result.tagline}
      </p>

      {result.strengths.length > 0 && (
        <ul className="relative mx-auto mt-5 flex max-w-md flex-col gap-2 text-left">
          {result.strengths.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground/85"
            >
              <Check
                className="mt-0.5 size-4 shrink-0"
                style={{ color }}
                strokeWidth={3}
              />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="relative mt-7 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline" size="default">
            <Link
              href={
                en ? `/compatibility` : `/zodiac/tavsebadoba/${result.slug}`
              }
            >
              {en ? "View full analysis" : "ნახე სრული ანალიზი"}
            </Link>
          </Button>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-card"
          >
            <Share2 className="size-4" />
            {en ? "Share" : "გააზიარე"}
          </button>
        </div>

        {/* The hook into the actual product */}
        <div className="mt-4 w-full rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-5">
          <p className="text-pretty text-sm text-foreground/85">
            {en ? (
              <>
                This compares only your{" "}
                <strong className="text-foreground">Sun signs</strong>, the
                surface layer. Deeper compatibility includes the Moon, Venus,
                Mars, houses, and cross-chart aspects. Vivida calculates the
                complete picture.
              </>
            ) : (
              <>
                ეს მხოლოდ{" "}
                <strong className="text-foreground">მზის ნიშანია</strong>,
                ზედაპირი. შენი ნამდვილი თავსებადობა მთვარეებსა და ვენერებზე
                იწერება. Vivida ითვლის სრულ ნატალურ რუკას და გაცნობს ადამიანებს,
                ვისთანაც მართლა ემთხვევი.
              </>
            )}
          </p>
          <Button
            asChild
            variant="mystic"
            size="lg"
            className="mt-4 bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))]"
          >
            <Link href="/signup">
              <Sparkles className="size-5" />
              {en ? "Create a free profile" : "შექმენი პროფილი უფასოდ"}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Count a number up to `target` once, ~1.1s, matching the ring animation. */
function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const duration = 1100;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}
