"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  History,
  Loader2,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreditHint } from "@/components/credits/credit-hint";
import { CREDIT_COST } from "@/lib/credits-config";
import {
  ANALYTICS_EVENT,
  trackEvent,
  trackFirstResultViewed,
} from "@/lib/analytics";
import { fbTrack, fbTrackCustom } from "@/lib/fb-pixel";
import type { UserLocale } from "@/lib/i18n/locale";
import {
  nextTarotAttempt,
  type TarotAttempt,
} from "@/lib/tarot/request-attempt";
import {
  TAROT_SPREADS,
  tarotSpreadById,
  type TarotSpreadId,
} from "@/lib/tarot/spreads";
import {
  savePendingTarotQuestion,
  takePendingTarotQuestion,
  type PendingTarotAttempt,
} from "@/lib/tarot/pending-question";
import { ContextualPaywallActions } from "@/components/billing/contextual-paywall-actions";

type SpreadCard = {
  slug: string;
  name: string;
  glyph: string;
  image: string;
  reversed: boolean;
  position: string;
  interpretation: string;
};
type TarotFollowup = {
  question: string;
  answer: string;
  degraded: boolean;
  charged: number;
  free: boolean;
};
type Reading = {
  headline: string;
  cards: SpreadCard[];
  reading: string;
  advice: string;
  charged: number;
  free: boolean;
  balance: number;
  libraryId?: string;
  degraded: boolean;
  followups: TarotFollowup[];
  spreadId: string;
  spreadOptions?: { a: string; b: string };
  /** Loaded from history rather than freshly drawn — cost line stays hidden. */
  fromHistory?: boolean;
};

type HistoryItem = {
  id: string;
  question: string;
  headline: string;
  createdAt: string;
  reading?: {
    question: string;
    headline?: string;
    cards: Array<{
      slug: string;
      name: string;
      glyph: string;
      image?: string;
      reversed: boolean;
      position: string;
      interpretation: string;
    }>;
    reading: string;
    advice: string;
    charged?: number;
    free?: boolean;
    degraded?: boolean;
    spreadId?: string;
    spreadOptions?: { a: string; b: string };
    followups?: Array<{
      question: string;
      answer: string;
      degraded?: boolean;
      charged?: number;
      free?: boolean;
    }>;
  };
};

/**
 * Interactive tarot reader. Auth-gated (the free-then-credits gate needs an
 * account); signed-out visitors see the whole page for SEO but the ask button
 * routes them to sign-in. First reading free, then `cost` credits each.
 */
export function TarotReader({
  authed,
  cost,
  locale,
  countryCode,
  premium = false,
}: {
  authed: boolean;
  cost: number;
  locale: UserLocale;
  countryCode?: string | null;
  premium?: boolean;
}) {
  const en = locale === "en";
  const router = useRouter();
  const [pending] = useState<PendingTarotAttempt | null>(() => {
    // Restore the question after the sign-in or top-up redirect consumes it.
    if (typeof window === "undefined") return null;
    return takePendingTarotQuestion(sessionStorage);
  });
  const [question, setQuestion] = useState(pending?.question ?? "");
  const [spreadId, setSpreadId] = useState<TarotSpreadId>(
    () => tarotSpreadById(pending?.spreadId)?.id ?? "situation",
  );
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [attempt, setAttempt] = useState<TarotAttempt | null>(
    pending?.requestId
      ? {
          question: pending.question,
          spreadId: tarotSpreadById(pending.spreadId)?.id ?? "situation",
          requestId: pending.requestId,
        }
      : null,
  );
  const [reading, setReading] = useState<Reading | null>(null);
  const [status, setStatus] = useState<"idle" | "drawing" | "short" | "error">(
    "idle",
  );
  const [shortBalance, setShortBalance] = useState(0);
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [followupStatus, setFollowupStatus] = useState<
    "idle" | "sending" | "short" | "error"
  >("idle");
  const [followupShort, setFollowupShort] = useState<{
    balance: number;
    cost: number;
  }>({
    balance: 0,
    cost: CREDIT_COST.tarotFollowup,
  });
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Previous readings, so a past spread can be reopened (reply) or a fresh
  // question started without leaving the page.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    fetch("/api/tarot/history")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: HistoryItem[] }) => {
        if (!cancelled) setHistory(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authed]);

  function loadHistoryItem(item: HistoryItem) {
    const content = item.reading;
    if (!content) return;
    setQuestion(content.question);
    setSpreadId(tarotSpreadById(content.spreadId)?.id ?? "situation");
    setAttempt(null);
    setFollowupQuestion("");
    setFollowupStatus("idle");
    setActiveHistoryId(item.id);
    setReading({
      headline: item.headline,
      cards: content.cards.map((c) => ({
        slug: c.slug,
        name: c.name,
        glyph: c.glyph,
        image: c.image || `/tarot/${c.slug}.webp`,
        reversed: c.reversed,
        position: c.position,
        interpretation: c.interpretation,
      })),
      reading: content.reading,
      advice: content.advice,
      charged: content.charged ?? 0,
      free: content.free ?? false,
      balance: 0,
      libraryId: item.id,
      degraded: content.degraded ?? false,
      followups: (content.followups ?? []).map((f) => ({
        question: f.question,
        answer: f.answer,
        degraded: f.degraded ?? false,
        charged: f.charged ?? 0,
        free: f.free ?? false,
      })),
      spreadId: tarotSpreadById(content.spreadId)?.id ?? "situation",
      spreadOptions: content.spreadOptions,
      fromHistory: true,
    });
    setStatus("idle");
  }

  async function ask() {
    // A second Enter while the first request is in flight would spend the
    // credits twice — the API has no dedupe, so the guard lives here.
    if (status === "drawing") return;
    const q = question.trim();
    if (q.length < 3) return;
    if (!authed) {
      // The sign-in wall is the single biggest drop-off on this funnel —
      // track it separately from a completed reading so the two are
      // distinguishable in GA4. Keep the question so it survives login.
      savePendingTarotQuestion(sessionStorage, q);
      trackEvent(ANALYTICS_EVENT.tarotLoginRequired, {
        widget: "tarot_reader",
      });
      router.push(`/login?next=${encodeURIComponent("/taro")}`);
      return;
    }
    setStatus("drawing");
    setReading(null);
    // Retries of the same question reuse one request id so the server can
    // replay the reading instead of charging twice.
    const nextAttempt = nextTarotAttempt(attempt, q, spreadId);
    setAttempt(nextAttempt);
    const trimmedA = optionA.trim().slice(0, 100);
    const trimmedB = optionB.trim().slice(0, 100);
    try {
      const res = await fetch("/api/tarot/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          locale,
          requestId: nextAttempt.requestId,
          spreadId,
          ...(spreadId === "choice" && trimmedA && trimmedB
            ? { optionA: trimmedA, optionB: trimmedB }
            : {}),
        }),
      });
      if (res.status === 402) {
        const data = (await res.json().catch(() => ({}))) as {
          balance?: number;
        };
        setShortBalance(typeof data.balance === "number" ? data.balance : 0);
        trackEvent(ANALYTICS_EVENT.tarotCreditsShort, {
          widget: "tarot_reader",
        });
        trackEvent(ANALYTICS_EVENT.insufficientCredits, {
          product: "tarot",
          surface: "tarot_reader",
          cost,
        });
        setStatus("short");
        // The top-up flow leaves this page; restore the question (and its
        // request id, so the retry replays instead of charging again).
        savePendingTarotQuestion(
          sessionStorage,
          q,
          nextAttempt.requestId,
          spreadId,
        );
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const next = (await res.json()) as Reading;
      trackEvent(ANALYTICS_EVENT.tarotReadingCompleted, {
        free: next.free ? 1 : 0,
        spread: next.spreadId,
      });
      if (next.charged > 0) {
        trackEvent(ANALYTICS_EVENT.creditUnlock, {
          product: "tarot",
          surface: "tarot_reader",
          cost: next.charged,
          outcome: "unlocked",
        });
      }
      trackFirstResultViewed({
        product: "tarot",
        surface: "tarot_reader",
        free: next.free ? 1 : 0,
      });
      fbTrackCustom("TarotReadingCompleted", {
        free: next.free ? 1 : 0,
        content_name: "three_card_tarot_reading",
      });
      if (next.free) {
        fbTrack("Lead", {
          content_name: "first_tarot_reading",
          content_category: "tarot",
        });
      }
      setReading(next);
      setActiveHistoryId(null);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setReading(null);
    setQuestion("");
    setAttempt(null);
    setFollowupQuestion("");
    setFollowupStatus("idle");
    setStatus("idle");
    setActiveHistoryId(null);
  }

  const FOLLOWUP_SUGGESTIONS: Record<UserLocale, string[]> = {
    ka: [
      "უფრო მარტივად ამიხსენი",
      "ეს ჩემს სიტუაციას როგორ უკავშირდება?",
      "რომელ ნაბიჯზე დავფიქრდე?",
    ],
    en: [
      "Explain this more simply",
      "How does this connect to my situation?",
      "Which next step should I consider?",
    ],
  };

  async function askFollowup(preset?: string) {
    if (!reading?.libraryId || followupStatus === "sending") return;
    const fq = (preset ?? followupQuestion).trim();
    if (fq.length < 3) return;
    setFollowupStatus("sending");
    try {
      const res = await fetch("/api/tarot/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          libraryId: reading.libraryId,
          question: fq,
          locale,
        }),
      });
      if (res.status === 402) {
        const data = (await res.json().catch(() => ({}))) as {
          balance?: number;
          cost?: number;
        };
        setFollowupShort({
          balance: typeof data.balance === "number" ? data.balance : 0,
          cost:
            typeof data.cost === "number"
              ? data.cost
              : CREDIT_COST.tarotFollowup,
        });
        trackEvent(ANALYTICS_EVENT.tarotCreditsShort, {
          widget: "tarot_followup",
        });
        trackEvent(ANALYTICS_EVENT.insufficientCredits, {
          product: "tarot_followup",
          surface: "tarot_followup",
          cost: CREDIT_COST.tarotFollowup,
        });
        trackEvent(ANALYTICS_EVENT.paywallViewed, {
          product: "tarot_followup",
          surface: "tarot_followup_short",
          cost: CREDIT_COST.tarotFollowup,
        });
        savePendingTarotQuestion(
          sessionStorage,
          question,
          attempt?.requestId,
          spreadId,
        );
        setFollowupStatus("short");
        return;
      }
      if (!res.ok) {
        setFollowupStatus("error");
        return;
      }
      const next = (await res.json()) as {
        answer: string;
        degraded: boolean;
        charged: number;
        free: boolean;
        balance: number;
        libraryId: string;
        followups: TarotFollowup[];
      };
      trackEvent(ANALYTICS_EVENT.tarotFollowupCompleted, {
        free: next.free ? 1 : 0,
      });
      if (next.charged > 0) {
        trackEvent(ANALYTICS_EVENT.creditUnlock, {
          product: "tarot_followup",
          surface: "tarot_followup",
          cost: next.charged,
          outcome: "unlocked",
        });
      }
      fbTrackCustom("TarotFollowupCompleted", {
        free: next.free ? 1 : 0,
        content_name: "tarot_followup",
      });
      setReading({ ...reading, followups: next.followups });
      setFollowupQuestion("");
      setFollowupStatus("idle");
    } catch {
      setFollowupStatus("error");
    }
  }

  function renderFollowup(inputId: string) {
    if (!reading?.libraryId) return null;
    return (
      <div className="rounded-2xl border border-border bg-background/35 p-4 sm:p-5">
        <div className="text-sm font-semibold text-foreground">
          {en ? "Go deeper into this spread" : "ჩაუღრმავდი ამ გაშლას"}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {en
            ? "About the same cards — no new spread is drawn."
            : "იგივე კარტებზე — ახალი გაშლა არ იშლება."}{" "}
          {reading.followups.length === 0
            ? en
              ? "Your first follow-up is free."
              : "პირველი დაზუსტება უფასოა."
            : en
              ? `Next follow-up — ${CREDIT_COST.tarotFollowup} credits.`
              : `შემდეგი დაზუსტება — ${CREDIT_COST.tarotFollowup} კრედიტი.`}
        </p>

        {reading.followups.map((followup, index) => (
          <div
            key={index}
            className="mt-3 rounded-xl border border-border/60 bg-background/40 p-3"
          >
            <p className="text-xs font-medium text-[var(--vivida-violet)]">
              {followup.question}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {followup.answer}
            </p>
          </div>
        ))}

        <div className="mt-3 flex flex-wrap gap-2">
          {FOLLOWUP_SUGGESTIONS[locale].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => askFollowup(suggestion)}
              disabled={followupStatus === "sending"}
              className="rounded-full border border-border bg-card/55 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:bg-card/80 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id={inputId}
            type="text"
            value={followupQuestion}
            onChange={(e) => setFollowupQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") askFollowup();
            }}
            disabled={followupStatus === "sending"}
            maxLength={300}
            placeholder={
              en
                ? "For example: How does this connect to my situation?"
                : "მაგ: ეს ჩემს სიტუაციას როგორ უკავშირდება?"
            }
            className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[var(--vivida-violet)]/60"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => askFollowup()}
            disabled={
              followupStatus === "sending" || followupQuestion.trim().length < 3
            }
            className="shrink-0 gap-1.5"
          >
            {followupStatus === "sending" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {en ? "Ask" : "კითხვა"}
          </Button>
        </div>

        {followupStatus === "short" && (
          <div className="mt-3 rounded-2xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-4 text-center text-sm">
            <ContextualPaywallActions
              locale={locale}
              balance={followupShort.balance}
              cost={followupShort.cost}
              product="tarot_followup"
              returnTo="/taro"
              placement="tarot_followup_short"
              countryCode={countryCode}
            />
          </div>
        )}
        {followupStatus === "error" && (
          <p className="mt-2 text-sm text-[var(--vivida-pink)]">
            {en
              ? "Something went wrong. Please try again."
              : "რაღაც ვერ მოხერხდა — სცადე ხელახლა."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--vivida-violet)]/50 bg-gradient-to-br from-[var(--vivida-violet)]/16 via-card/70 to-[var(--vivida-cyan)]/12 p-5 shadow-[0_28px_90px_-48px_rgba(141,103,255,0.9)] ring-1 ring-white/10 backdrop-blur-xl sm:p-8">
      {/* Previous questions — reopen a spread (reply) or start fresh. */}
      {authed && history !== null && history.length > 0 && (
        <div className="mb-4 rounded-2xl border border-border/60 bg-background/35">
          <button
            type="button"
            onClick={() => setHistoryOpen((open) => !open)}
            aria-expanded={historyOpen}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground/85"
          >
            <History className="size-4 text-[var(--vivida-violet)]" />
            {en ? "Previous questions" : "წინა კითხვები"}
            <span className="text-xs text-muted-foreground">
              · {history.length}
            </span>
            <ChevronDown
              className={`ml-auto size-4 text-muted-foreground transition-transform ${historyOpen ? "rotate-180" : ""}`}
            />
          </button>
          {historyOpen && (
            <ul className="max-h-56 space-y-1 overflow-y-auto px-2 pb-2">
              {history.map((item) => {
                const active = item.id === activeHistoryId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => loadHistoryItem(item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-[var(--vivida-violet)]/15 text-foreground"
                          : "text-foreground/80 hover:bg-card/70"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {item.question}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(
                          en ? "en-US" : "ka-GE",
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {activeHistoryId && (
            <div className="px-4 pb-3">
              <button
                type="button"
                onClick={reset}
                className="text-xs font-medium text-[var(--vivida-violet)] hover:underline"
              >
                {en ? "＋ New question" : "＋ ახალი კითხვა"}
              </button>
            </div>
          )}
        </div>
      )}
      {/* Spread picker */}
      <div
        className="mb-3 flex flex-wrap gap-2"
        role="group"
        aria-label={en ? "Spread type" : "გაშლის ტიპი"}
      >
        {TAROT_SPREADS.map((spread) => (
          <button
            key={spread.id}
            type="button"
            onClick={() => setSpreadId(spread.id)}
            disabled={status === "drawing" || !!reading?.fromHistory}
            aria-pressed={spreadId === spread.id}
            className={`rounded-full border px-3.5 py-2 text-sm transition-colors disabled:opacity-50 ${
              spreadId === spread.id
                ? "border-[var(--vivida-violet)]/60 bg-[var(--vivida-violet)]/15 text-foreground"
                : "border-border bg-card/55 text-foreground/70 hover:bg-card/80"
            }`}
          >
            {spread.name[locale]}
          </button>
        ))}
      </div>
      {/* Question box */}
      {reading?.fromHistory ? (
        <>
          <div className="block text-sm font-medium text-foreground/90">
            {en ? "Question" : "კითხვა"}
          </div>
          <div className="mt-2 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground/85">
            {question}
          </div>
          <div className="mt-4">{renderFollowup("tarot-followup-top")}</div>
        </>
      ) : (
        <>
          <label
            htmlFor="tarot-question"
            className="block text-base font-semibold text-foreground"
          >
            {en ? "Your question" : "შენი კითხვა"}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="tarot-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask();
              }}
              disabled={status === "drawing"}
              maxLength={300}
              placeholder={
                en
                  ? "For example: What should I understand about this relationship?"
                  : "მაგ: რას მიპირებს ეს ურთიერთობა?"
              }
              className="min-h-14 w-full rounded-2xl border border-[var(--vivida-violet)]/55 bg-[#09091a]/90 px-5 py-4 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_35px_-24px_rgba(141,103,255,0.9)] outline-none ring-1 ring-white/5 transition placeholder:text-muted-foreground/65 focus:border-[#c4adff] focus:ring-4 focus:ring-[var(--vivida-violet)]/15"
            />
            <Button
              type="button"
              variant="mystic"
              onClick={ask}
              disabled={status === "drawing" || question.trim().length < 3}
              className="min-h-14 shrink-0 gap-2 rounded-2xl px-6 text-base shadow-[0_16px_36px_-20px_rgba(201,88,164,0.9)]"
            >
              {status === "drawing" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {en ? "Draw the cards" : "გაშალე კარტები"}
            </Button>
          </div>
        </>
      )}
      {spreadId === "choice" && !reading && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            id="tarot-option-a"
            type="text"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            disabled={status === "drawing"}
            maxLength={100}
            placeholder={en ? "Option A" : "ვარიანტი A"}
            className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[var(--vivida-violet)]/60"
          />
          <input
            id="tarot-option-b"
            type="text"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            disabled={status === "drawing"}
            maxLength={100}
            placeholder={en ? "Option B" : "ვარიანტი B"}
            className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[var(--vivida-violet)]/60"
          />
        </div>
      )}
      <div className="mt-2">
        <CreditHint>
          {en
            ? `Your first question is free, then ${cost} credits`
            : `პირველი კითხვა უფასოა, შემდეგ −${cost} კრედიტი`}
        </CreditHint>
      </div>

      {/* Short-balance prompt */}
      {status === "short" && (
        <div className="mt-5 rounded-2xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-4 text-center text-sm">
          <ContextualPaywallActions
            locale={locale}
            balance={shortBalance}
            cost={cost}
            product="tarot"
            returnTo="/taro"
            placement="tarot_shortfall"
            countryCode={countryCode}
          />
        </div>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-[var(--vivida-pink)]">
          {en
            ? "Something went wrong. Please try again."
            : "რაღაც ვერ მოხერხდა — სცადე ხელახლა."}
        </p>
      )}

      {/* Drawing shimmer */}
      {status === "drawing" && (
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="vivida-pulse-soft aspect-[2/3] rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10"
            />
          ))}
        </div>
      )}

      {/* Reading */}
      {reading && status === "idle" && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {reading.cards.map((c, i) => (
              <TarotCardFace key={i} card={c} delayMs={i * 140} />
            ))}
          </div>

          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {
                (tarotSpreadById(reading.spreadId)?.name ?? {
                  ka: "ტარო",
                  en: "Tarot",
                })[locale]
              }
            </div>
            <h3 className="mt-1 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              {reading.headline}
            </h3>
          </div>

          {reading.degraded && (
            <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-sm leading-relaxed text-foreground/90">
              {en
                ? "The personalized AI interpretation was temporarily unavailable, so this reading is built from the cards' core meanings."
                : "პერსონალური AI განმარტება დროებით მიუწვდომელი იყო, ამიტომ ეს პასუხი კარტების ძირითად მნიშვნელობებზეა აგებული."}
            </p>
          )}

          <div className="space-y-2.5">
            {reading.cards.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-background/35 px-4 py-3"
              >
                <div className="text-xs font-medium text-[var(--vivida-violet)]">
                  {c.position} · {c.name}
                  {c.reversed && (en ? " (reversed)" : " (შებრუნებული)")}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                  {c.interpretation}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5">
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {reading.reading}
            </p>
            {reading.advice && (
              <p className="mt-3 flex gap-2 text-sm font-medium text-[var(--vivida-cyan)]">
                <Sparkles className="size-4 shrink-0" />
                {reading.advice}
              </p>
            )}
          </div>

          {/* Follow-up — a next question on the same cards, no new spread. */}
          {reading.libraryId &&
            !reading.fromHistory &&
            renderFollowup("tarot-followup")}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {!reading.fromHistory && (
              <span className="text-xs text-muted-foreground">
                {reading.free
                  ? en
                    ? "First reading — free ✦"
                    : "პირველი კითხვა — უფასო ✦"
                  : en
                    ? `−${reading.charged} credits · ${reading.balance} remaining`
                    : `−${reading.charged} კრედიტი · ბალანსი ${reading.balance}`}
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              {reading.libraryId && (
                <Button asChild variant="outline" className="gap-1.5">
                  <Link href={`/library/${reading.libraryId}`}>
                    <BookOpen className="size-4" />
                    {en ? "Saved" : "შენახულია"}
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                className="gap-1.5"
              >
                <RotateCcw className="size-4" />
                {en ? "New question" : "ახალი კითხვა"}
              </Button>
            </div>
          </div>

          {authed && !premium && !reading.fromHistory && (
            reading.balance >= cost ? (
              <div className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-4 text-center">
                <p className="text-sm font-medium text-foreground/90">
                  {en
                    ? `You have ${reading.balance} credits — enough for ${Math.floor(reading.balance / cost)} more reading${Math.floor(reading.balance / cost) === 1 ? "" : "s"}.`
                    : `შენ გაქვს ${reading.balance} კრედიტი — კიდევ ${Math.floor(reading.balance / cost)} კითხვა შეგიძლია.`}
                </p>
                <Button
                  type="button"
                  variant="mystic"
                  onClick={reset}
                  className="mt-3 gap-1.5"
                >
                  <RotateCcw className="size-4" />
                  {en ? "Ask another question" : "დასვი ახალი კითხვა"}
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-4 text-center">
                <ContextualPaywallActions
                  locale={locale}
                  balance={reading.balance}
                  cost={cost}
                  product="tarot"
                  returnTo="/taro"
                  placement="tarot_result_next_step"
                  countryCode={countryCode}
                />
              </div>
            )
          )}

          {/* Free second-action rail — a next step at the peak-engagement
              moment, instead of dead-ending at the credit-gated new question. */}
          <div className="border-t border-border/40 pt-5 text-center">
            <p className="text-xs text-muted-foreground">
              {en ? "Or keep exploring" : "ან განაგრძე"}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                {en ? "Daily horoscope" : "დღის ჰოროსკოპი"}
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                {en ? "My natal chart" : "ჩემი ნატალური რუკა"}
              </Link>
              <Link
                href="/tests"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                {en ? "Tests" : "ტესტები"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A single revealed card — illustration with a styled fallback back. */
function TarotCardFace({
  card,
  delayMs,
}: {
  card: SpreadCard;
  delayMs: number;
}) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <figure
      className="tarot-card-in overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-[oklch(0.18_0.05_285)] ring-1 ring-foreground/10"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className={`relative aspect-[2/3] ${card.reversed ? "rotate-180" : ""}`}
      >
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image || `/tarot/${card.slug}.webp`}
            alt={card.name}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-[radial-gradient(70%_60%_at_50%_30%,oklch(0.32_0.14_300/0.6),transparent_70%)] p-2 text-center">
            <span className="text-3xl">{card.glyph}</span>
            <span className="text-[10px] font-medium leading-tight text-foreground/80">
              {card.name}
            </span>
          </div>
        )}
      </div>
      <figcaption
        className={`px-2 py-1.5 text-center text-[10px] font-medium text-foreground/85 ${
          card.reversed ? "" : ""
        }`}
      >
        {card.name}
      </figcaption>
    </figure>
  );
}
