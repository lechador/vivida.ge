"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Sparkles, Users, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreditHint } from "@/components/credits/credit-hint";
import { trackEvent } from "@/lib/analytics";

type SpreadCard = {
  slug: string;
  nameKa: string;
  glyph: string;
  reversed: boolean;
  positionKa: string;
  interpretationKa: string;
};
type Reading = {
  headline: string;
  cards: SpreadCard[];
  reading: string;
  advice: string;
  charged: number;
  free: boolean;
  balance: number;
};

/**
 * Interactive tarot reader. Auth-gated (the free-then-credits gate needs an
 * account); signed-out visitors see the whole page for SEO but the ask button
 * routes them to sign-in. First reading free, then `cost` credits each.
 */
export function TarotReader({
  authed,
  cost,
}: {
  authed: boolean;
  cost: number;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<Reading | null>(null);
  const [status, setStatus] = useState<"idle" | "drawing" | "short" | "error">(
    "idle"
  );

  async function ask() {
    const q = question.trim();
    if (q.length < 3) return;
    if (!authed) {
      // The sign-in wall is the single biggest drop-off on this funnel —
      // track it separately from a completed reading so the two are
      // distinguishable in GA4.
      trackEvent("tarot_login_required", { source: "tarot_reader" });
      router.push(`/login?next=${encodeURIComponent("/taro")}`);
      return;
    }
    setStatus("drawing");
    setReading(null);
    try {
      const res = await fetch("/api/tarot/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (res.status === 402) {
        trackEvent("tarot_credits_short", { source: "tarot_reader" });
        setStatus("short");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const next = (await res.json()) as Reading;
      trackEvent("tarot_reading_completed", { free: next.free ? 1 : 0 });
      setReading(next);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setReading(null);
    setQuestion("");
    setStatus("idle");
  }

  return (
    <div className="rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/10 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      {/* Question box */}
      <label className="block text-sm font-medium text-foreground/90">
        დაუსვი კითხვა კარტებს
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          maxLength={300}
          placeholder="მაგ: რას მიპირებს ეს ურთიერთობა?"
          className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[var(--vivida-violet)]/60"
        />
        <Button
          type="button"
          variant="mystic"
          onClick={ask}
          disabled={status === "drawing" || question.trim().length < 3}
          className="shrink-0 gap-1.5"
        >
          {status === "drawing" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Wand2 className="size-4" />
          )}
          გაშალე კარტები
        </Button>
      </div>
      <div className="mt-2">
        <CreditHint>პირველი კითხვა უფასოა, შემდეგ −{cost} კრედიტი</CreditHint>
      </div>

      {/* Short-balance prompt */}
      {status === "short" && (
        <div className="mt-5 rounded-2xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-4 text-center text-sm">
          <p className="text-[var(--vivida-pink)]">
            ბალანსი არ არის საკმარისი. მოიწვიე მეგობარი ან შეავსე ბალანსი.
          </p>
          <Button asChild variant="mystic" className="mt-3">
            <Link href="/credits">
              <Users className="size-4" />
              მოიწვიე / შეავსე
            </Link>
          </Button>
        </div>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-[var(--vivida-pink)]">
          რაღაც ვერ მოხერხდა — სცადე ხელახლა.
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
              შენი კითხვა
            </div>
            <h3 className="mt-1 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              {reading.headline}
            </h3>
          </div>

          <div className="space-y-2.5">
            {reading.cards.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-background/35 px-4 py-3"
              >
                <div className="text-xs font-medium text-[var(--vivida-violet)]">
                  {c.positionKa} · {c.nameKa}
                  {c.reversed && " (შებრუნებული)"}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                  {c.interpretationKa}
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {reading.free
                ? "პირველი კითხვა — უფასო ✦"
                : `−${reading.charged} კრედიტი · ბალანსი ${reading.balance}`}
            </span>
            <Button type="button" variant="outline" onClick={reset} className="gap-1.5">
              <RotateCcw className="size-4" />
              ახალი კითხვა
            </Button>
          </div>

          {/* Free second-action rail — a next step at the peak-engagement
              moment, instead of dead-ending at the credit-gated new question. */}
          <div className="border-t border-border/40 pt-5 text-center">
            <p className="text-xs text-muted-foreground">ან განაგრძე</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                დღის ჰოროსკოპი
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                ჩემი ნატალური რუკა
              </Link>
              <Link
                href="/tests"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                ტესტები
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A single revealed card — illustration with a styled fallback back. */
function TarotCardFace({ card, delayMs }: { card: SpreadCard; delayMs: number }) {
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
            src={`/tarot/${card.slug}.webp`}
            alt={card.nameKa}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-[radial-gradient(70%_60%_at_50%_30%,oklch(0.32_0.14_300/0.6),transparent_70%)] p-2 text-center">
            <span className="text-3xl">{card.glyph}</span>
            <span className="text-[10px] font-medium leading-tight text-foreground/80">
              {card.nameKa}
            </span>
          </div>
        )}
      </div>
      <figcaption
        className={`px-2 py-1.5 text-center text-[10px] font-medium text-foreground/85 ${
          card.reversed ? "" : ""
        }`}
      >
        {card.nameKa}
      </figcaption>
    </figure>
  );
}
