"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Sparkles, Users } from "lucide-react";

import { CreditHint } from "@/components/credits/credit-hint";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import {
  chartStarterOptions,
  chartStarterText,
  type ChartStarterId,
} from "@/lib/chart-chat-starters";

type Msg = { role: "user" | "assistant"; content: string };

const ERRORS_KA: Record<string, string> = {
  rate_limited: "დღევანდელი ლიმიტი ამოიწურა. სცადე ხვალ.",
  no_chart: "ჯერ შენი რუკა უნდა შეიქმნას.",
  unavailable: "სერვისი დროებით მიუწვდომელია.",
  invalid_message: "შეტყობინება ცარიელია ან ძალიან გრძელია.",
  needs_credits: "ბალანსი არ არის საკმარისი. მოიწვიე მეგობარი ან შეავსე ბალანსი.",
};

const ERRORS_EN: Record<string, string> = {
  rate_limited: "You've reached today's limit. Try again tomorrow.",
  no_chart: "Create your natal chart first.",
  unavailable: "The service is temporarily unavailable.",
  invalid_message: "Your message is empty or too long.",
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
  const am = locale === "am";
  const starters = chartStarterOptions(locale);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState(() =>
    initialStarter ? chartStarterText(initialStarter, locale) : ""
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tracked separately from the message so the 402 branch can also offer
  // the standard invite/top-up CTA, like every other credit gate.
  const [needsCredits, setNeedsCredits] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || sending) return;
    setError(null);
    setNeedsCredits(false);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }, { role: "assistant", content: "" }]);
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
            (am ? "Ինչ-որ բան այն չէր։ Խնդրում ենք նորից փորձել։" : en ? "Something went wrong. Please try again." : "რაღაც ვერ მოხერხდა. სცადე ხელახლა."),
        );
        const short = data.error === "needs_credits";
        setNeedsCredits(short);
        if (short) {
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
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }
    } catch {
      setError(am ? "Ցանցի սխալ։ Խնդրում ենք նորից փորձել։" : en ? "Network error. Please try again." : "ქსელის შეცდომა. სცადე ხელახლა.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages — the only scrolling region, so the header and composer
          stay put no matter how long the answer gets. */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {empty && (
          <div className="rounded-2xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
            <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
            <p className="text-pretty text-base text-foreground/85">
              {firstName ? `${firstName}, ` : ""}
              {en
                ? "ask me anything about your chart—personality, emotions, relationships, career or timing."
                : "დამისვი შეკითხვა შენი რუკის შესახებ — ხასიათი, ემოციები, ურთიერთობები, კარიერა თუ დრო."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
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
                  className="rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-3 py-1.5 text-sm text-foreground/85 transition-colors hover:bg-[var(--vivida-violet)]/20"
                >
                  {starter.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-2.5 text-sm text-white shadow-md">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
                <Sparkles className="size-3.5" />
              </div>
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-card/60 px-4 py-2.5 text-sm leading-relaxed text-foreground/90 ring-1 ring-foreground/5 backdrop-blur-xl">
                {m.content || <TypingDots />}
              </div>
            </div>
          )
        )}
        <div ref={scrollRef} />
      </div>

      {error && (
        <div className="mt-3 shrink-0">
          <p className="text-sm text-[var(--vivida-pink)]">{error}</p>
          {needsCredits && (
            <Link
              href="/credits"
              onClick={() =>
                trackEvent(ANALYTICS_EVENT.recommendationClicked, {
                  placement: "chart_chat_shortfall",
                  destination: "credits",
                  product: "ai_chart_chat",
                })
              }
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/12 px-3 py-1.5 text-sm text-foreground/90 transition-colors hover:bg-[var(--vivida-violet)]/20"
            >
              <Users className="size-4" />
              {am ? "Հրավիրել / լիցքավորել" : en ? "Invite / top up" : "მოიწვიე / შეავსე"}
            </Link>
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
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-xl ring-1 ring-foreground/5 backdrop-blur-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={am ? "Գրեք ձեր հարցը…" : en ? "Write your question…" : "დაწერე შეკითხვა…"}
            disabled={sending}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label={am ? "Ուղարկել" : en ? "Send" : "გაგზავნა"}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] text-white shadow-md transition-opacity disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
        <div className="mt-2 flex justify-center">
          <CreditHint>
            {am ? "Օրական 2 անվճար հարց, այնուհետև −1 կրեդիտ" : en ? "2 free questions per day, then −1 credit" : "დღეში 2 უფასო შეკითხვა, შემდეგ −1 კრედიტი"}
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
          style={{ animation: "vivida-typing-bounce 1.2s infinite", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
