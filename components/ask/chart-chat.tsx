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
      {/* Messages, the only scrolling region, so the header and composer
          stay put no matter how long the answer gets. */}
      <div
        ref={listRef}
        onScroll={handleListScroll}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1"
      >
        {empty && (
          <div className="relative overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/25 bg-card/55 p-6 text-center shadow-[0_8px_40px_-16px_var(--vivida-violet)] ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--vivida-violet),var(--vivida-pink),transparent)]"
            />
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] text-white shadow-lg shadow-[var(--vivida-violet)]/30">
              <Sparkles className="size-5" />
            </div>
            <p className="text-pretty text-[15px] leading-relaxed text-foreground/85">
              {firstName ? `${firstName}, ` : ""}
              {en
                ? "ask me anything about your chart, personality, emotions, relationships, career or timing."
                : "დამისვი შეკითხვა შენი რუკის შესახებ, ხასიათი, ემოციები, ურთიერთობები, კარიერა თუ დრო."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
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
                  className="rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-3.5 py-1.5 text-[13px] text-foreground/85 shadow-sm transition-all hover:-translate-y-px hover:bg-[var(--vivida-violet)]/20 hover:shadow"
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
                  className="rounded-full border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/10 px-3.5 py-1.5 text-[13px] text-foreground/85 shadow-sm transition-all hover:-translate-y-px hover:bg-[var(--vivida-cyan)]/20 hover:shadow"
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
              <div className="max-w-[85%] rounded-2xl rounded-br-md border border-white/15 bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white shadow-lg shadow-[var(--vivida-violet)]/20">
                {m.content}
              </div>
            </div>
          ) : (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${i >= initialCount ? "chat-msg-in" : ""}`}
            >
              <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-cyan))] text-white shadow-md shadow-[var(--vivida-violet)]/25">
                <Sparkles className="size-3.5" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-[var(--vivida-violet)]/15 bg-card/70 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 shadow-sm ring-1 ring-foreground/5 backdrop-blur-xl">
                {m.content || <TypingDots />}
              </div>
            </div>
          ),
        )}
      </div>

      {error && (
        <div className="mt-3 shrink-0">
          <p className="text-sm text-[var(--vivida-pink)]">{error}</p>
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
        <div className="mb-2 flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 px-3 py-2">
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
            className="flex-1 truncate text-left text-[13px] text-foreground/90 hover:underline"
          >
            {"↩ "}
            {followUp}
          </button>
          <button
            type="button"
            aria-label={en ? "Dismiss" : "დახურვა"}
            onClick={() => setFollowUpDismissed(true)}
            className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
        <div
          role="group"
          aria-label={en ? "Answer length" : "პასუხის სიგრძე"}
          className="flex rounded-full border border-border bg-card/70 p-0.5 text-[12px] backdrop-blur-xl"
        >
          {DEPTHS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => pickDepth(d)}
              aria-pressed={depth === d}
              className={`rounded-full px-3 py-1 transition-all ${
                depth === d
                  ? "bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] font-medium text-white shadow"
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
          className="flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-[12px] text-muted-foreground backdrop-blur-xl transition-colors hover:text-foreground"
        >
          <Brain className="size-3.5" />
          {en ? "Memory" : "მეხსიერება"}
        </button>
      </div>

      {memoryOpen && (
        <div className="mb-2 shrink-0 rounded-2xl border border-border bg-card/80 p-3.5 text-[13px] leading-relaxed backdrop-blur-xl">
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
                className={`mt-2.5 rounded-full border px-3 py-1 text-[12px] transition-colors disabled:opacity-50 ${
                  forgetArmed
                    ? "border-[var(--vivida-pink)]/50 bg-[var(--vivida-pink)]/15 text-foreground"
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
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
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
                    memory.nudgesEnabled
                      ? "bg-[var(--vivida-violet)]"
                      : "bg-foreground/15"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
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
        className="mt-4 shrink-0"
      >
        <div className="rounded-2xl border border-border bg-card/80 shadow-xl ring-1 ring-foreground/5 backdrop-blur-xl transition-shadow focus-within:border-[var(--vivida-violet)]/50 focus-within:shadow-[0_0_0_3px_var(--vivida-violet)/15,0_8px_40px_-16px_var(--vivida-violet)]">
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
              className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={sending || !input.trim() || overLimit}
              aria-label={en ? "Send" : "გაგზავნა"}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </div>
          {showCounter && (
            <div className="flex justify-end px-3 pb-1.5">
              <span
                id="chat-char-counter"
                className={`text-[11px] tabular-nums ${remaining < 0 || overLimit ? "text-[var(--vivida-pink)]" : remaining < 500 ? "text-muted-foreground" : "text-muted-foreground/70"}`}
              >
                {en
                  ? `${input.length.toLocaleString("en-US")} / ${CHAT_MAX_INPUT_LEN.toLocaleString("en-US")}`
                  : `${input.length.toLocaleString("ka-GE")} / ${CHAT_MAX_INPUT_LEN.toLocaleString("ka-GE")}`}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-center">
          {!premium && (
            <CreditHint>
              {en
                ? "2 free questions per day, then −2 credits"
                : "დღეში 2 უფასო შეკითხვა, შემდეგ −2 კრედიტი"}
            </CreditHint>
          )}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
          {en
            ? "AI astrologers can be wrong, use this for reflection, not decisions."
            : "AI ასტროლოგი ცდება, გამოიყენე რეფლექსიისთვის, არა გადაწყვეტილებებისთვის."}
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
          className="size-1.5 rounded-full bg-[var(--vivida-violet)]"
          style={{
            animation: "vivida-typing-bounce 1.2s infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}
