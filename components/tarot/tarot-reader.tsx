"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  History,
  Loader2,
  Lock,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreditHint } from "@/components/credits/credit-hint";
import { TarotCardBackIllustration } from "@/components/brand/celestial-icons";
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
import { normalizeTarotFollowupSuggestions } from "@/lib/tarot/followup-suggestions";
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
/** Free teaser from a 402: drawn card art/positions, no interpretations. */
type TarotTeaser = {
  spreadId: string;
  cards: Array<{
    slug: string;
    name: string;
    glyph: string;
    image: string;
    reversed: boolean;
    position: string;
  }>;
};
type Reading = {
  headline: string;
  cards: SpreadCard[];
  reading: string;
  advice: string;
  followupSuggestions: string[];
  charged: number;
  free: boolean;
  balance: number;
  libraryId?: string;
  degraded: boolean;
  followups: TarotFollowup[];
  spreadId: string;
  spreadOptions?: { a: string; b: string };
  /** Loaded from history rather than freshly drawn, cost line stays hidden. */
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
    followupSuggestions?: string[];
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
  const [teaserPreview, setTeaserPreview] = useState<TarotTeaser | null>(null);
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
      followupSuggestions: normalizeTarotFollowupSuggestions(
        content.followupSuggestions,
        locale,
        (content.followups ?? []).map((followup) => followup.question),
      ),
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
    // credits twice, the API has no dedupe, so the guard lives here.
    if (status === "drawing") return;
    const q = question.trim();
    if (q.length < 3) return;
    if (!authed) {
      // The sign-in wall is the single biggest drop-off on this funnel,
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
    setTeaserPreview(null);
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
          preview?: TarotTeaser;
        };
        setShortBalance(typeof data.balance === "number" ? data.balance : 0);
        setTeaserPreview(
          data.preview && data.preview.cards?.length === 3
            ? data.preview
            : null,
        );
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
      setTeaserPreview(null);
      setActiveHistoryId(null);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setReading(null);
    setTeaserPreview(null);
    setQuestion("");
    setAttempt(null);
    setFollowupQuestion("");
    setFollowupStatus("idle");
    setStatus("idle");
    setActiveHistoryId(null);
  }

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
        followupSuggestions: string[];
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
      setReading({
        ...reading,
        followups: next.followups,
        followupSuggestions: normalizeTarotFollowupSuggestions(
          next.followupSuggestions,
          locale,
          next.followups.map((followup) => followup.question),
        ),
      });
      setFollowupQuestion("");
      setFollowupStatus("idle");
    } catch {
      setFollowupStatus("error");
    }
  }

  function renderFollowup(inputId: string) {
    if (!reading?.libraryId) return null;
    const followupSuggestions = normalizeTarotFollowupSuggestions(
      reading.followupSuggestions,
      locale,
      reading.followups.map((followup) => followup.question),
    );
    return (
      <div className="rounded-md border border-border bg-background/50 p-4 sm:p-5">
        <div className="text-sm font-semibold text-foreground">
          {en ? "Go deeper into this spread" : "ჩაუღრმავდი ამ გაშლას"}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {en
            ? "About the same cards, no new spread is drawn."
            : "იგივე კარტებზე, ახალი გაშლა არ იშლება."}
          {!premium &&
            (reading.followups.length === 0
              ? en
                ? " Your first follow-up is free."
                : " პირველი დაზუსტება უფასოა."
              : en
                ? ` Next follow-up, ${CREDIT_COST.tarotFollowup} credits.`
                : ` შემდეგი დაზუსტება, ${CREDIT_COST.tarotFollowup} კრედიტი.`)}
        </p>

        {reading.followups.map((followup, index) => (
          <div
            key={index}
            className="mt-3 rounded-sm border border-border bg-card p-3"
          >
            <p className="font-mono text-xs text-primary">
              {followup.question}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {followup.answer}
            </p>
          </div>
        ))}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {followupSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => askFollowup(suggestion)}
              disabled={followupStatus === "sending"}
              className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
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
            className="h-10 w-full rounded-md border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
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
          <div className="mt-3 rounded-md border border-border bg-card p-4 text-center text-sm">
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
          <p className="mt-2 text-sm text-destructive">
            {en
              ? "Something went wrong. Please try again."
              : "რაღაც ვერ მოხერხდა, სცადე ხელახლა."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-5 sm:p-8">
      {/* Previous questions, reopen a spread (reply) or start fresh. */}
      {authed && history !== null && history.length > 0 && (
        <div className="mb-5 rounded-md border border-border bg-background/50">
          <button
            type="button"
            onClick={() => setHistoryOpen((open) => !open)}
            aria-expanded={historyOpen}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground"
          >
            <History className="size-4 text-primary" />
            {en ? "Previous questions" : "წინა კითხვები"}
            <span className="font-mono text-xs text-muted-foreground">
              · {history.length}
            </span>
            <ChevronDown
              className={`ml-auto size-4 text-muted-foreground transition-transform ${historyOpen ? "rotate-180" : ""}`}
            />
          </button>
          {historyOpen && (
            <ul className="max-h-56 divide-y divide-border overflow-y-auto border-t border-border">
              {history.map((item) => {
                const active = item.id === activeHistoryId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => loadHistoryItem(item)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {item.question}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
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
            <div className="border-t border-border px-4 py-2.5">
              <button
                type="button"
                onClick={reset}
                className="font-mono text-xs text-primary hover:underline"
              >
                {en ? "＋ New question" : "＋ ახალი კითხვა"}
              </button>
            </div>
          )}
        </div>
      )}
      {/* Spread picker */}
      <div
        className="mb-4 inline-flex flex-wrap rounded-md border border-border bg-background/60 p-1"
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
            className={`rounded-sm px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              spreadId === spread.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {spread.name[locale]}
          </button>
        ))}
      </div>
      {/* Question box */}
      {reading?.fromHistory ? (
        <>
          <div className="block font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {en ? "Question" : "კითხვა"}
          </div>
          <div className="mt-2 rounded-md border border-border bg-background/60 px-4 py-3 text-sm text-foreground">
            {question}
          </div>
          <div className="mt-4">{renderFollowup("tarot-followup-top")}</div>
        </>
      ) : (
        <>
          <label
            htmlFor="tarot-question"
            className="block font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
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
              className="min-h-12 w-full rounded-md border border-border bg-background px-4 py-3 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            <Button
              type="button"
              onClick={ask}
              disabled={status === "drawing" || question.trim().length < 3}
              className="min-h-12 shrink-0 gap-2 px-6 text-sm"
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
            className="h-10 w-full rounded-md border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <input
            id="tarot-option-b"
            type="text"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            disabled={status === "drawing"}
            maxLength={100}
            placeholder={en ? "Option B" : "ვარიანტი B"}
            className="h-10 w-full rounded-md border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      )}
      <div className="mt-2.5">
        {!premium && (
          <CreditHint>
            {en
              ? `Your first question is free, then ${cost} credits`
              : `პირველი კითხვა უფასოა, შემდეგ −${cost} კრედიტი`}
          </CreditHint>
        )}
      </div>

      {/* Short-balance prompt */}
      {status === "short" && (
        <div className="mt-8 space-y-5">
          {teaserPreview && (
            <TarotTeaserPreview preview={teaserPreview} locale={locale} />
          )}
          <div className="rounded-md border border-border bg-background/50 p-4 text-center text-sm">
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
        </div>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-destructive">
          {en
            ? "Something went wrong. Please try again."
            : "რაღაც ვერ მოხერხდა, სცადე ხელახლა."}
        </p>
      )}

      {/* Drawing shimmer with bespoke engraved SVG card backs */}
      {status === "drawing" && (
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="vivida-pulse-soft aspect-[2/3] overflow-hidden rounded-md border border-primary/40 bg-card"
            >
              <TarotCardBackIllustration />
            </div>
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

          <div className="border-b border-border pb-4 text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              {
                (tarotSpreadById(reading.spreadId)?.name ?? {
                  ka: "ტარო",
                  en: "Tarot",
                })[locale]
              }
            </div>
            <h3 className="mt-1.5 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              {reading.headline}
            </h3>
          </div>

          {reading.degraded && (
            <p className="rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-sm leading-relaxed text-foreground/90">
              {en
                ? "The personalized AI interpretation was temporarily unavailable, so this reading is built from the cards' core meanings."
                : "პერსონალური AI განმარტება დროებით მიუწვდომელი იყო, ამიტომ ეს პასუხი კარტების ძირითად მნიშვნელობებზეა აგებული."}
            </p>
          )}

          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background/40">
            {reading.cards.map((c, i) => (
              <div key={i} className="px-4 py-3.5">
                <div className="font-mono text-xs font-medium text-primary">
                  0{i + 1} · {c.position} · {c.name}
                  {c.reversed && (en ? " (reversed)" : " (შებრუნებული)")}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                  {c.interpretation}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-primary/35 bg-primary/[0.06] p-5">
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {reading.reading}
            </p>
            {reading.advice && (
              <p className="mt-3 flex gap-2 border-t border-border/60 pt-3 text-sm font-medium text-primary">
                <Sparkles className="mt-0.5 size-4 shrink-0" />
                {reading.advice}
              </p>
            )}
          </div>

          {/* Follow-up, a next question on the same cards, no new spread. */}
          {reading.libraryId &&
            !reading.fromHistory &&
            renderFollowup("tarot-followup")}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {!reading.fromHistory && (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {reading.free
                  ? en
                    ? "First reading · free"
                    : "პირველი კითხვა · უფასო"
                  : en
                    ? `−${reading.charged} credits · ${reading.balance} remaining`
                    : `−${reading.charged} კრედიტი · ბალანსი ${reading.balance}`}
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              {reading.libraryId && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href={`/library/${reading.libraryId}`}>
                    <BookOpen className="size-3.5" />
                    {en ? "Saved" : "შენახულია"}
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={reset}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                {en ? "New question" : "ახალი კითხვა"}
              </Button>
            </div>
          </div>

          {authed &&
            !premium &&
            !reading.fromHistory &&
            (reading.balance >= cost ? (
              <div className="rounded-md border border-border bg-background/50 p-4 text-center">
                <p className="text-sm font-medium text-foreground/90">
                  {en
                    ? `You have ${reading.balance} credits, enough for ${Math.floor(reading.balance / cost)} more reading${Math.floor(reading.balance / cost) === 1 ? "" : "s"}.`
                    : `შენ გაქვს ${reading.balance} კრედიტი, კიდევ ${Math.floor(reading.balance / cost)} კითხვა შეგიძლია.`}
                </p>
                <Button
                  type="button"
                  onClick={reset}
                  className="mt-3 gap-1.5"
                >
                  <RotateCcw className="size-4" />
                  {en ? "Ask another question" : "დასვი ახალი კითხვა"}
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-border bg-background/50 p-4 text-center">
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
            ))}

          {/* Free second-action rail */}
          <div className="border-t border-border pt-5 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {en ? "Or keep exploring" : "ან განაგრძე"}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {en ? "Daily horoscope" : "დღის ჰოროსკოპი"}
              </Link>
              <span aria-hidden className="text-border">
                ·
              </span>
              <Link
                href="/report"
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {en ? "My natal chart" : "ჩემი ნატალური რუკა"}
              </Link>
              <span aria-hidden className="text-border">
                ·
              </span>
              <Link
                href="/tests"
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
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

/** A single revealed card, illustration with a styled fallback back. */
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
      className="tarot-card-in overflow-hidden rounded-md border border-border bg-background"
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
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-secondary/40 p-2 text-center">
            <span className="text-3xl text-primary">{card.glyph}</span>
            <span className="text-[10px] font-medium leading-tight text-foreground/80">
              {card.name}
            </span>
          </div>
        )}
      </div>
      <figcaption className="border-t border-border px-2 py-1.5 text-center font-mono text-[10px] text-foreground/85">
        {card.name}
      </figcaption>
    </figure>
  );
}

/**
 * Free teaser on a 402: the exact spread the paid retry will interpret,
 * first card face-up, the other two face-down, every interpretation locked.
 */
export function TarotTeaserPreview({
  preview,
  locale,
}: {
  preview: TarotTeaser;
  locale: UserLocale;
}) {
  const en = locale !== "ka";

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.tarotTeaserShown, {
      widget: "tarot_reader",
      spread: preview.spreadId,
    });
  }, [preview.spreadId]);

  const [first, ...rest] = preview.cards;

  return (
    <div>
      <div className="text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          {en ? "Your spread is ready" : "შენი გაშლა მზადაა"}
        </div>
        <h3 className="mt-1 text-balance text-xl font-semibold tracking-tight">
          {en
            ? "The first card is face-up, the rest unlocks with the reading"
            : "პირველი კარტი ღიაა, დანარჩენი პასუხთან ერთად გაიხსნება"}
        </h3>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
        {first && (
          <div>
            <p className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {first.position}
            </p>
            <TarotCardFace
              card={{ ...first, interpretation: "" }}
              delayMs={0}
            />
          </div>
        )}
        {rest.map((card, i) => (
          <div key={i}>
            <p className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {card.position}
            </p>
            <TarotCardBack delayMs={(i + 1) * 140} />
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Lock className="size-3.5 text-primary" />
        {en
          ? "Card meanings and your personal answer unlock below"
          : "კარტების მნიშვნელობები და პირადი პასუხი ქვემოთ გაიხსნება"}
      </p>
    </div>
  );
}

/** Face-down card with bespoke engraved astrolabe SVG back. */
function TarotCardBack({ delayMs }: { delayMs: number }) {
  return (
    <div
      className="tarot-card-in aspect-[2/3] overflow-hidden rounded-md border border-primary/40 bg-card"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <TarotCardBackIllustration />
    </div>
  );
}
