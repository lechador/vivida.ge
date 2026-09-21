"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

import { CreditHint } from "@/components/credits/credit-hint";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import {
  chartStarterOptions,
  chartStarterText,
  type ChartStarterId,
} from "@/lib/chart-chat-starters";
import { ContextualPaywallActions } from "@/components/billing/contextual-paywall-actions";

type Msg = { role: "user" | "assistant"; content: string };

/** Client-side composer cap — mirrors MAX_MESSAGE_LEN in app/api/ask/route.ts. */
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

export function ChartChat({
  initialMessages,
  initialStarter,
  firstName,
  locale = "ka",
}: {
  initialMessages: Msg[];
  initialStarter?: ChartStarterId;
  firstName: string | null;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const starters = chartStarterOptions(locale);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState(() =>
    initialStarter ? chartStarterText(initialStarter, locale) : "",
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tracked separately from the message so the 402 branch can also offer
  // the standard invite/top-up CTA, like every other credit gate.
  const [needsCredits, setNeedsCredits] = useState(false);
  const [creditShortfall, setCreditShortfall] = useState({
    balance: 0,
    cost: 2,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  /** History rendered on open never animates / smooth-scrolls. */
  const [initialCount] = useState(initialMessages.length);
  const openedRef = useRef(false);
  /** False once the reader scrolls up — streaming won't yank them back. */
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

  // New turns glide to the bottom — unless the reader scrolled up to read.
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
        body: JSON.stringify({ message: msg }),
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
      {/* Messages — the only scrolling region, so the header and composer
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
                ? "ask me anything about your chart — personality, emotions, relationships, career or timing."
                : "დამისვი შეკითხვა შენი რუკის შესახებ — ხასიათი, ემოციები, ურთიერთობები, კარიერა თუ დრო."}
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

      {/* Composer — pinned at the bottom of the chat panel */}
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
          <CreditHint>
            {en
              ? "2 free questions per day, then −2 credits"
              : "დღეში 2 უფასო შეკითხვა, შემდეგ −2 კრედიტი"}
          </CreditHint>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
          {en
            ? "AI astrologers can be wrong—use this for reflection, not decisions."
            : "AI ასტროლოგი ცდება — გამოიყენე რეფლექსიისთვის, არა გადაწყვეტილებებისთვის."}
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
