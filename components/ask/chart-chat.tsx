"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, Send, Sparkles, X } from "lucide-react";

import { CreditHint } from "@/components/credits/credit-hint";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  normalizeAskDepth,
  type AskDepth,
  type TopicStarter,
} from "@/lib/ask-memory-pure";
import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import {
  chartStarterOptions,
  chartStarterText,
  type ChartStarterId,
} from "@/lib/chart-chat-starters";
import { ContextualPaywallActions } from "@/components/billing/contextual-paywall-actions";

type Msg = { role: "user" | "assistant"; content: string };

/** Client-side composer cap, mirrors MAX_MESSAGE_LEN in app/api/ask/route.ts. */
export const CHAT_MAX_INPUT_LEN = 4000;
/** Counter appears once the draft gets long or nears the cap. */
const COUNTER_VISIBLE_FROM = 1200;

const ERRORS_KA: Record<string, string> = {
  rate_limited: "დღევანდელი ლიმიტი ამოიწურა. სცადე ხვალ.",
  no_chart: "ჯერ შენი რუკა უნდა შეიქმნას.",
  unavailable: "სერვისი დროებით მიუწვდომელია.",
  invalid_message: "შეტყობინება ცარიელია ან 4000 სიმბოლოზე გრძელია.",
  needs_credits:
    "ბალანსი არ არის საკმარისი. მოიწვიე მეგობარი ან შეავსე ბალანსი.",
};

const ERRORS_EN: Record<string, string> = {
  rate_limited: "You've reached today's limit. Try again tomorrow.",
  no_chart: "Create your natal chart first.",
  unavailable: "The service is temporarily unavailable.",
  invalid_message: "Your message is empty or longer than 4000 characters.",
  needs_credits: "You need more credits to ask another question.",
};

export type AskMemoryView = {
  summary: string;
  traits: { tone?: string; topics?: string[] };
  nudgesEnabled: boolean;
};

/** Device-level answer-depth preference (mirrors the server default "auto"). */
const DEPTH_KEY = "vivida_ask_depth_v1";

const DEPTHS: AskDepth[] = ["auto", "short", "detailed"];

export function ChartChat({
  initialMessages,
  initialStarter,
  firstName,
  locale = "ka",
  premium = false,
  followUp = null,
  topicStarters = [],
  initialMemory = null,
}: {
  initialMessages: Msg[];
  initialStarter?: ChartStarterId;
  firstName: string | null;
  locale?: UserLocale;
  /** PRO users bypass every credit gate, hide the free-allowance hint. */
  premium?: boolean;
  /** Proactive follow-up built from a remembered open loop (null when none). */
  followUp?: string | null;
  /** Chips built from remembered recurring topics (empty when none). */
  topicStarters?: TopicStarter[];
  /** Transparency snapshot of what the model remembers (null when nothing). */
  initialMemory?: AskMemoryView | null;
}) {
  const en = locale !== "ka";
  const starters = chartStarterOptions(locale);
  const depthLabels: Record<AskDepth, string> = en
    ? { auto: "Auto", short: "Brief", detailed: "Detailed" }
    : { auto: "ავტო", short: "მოკლედ", detailed: "დეტალურად" };
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState(() =>
    initialStarter ? chartStarterText(initialStarter, locale) : "",
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tracked separately from the message so the 402 branch can also offer
  // the standard invite/top-up CTA, like every other credit gate.
  const [needsCredits, setNeedsCredits] = useState(false);
  const [depth, setDepth] = useState<AskDepth>(() =>
    typeof window === "undefined"
      ? "auto"
      : normalizeAskDepth(window.localStorage.getItem(DEPTH_KEY)),
  );
  /** Proactive follow-up chip is dismissible per open. */
  const [followUpDismissed, setFollowUpDismissed] = useState(false);
  /** Transparency panel: what the model remembers + forget button. */
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [memory, setMemory] = useState<AskMemoryView | null>(initialMemory);
  const [forgetArmed, setForgetArmed] = useState(false);
  const [forgetting, setForgetting] = useState(false);

  function pickDepth(d: AskDepth) {
    setDepth(d);
    try {
      window.localStorage.setItem(DEPTH_KEY, d);
    } catch {
      /* private mode, preference just won't persist */
    }
  }

  async function forgetMemory() {
    if (!forgetArmed) {
      setForgetArmed(true);
      return;
    }
    setForgetting(true);
    try {
      const res = await fetch("/api/ask/memory", { method: "DELETE" });
      if (res.ok) {
        setMemory(null);
        setForgetArmed(false);
        setMemoryOpen(false);
      }
    } finally {
      setForgetting(false);
    }
  }

  async function toggleNudges() {
    if (!memory) return;
    const next = !memory.nudgesEnabled;
    setMemory({ ...memory, nudgesEnabled: next });
    try {
      const res = await fetch("/api/ask/memory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nudgesEnabled: next }),
      });
      if (!res.ok) throw new Error("toggle failed");
    } catch {
      setMemory({ ...memory, nudgesEnabled: !next });
    }
  }
  const [creditShortfall, setCreditShortfall] = useState({
    balance: 0,
    cost: 2,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  /** History rendered on open never animates / smooth-scrolls. */
  const [initialCount] = useState(initialMessages.length);
  const openedRef = useRef(false);
  /** False once the reader scrolls up, streaming won't yank them back. */
  const stickRef = useRef(true);

  // Open at the bottom instantly: no top-to-bottom scroll sweep through
  // the whole history. The panel itself fades up via .chat-panel-in.
  useEffect(() => {
    const el = listRef.current;
    if (el && !openedRef.current) {
      openedRef.current = true;
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // New turns glide to the bottom, unless the reader scrolled up to read.
  useEffect(() => {
    if (!openedRef.current || messages.length <= initialCount) return;
    const el = listRef.current;
    if (el && stickRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, initialCount]);

  function handleListScroll() {
    const el = listRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  // Auto-grow the composer up to its CSS cap.
  function autosize() {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(autosize, [input]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || sending) return;
    if (msg.length > CHAT_MAX_INPUT_LEN) {
      setError(
        (en ? ERRORS_EN : ERRORS_KA).invalid_message ??
          (en ? "Message too long." : "შეტყობინება ძალიან გრძელია."),
      );
      return;
    }
    setError(null);
    setNeedsCredits(false);
    setInput("");
    stickRef.current = true;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg },
      { role: "assistant", content: "" },
    ]);
    setSending(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, depth }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setError(
          (en ? ERRORS_EN : ERRORS_KA)[data.error] ??
            (en
              ? "Something went wrong. Please try again."
              : "რაღაც ვერ მოხერხდა. სცადე ხელახლა."),
        );
        const short = data.error === "needs_credits";
        setNeedsCredits(short);
        if (short) {
          setCreditShortfall({
            balance: typeof data.balance === "number" ? data.balance : 0,
            cost: typeof data.cost === "number" ? data.cost : 1,
          });
          trackEvent(ANALYTICS_EVENT.insufficientCredits, {
            product: "ai_chart_chat",
            surface: "chart_chat",
            cost: typeof data.cost === "number" ? data.cost : undefined,
          });
          trackEvent(ANALYTICS_EVENT.paywallViewed, {
            product: "ai_chart_chat",
            surface: "chart_chat_shortfall",
            cost: typeof data.cost === "number" ? data.cost : undefined,
          });
        }
        setMessages((prev) => prev.slice(0, -1)); // drop empty assistant bubble
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answeredChars = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        answeredChars += chunk.length;
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }
      // Stream finished without error = the user received a full answer.
      // (Error branches above return early, so this only fires on success.)
      if (answeredChars > 0) {
        trackEvent(ANALYTICS_EVENT.aiAnswerCompleted, {
          ...productEventBase("ai_chat", "chart_chat", locale),
          outcome: "answered",
        });
      }
    } catch {
      setError(
        en
          ? "Network error. Please try again."
          : "ქსელის შეცდომა. სცადე ხელახლა.",
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  const empty = messages.length === 0;
  const overLimit = input.trim().length > CHAT_MAX_INPUT_LEN;
  const showCounter =
    input.length >= COUNTER_VISIBLE_FROM ||
    CHAT_MAX_INPUT_LEN - input.length < 500;
  const remaining = CHAT_MAX_INPUT_LEN - input.length;

  return (
    <div className="chat-panel-in flex min-h-0 flex-1 flex-col">
      {/* Messages, the only scrolling region. The scrollbar itself is
          hidden on phones (see .chat-scroll) so the thread reads as a
          native chat surface rather than a page with a scroll track. */}
      <div
        ref={listRef}
        onScroll={handleListScroll}
        className="chat-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain pb-1 sm:space-y-5 sm:pr-1"
      >
        {empty && (
          <div className="rounded-md border border-border bg-card p-4 sm:p-8">
            {/* The page title already establishes context on phones, and
                this row is what pushed the starter chips off a short
                screen. Keep it as desktop chrome. */}
            <div className="mb-2.5 hidden items-center gap-2.5 sm:mb-3 sm:flex">
              <div className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-secondary/50 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {en ? "EPHEMERIS DIALOGUE" : "ასტროლოგიური დიალოგი"}
              </div>
            </div>
            <p className="text-pretty text-[15px] leading-relaxed text-foreground/90 sm:text-base">
              {firstName ? `${firstName}, ` : ""}
              {en
                ? "ask anything about your natal chart, personality, emotional patterns, relationships, career, or transit timing."
                : "დამისვი შეკითხვა შენი რუკის შესახებ: ხასიათი, ემოციები, ურთიერთობები, კარიერა თუ დრო."}
            </p>
            {/* Two columns on phones as well: four full-width chips are
                taller than the visible thread on short screens. */}
            <div className="mt-4 grid grid-cols-2 gap-1.5 sm:mt-5 sm:gap-2">
              {starters.map((starter) => (
                <button
                  key={starter.id}
                  type="button"
                  onClick={() => {
                    trackEvent(ANALYTICS_EVENT.recommendationClicked, {
                      placement: "chart_chat_starter",
                      destination: "ai_chart_chat",
                      product: "ai_chart_chat",
                      recommendation: starter.id,
                    });
                    void send(starter.text);
                  }}
                  className="rounded-sm border border-border bg-secondary/30 px-3 py-2 text-left text-[14px] text-foreground/85 transition-colors hover:border-primary/40 hover:bg-secondary/60 hover:text-foreground sm:px-3.5 sm:py-2.5 sm:text-sm"
                >
                  {starter.text}
                </button>
              ))}
              {topicStarters.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => {
                    trackEvent(ANALYTICS_EVENT.recommendationClicked, {
                      placement: "chart_chat_topic",
                      destination: "ai_chart_chat",
                      product: "ai_chart_chat",
                      recommendation: topic.label,
                    });
                    void send(topic.prompt);
                  }}
                  className="rounded-sm border border-primary/30 bg-primary/8 px-3 py-2 text-left text-[14px] text-foreground/90 transition-colors hover:bg-primary/15 sm:px-3.5 sm:py-2.5 sm:text-sm"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div
              key={i}
              className={`flex justify-end ${i >= initialCount ? "chat-msg-in" : ""}`}
            >
              <div className="max-w-[88%] rounded-md border border-primary/35 bg-primary/14 px-3.5 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground sm:max-w-[85%] sm:px-4 sm:py-3 sm:text-base">
                {m.content}
              </div>
            </div>
          ) : (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${i >= initialCount ? "chat-msg-in" : ""}`}
            >
              <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm border border-border bg-secondary/60 text-primary">
                <Sparkles className="size-3.5" />
              </div>
              <div className="max-w-[88%] rounded-md border border-border bg-card px-3.5 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground/90 sm:max-w-[85%] sm:px-4 sm:py-3 sm:text-base">
                {m.content || <TypingDots />}
              </div>
            </div>
          ),
        )}
      </div>

      {error && (
        <div className="mt-3 shrink-0">
          <p className="text-sm text-destructive">{error}</p>
          {needsCredits && (
            <div className="mt-2">
              <ContextualPaywallActions
                locale={locale}
                balance={creditShortfall.balance}
                cost={creditShortfall.cost}
                product="ai_chart_chat"
                returnTo="/ask"
                placement="chart_chat_shortfall"
              />
            </div>
          )}
        </div>
      )}

      {/* Composer, pinned at the bottom of the chat panel */}
      {followUp && !followUpDismissed && (
        <div className="mb-2 flex shrink-0 items-center gap-2 rounded-sm border border-primary/30 bg-primary/8 px-3 py-1.5 sm:py-2">
          <button
            type="button"
            onClick={() => {
              trackEvent(ANALYTICS_EVENT.recommendationClicked, {
                placement: "chart_chat_followup",
                destination: "ai_chart_chat",
                product: "ai_chart_chat",
                recommendation: "open_loop",
              });
              setFollowUpDismissed(true);
              void send(followUp);
            }}
            className="flex-1 truncate text-left text-[14px] text-foreground/90 hover:underline sm:text-sm"
          >
            {"↩ "}
            {followUp}
          </button>
          <button
            type="button"
            aria-label={en ? "Dismiss" : "დახურვა"}
            onClick={() => setFollowUpDismissed(true)}
            className="grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 sm:mb-2">
        <div
          role="group"
          aria-label={en ? "Answer length" : "პასუხის სიგრძე"}
          className="inline-flex rounded-sm border border-border bg-card p-0.5 text-[12px]"
        >
          {DEPTHS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => pickDepth(d)}
              aria-pressed={depth === d}
              className={`rounded-xs px-2 py-1 transition-colors sm:px-3 ${
                depth === d
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {depthLabels[d]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setForgetArmed(false);
            setMemoryOpen((v) => !v);
          }}
          aria-expanded={memoryOpen}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm border border-border bg-card px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground sm:px-3"
        >
          <Brain className="size-3.5" />
          {en ? "Memory" : "მეხსიერება"}
        </button>
      </div>

      {memoryOpen && (
        <div className="chat-scroll mb-2 max-h-[38dvh] shrink-0 overflow-y-auto rounded-md border border-border bg-card p-3.5 text-[13px] leading-relaxed sm:max-h-[45dvh]">
          <p className="mb-1.5 font-medium text-foreground/90">
            {en ? "What I remember about you" : "რა მახსოვს შენზე"}
          </p>
          {memory ? (
            <>
              <p className="text-foreground/80">{memory.summary}</p>
              {(memory.traits.tone || memory.traits.topics?.length) && (
                <p className="mt-1.5 text-muted-foreground">
                  {[
                    memory.traits.tone
                      ? en
                        ? `Tone: ${memory.traits.tone}`
                        : `ტონი: ${memory.traits.tone}`
                      : null,
                    memory.traits.topics?.length
                      ? en
                        ? `Topics: ${memory.traits.topics.join(", ")}`
                        : `თემები: ${memory.traits.topics.join(", ")}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <button
                type="button"
                onClick={() => void forgetMemory()}
                disabled={forgetting}
                className={`mt-2.5 rounded-sm border px-3 py-1 text-[12px] transition-colors disabled:opacity-50 ${
                  forgetArmed
                    ? "border-destructive/50 bg-destructive/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {forgetting
                  ? "…"
                  : forgetArmed
                    ? en
                      ? "Tap again to confirm forgetting"
                      : "დააწკაპე კიდევ ერთხელ დასადასტურებლად"
                    : en
                      ? "Forget everything about me"
                      : "დაავიწყე ჩემ შესახებ ყველაფერი"}
              </button>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                <span className="text-muted-foreground">
                  {en ? "Proactive check-ins" : "პროაქტიული შეხსენებები"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={memory.nudgesEnabled}
                  aria-label={
                    en ? "Proactive check-ins" : "პროაქტიული შეხსენებები"
                  }
                  onClick={() => void toggleNudges()}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    memory.nudgesEnabled ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition-all ${
                      memory.nudgesEnabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              {en
                ? "Nothing remembered yet, after a few conversations your astrologer will start recognizing you here."
                : "ჯერ არაფერი მახსოვს, რამდენიმე საუბრის მერე შენი ასტროლოგი აქ გიცნობს."}
            </p>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-2 shrink-0 sm:mt-3"
      >
        <div className="rounded-md border border-border bg-card transition-colors focus-within:border-primary/60">
          <div className="flex items-end gap-2 p-2">
            <textarea
              ref={composerRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              maxLength={CHAT_MAX_INPUT_LEN + 200}
              placeholder={en ? "Write your question…" : "დაწერე შეკითხვა…"}
              disabled={sending}
              aria-describedby="chat-char-counter"
              className="max-h-[35dvh] min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-base leading-relaxed outline-none placeholder:text-muted-foreground sm:max-h-[200px]"
            />
            <button
              type="submit"
              disabled={sending || !input.trim() || overLimit}
              aria-label={en ? "Send" : "გაგზავნა"}
              className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </div>
          {showCounter && (
            <div className="flex justify-end px-3 pb-1.5">
              <span
                id="chat-char-counter"
                className={`font-mono text-[11px] tabular-nums ${remaining < 0 || overLimit ? "text-destructive" : remaining < 500 ? "text-muted-foreground" : "text-muted-foreground/70"}`}
              >
                {en
                  ? `${input.length.toLocaleString("en-US")} / ${CHAT_MAX_INPUT_LEN.toLocaleString("en-US")}`
                  : `${input.length.toLocaleString("ka-GE")} / ${CHAT_MAX_INPUT_LEN.toLocaleString("ka-GE")}`}
              </span>
            </div>
          )}
        </div>
        <div className="mt-1.5 flex justify-center sm:mt-2">
          {!premium && (
            <CreditHint>
              {en
                ? "2 free questions per day, then −2 credits"
                : "დღეში 2 უფასო შეკითხვა, შემდეგ −2 კრედიტი"}
            </CreditHint>
          )}
        </div>
        <p className="mt-1 text-center text-[11px] leading-snug text-muted-foreground sm:mt-1.5">
          {en
            ? "Astrological interpretations are for reflection, not high-stakes decisions."
            : "ასტროლოგიური ანალიზი განკუთვნილია რეფლექსიისთვის, არა გადაწყვეტილებებისთვის."}
        </p>
      </form>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-primary"
          style={{
            animation: "vivida-typing-bounce 1.2s infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}
