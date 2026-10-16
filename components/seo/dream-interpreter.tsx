"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoonStar, SendHorizonal, Sparkles } from "lucide-react";

import { CreditHint } from "@/components/credits/credit-hint";
import { ContextualPaywallActions } from "@/components/billing/contextual-paywall-actions";
import { CREDIT_COST } from "@/lib/credits-config";
import type { UserLocale } from "@/lib/i18n/user-locale";

const PENDING_KEY = "pending-dream-text";

function savePendingDream(text: string) {
  try {
    sessionStorage.setItem(PENDING_KEY, text);
  } catch {
    /* private mode, the redirect still works, the draft just won't survive */
  }
}

function takePendingDream(): string | null {
  try {
    const text = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return text;
  } catch {
    return null;
  }
}

type DreamResult = {
  title: string;
  interpretation: string;
  symbols: Array<{ name: string; meaning: string }>;
  advice: string;
  charged: number;
  balance: number;
};

const ERRORS_KA: Record<string, string> = {
  invalid_dream: "მოუყევი სიზმარი ცოტა ვრცლად, მინიმუმ 10 სიმბოლო.",
  rate_limited: "დღევანდელი ლიმიტი ამოიწურა. სცადე ხვალ.",
  unavailable: "სერვისი დროებით მიუწვდომელია.",
  generation_failed: "ახსნის გენერაცია ვერ მოხერხდა. სცადე ხელახლა.",
  needs_credits: "ბალანსი არ არის საკმარისი, შეავსე და სცადე ხელახლა.",
};

const ERRORS_EN: Record<string, string> = {
  invalid_dream:
    "Tell the dream in a little more detail, at least 10 characters.",
  rate_limited: "You've reached today's limit. Try again tomorrow.",
  unavailable: "The service is temporarily unavailable.",
  generation_failed: "Couldn't generate the interpretation. Please try again.",
  needs_credits: "Not enough credits, top up and try again.",
};

const EXAMPLES_KA = [
  "ვფრინავდი მაღლა ღრუბლებზე და არ მეშინოდა",
  "სახლში წყალი ჩამოდიოდა ჭერიდან",
  "უცნობ ქალაქში დავიკარგე ღამით",
];

const EXAMPLES_EN = [
  "I was flying above the clouds and wasn't afraid",
  "Water was leaking through the ceiling at home",
  "I got lost in an unknown city at night",
];

/**
 * AI dream interpreter. Visitors can type freely for SEO, but the moment
 * they ask for an answer they hit the sign-in wall (the draft survives
 * login via sessionStorage); every interpretation costs CREDIT_COST.dream.
 */
export function DreamInterpreter({
  authed,
  locale,
  countryCode,
}: {
  authed: boolean;
  locale: UserLocale;
  countryCode?: string | null;
}) {
  const en = locale === "en";
  const router = useRouter();
  const [dream, setDream] = useState(() => {
    if (typeof window === "undefined") return "";
    return takePendingDream() ?? "";
  });
  const [status, setStatus] = useState<"idle" | "sending" | "short" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DreamResult | null>(null);
  const [shortfall, setShortfall] = useState({
    balance: 0,
    cost: CREDIT_COST.dream,
  });

  const examples = en ? EXAMPLES_EN : EXAMPLES_KA;
  const errors = en ? ERRORS_EN : ERRORS_KA;

  async function interpret() {
    const text = dream.trim();
    if (text.length < 10 || status === "sending") return;
    if (!authed) {
      savePendingDream(text);
      router.push(`/login?next=${encodeURIComponent("/sizmris-akhsna")}`);
      return;
    }
    setStatus("sending");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/dreams/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream: text, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "needs_credits") {
          setShortfall({
            balance: typeof data.balance === "number" ? data.balance : 0,
            cost: typeof data.cost === "number" ? data.cost : CREDIT_COST.dream,
          });
          setStatus("short");
        } else {
          setError(errors[data.error] ?? errors.generation_failed);
          setStatus("error");
        }
        return;
      }
      setResult(data as DreamResult);
      setStatus("idle");
    } catch {
      setError(errors.generation_failed);
      setStatus("error");
    }
  }

  return (
    <section
      id="dream-interpreter"
      aria-label={en ? "AI dream interpretation" : "სიზმრის AI ახსნა"}
      className="relative mb-10 overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/14 via-card/60 to-[var(--vivida-cyan)]/10 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[var(--vivida-violet)]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-12 size-52 rounded-full bg-[var(--vivida-cyan)]/15 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/35">
            <MoonStar className="size-5 text-[var(--vivida-violet)]" />
          </span>
          <div>
            <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              {en
                ? "Tell me your dream, AI interprets it"
                : "მოუყევი სიზმარი, AI აგიხსნის"}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {en
                ? "Personal interpretation, not a dictionary entry"
                : "პერსონალური ინტერპრეტაცია, არა ლექსიკონის სტატია"}
            </p>
          </div>
        </div>

        <label htmlFor="dream-input" className="sr-only">
          {en ? "Your dream" : "შენი სიზმარი"}
        </label>
        <textarea
          id="dream-input"
          value={dream}
          onChange={(e) => setDream(e.target.value.slice(0, 2000))}
          rows={4}
          placeholder={
            en
              ? "Last night I dreamed that I was… (who, where, what did you feel?)"
              : "გუშინ სიზმრად ვნახე, რომ… (ვინ, სად, რას გრძნობდი?)"
          }
          className="mt-4 w-full resize-y rounded-2xl border border-border bg-background/70 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/70 focus-visible:border-[var(--vivida-violet)] focus-visible:ring-2 focus-visible:ring-[var(--vivida-violet)]/30"
        />

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setDream(ex)}
              className="rounded-full border border-border/70 bg-background/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-[var(--vivida-violet)]/50 hover:text-foreground"
            >
              {ex.length > 42 ? `${ex.slice(0, 42)}…` : ex}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={interpret}
            disabled={dream.trim().length < 10 || status === "sending"}
            className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--vivida-violet)]/25 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "sending" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizonal className="size-4" />
            )}
            {status === "sending"
              ? en
                ? "Interpreting…"
                : "იშიფრება…"
              : en
                ? "Interpret my dream"
                : "ახსენი ჩემი სიზმარი"}
          </button>
          <CreditHint>
            {en
              ? `Costs ${CREDIT_COST.dream} credits per dream · sign-in required`
              : `თითო სიზმარი ${CREDIT_COST.dream} კრედიტი · საჭიროა ავტორიზაცია`}
          </CreditHint>
        </div>

        {status === "sending" && (
          <div role="status" className="mt-5 space-y-2.5" aria-live="polite">
            <div className="h-4 w-2/3 animate-pulse rounded-lg bg-foreground/10" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-foreground/10" />
            <div className="h-4 w-5/6 animate-pulse rounded-lg bg-foreground/10" />
            <p className="pt-1 text-[13px] text-muted-foreground">
              {en
                ? "Reading the symbols in your dream…"
                : "შენი სიზმრის სიმბოლოებს ვკითხულობ…"}
            </p>
          </div>
        )}

        {status === "error" && error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {status === "short" && (
          <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
            <p className="text-sm font-medium">
              {en
                ? "Not enough credits for this dream."
                : "ამ სიზმრისთვის კრედიტები არ გყოფნის."}
            </p>
            <div className="mt-3">
              <ContextualPaywallActions
                locale={locale}
                balance={shortfall.balance}
                cost={shortfall.cost}
                product="dream"
                returnTo="/sizmris-akhsna"
                placement="dream_interpreter"
                countryCode={countryCode}
              />
            </div>
          </div>
        )}

        {result && (
          <article className="mt-5 rounded-2xl border border-[var(--vivida-violet)]/25 bg-background/70 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--vivida-violet)]">
              <Sparkles className="size-3.5" />
              {result.title}
            </div>
            <p className="mt-2.5 text-[15px] leading-relaxed text-foreground/90">
              {result.interpretation}
            </p>
            <ul className="mt-4 space-y-2.5">
              {result.symbols.map((s) => (
                <li
                  key={s.name}
                  className="rounded-xl border border-border/60 bg-card/50 px-3.5 py-2.5 text-sm leading-relaxed"
                >
                  <span className="font-semibold text-foreground">
                    {s.name}
                  </span>
                  <span className="text-muted-foreground">, </span>
                  <span className="text-foreground/85">{s.meaning}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-[var(--vivida-cyan)]/10 px-3.5 py-2.5 text-sm leading-relaxed text-foreground/85 ring-1 ring-[var(--vivida-cyan)]/25">
              <span className="font-semibold">
                ✨ {en ? "Advice: " : "რჩევა: "}
              </span>
              {result.advice}
            </p>
          </article>
        )}
      </div>
    </section>
  );
}
