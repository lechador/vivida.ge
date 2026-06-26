"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const ERRORS: Record<string, string> = {
  rate_limited: "დღევანდელი ლიმიტი ამოიწურა. სცადე ხვალ.",
  no_chart: "ჯერ შენი რუკა უნდა შეიქმნას.",
  unavailable: "სერვისი დროებით მიუწვდომელია.",
  invalid_message: "შეტყობინება ცარიელია ან ძალიან გრძელია.",
};

const STARTERS = [
  "რა არის ჩემი ძლიერი მხარეები?",
  "რას ამბობს ჩემი მთვარე ემოციებზე?",
  "როგორი ვარ ურთიერთობებში?",
  "რა მირჩევნია კარიერაში?",
];

export function ChartChat({
  initialMessages,
  firstName,
}: {
  initialMessages: Msg[];
  firstName: string | null;
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || sending) return;
    setError(null);
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
        setError(ERRORS[data.error] ?? "რაღაც ვერ მოხერხდა. სცადე ხელახლა.");
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
      setError("ქსელის შეცდომა. სცადე ხელახლა.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="flex flex-col">
      {/* Messages */}
      <div className="min-h-[40vh] space-y-4">
        {empty && (
          <div className="rounded-2xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
            <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
            <p className="text-pretty text-base text-foreground/85">
              {firstName ? `${firstName}, ` : ""}დამისვი შეკითხვა შენი რუკის შესახებ —
              ხასიათი, ემოციები, ურთიერთობები, კარიერა თუ დრო.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {STARTERS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-3 py-1.5 text-sm text-foreground/85 transition-colors hover:bg-[var(--vivida-violet)]/20"
                >
                  {q}
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
        <p className="mt-3 text-sm text-[var(--vivida-pink)]">{error}</p>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 mt-5"
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
            placeholder="დაწერე შეკითხვა…"
            disabled={sending}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="გაგზავნა"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] text-white shadow-md transition-opacity disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          AI ასტროლოგი ცდება — გამოიყენე რეფლექსიისთვის, არა გადაწყვეტილებებისთვის.
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
