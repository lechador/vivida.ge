"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Sparkles, Users, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreditHint } from "@/components/credits/credit-hint";
import {
  ANALYTICS_EVENT,
  trackEvent,
  trackFirstResultViewed,
} from "@/lib/analytics";
import { fbTrack, fbTrackCustom } from "@/lib/fb-pixel";
import type { UserLocale } from "@/lib/i18n/locale";

type SpreadCard = {
  slug: string;
  name: string;
  glyph: string;
  reversed: boolean;
  position: string;
  interpretation: string;
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
  locale,
}: {
  authed: boolean;
  cost: number;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const am = locale === "am";
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<Reading | null>(null);
  const [status, setStatus] = useState<"idle" | "drawing" | "short" | "error">(
    "idle",
  );

  async function ask() {
    // A second Enter while the first request is in flight would spend the
    // credits twice — the API has no dedupe, so the guard lives here.
    if (status === "drawing") return;
    const q = question.trim();
    if (q.length < 3) return;
    if (!authed) {
      // The sign-in wall is the single biggest drop-off on this funnel —
      // track it separately from a completed reading so the two are
      // distinguishable in GA4.
      trackEvent(ANALYTICS_EVENT.tarotLoginRequired, {
        widget: "tarot_reader",
      });
      router.push(
        `/login?next=${encodeURIComponent(am ? "/am/taro" : "/taro")}`,
      );
      return;
    }
    setStatus("drawing");
    setReading(null);
    try {
      const res = await fetch("/api/tarot/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, locale }),
      });
      if (res.status === 402) {
        trackEvent(ANALYTICS_EVENT.tarotCreditsShort, {
          widget: "tarot_reader",
        });
        trackEvent(ANALYTICS_EVENT.insufficientCredits, {
          product: "tarot",
          surface: "tarot_reader",
          cost,
        });
        trackEvent(ANALYTICS_EVENT.paywallViewed, {
          product: "tarot",
          surface: "tarot_shortfall",
          cost,
        });
        setStatus("short");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const next = (await res.json()) as Reading;
      trackEvent(ANALYTICS_EVENT.tarotReadingCompleted, {
        free: next.free ? 1 : 0,
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
      <label
        htmlFor="tarot-question"
        className="block text-sm font-medium text-foreground/90"
      >
        {am
          ? "Հարց տվեք քարտերին"
          : en
            ? "Ask the cards a question"
            : "დაუსვი კითხვა კარტებს"}
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
            am
              ? "Օրինակ՝ ի՞նչ պետք է հասկանամ այս հարաբերությունների մասին:"
              : en
                ? "For example: What should I understand about this relationship?"
                : "მაგ: რას მიპირებს ეს ურთიერთობა?"
          }
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
          {am ? "Բացել քարտերը" : en ? "Draw the cards" : "გაშალე კარტები"}
        </Button>
      </div>
      <div className="mt-2">
        <CreditHint>
          {am
            ? `Առաջին հարցն անվճար է, այնուհետև՝ ${cost} կրեդիտ`
            : en
              ? `Your first question is free, then ${cost} credits`
              : `პირველი კითხვა უფასოა, შემდეგ −${cost} კრედიტი`}
        </CreditHint>
      </div>

      {/* Short-balance prompt */}
      {status === "short" && (
        <div className="mt-5 rounded-2xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-4 text-center text-sm">
          <p className="text-[var(--vivida-pink)]">
            {am
              ? "Կրեդիտները բավարար չեն: Հրավիրեք ընկերոջը կամ համալրեք հաշվեկշիռը:"
              : en
                ? "You do not have enough credits. Invite a friend or top up your balance."
                : "ბალანსი არ არის საკმარისი. მოიწვიე მეგობარი ან შეავსე ბალანსი."}
          </p>
          <Button asChild variant="mystic" className="mt-3">
            <Link
              href="/credits"
              onClick={() =>
                trackEvent(ANALYTICS_EVENT.recommendationClicked, {
                  placement: "tarot_shortfall",
                  destination: "credits",
                  product: "tarot",
                })
              }
            >
              <Users className="size-4" />
              {am
                ? "Հրավիրել / համալրել"
                : en
                  ? "Invite / top up"
                  : "მოიწვიე / შეავსე"}
            </Link>
          </Button>
        </div>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-[var(--vivida-pink)]">
          {am
            ? "Ինչ-որ բան սխալ ստացվեց: Խնդրում ենք կրկին փորձել:"
            : en
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
              {am ? "Ձեր ընթերցումը" : en ? "Your reading" : "შენი კითხვა"}
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
                  {c.position} · {c.name}
                  {c.reversed &&
                    (am ? " (շրջված)" : en ? " (reversed)" : " (შებრუნებული)")}
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {reading.free
                ? am
                  ? "Առաջին ընթերցումը՝ անվճար ✦"
                  : en
                    ? "First reading — free ✦"
                    : "პირველი კითხვა — უფასო ✦"
                : am
                  ? `−${reading.charged} կրեդիտ · մնացել է ${reading.balance}`
                  : en
                    ? `−${reading.charged} credits · ${reading.balance} remaining`
                    : `−${reading.charged} კრედიტი · ბალანსი ${reading.balance}`}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              className="gap-1.5"
            >
              <RotateCcw className="size-4" />
              {am ? "Նոր հարց" : en ? "New question" : "ახალი კითხვა"}
            </Button>
          </div>

          {/* Free second-action rail — a next step at the peak-engagement
              moment, instead of dead-ending at the credit-gated new question. */}
          <div className="border-t border-border/40 pt-5 text-center">
            <p className="text-xs text-muted-foreground">
              {am
                ? "Կամ շարունակեք ուսումնասիրել"
                : en
                  ? "Or keep exploring"
                  : "ან განაგრძე"}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                {am
                  ? "Օրվա հորոսկոպ"
                  : en
                    ? "Daily horoscope"
                    : "დღის ჰოროსკოპი"}
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                {am
                  ? "Իմ ծննդյան քարտեզը"
                  : en
                    ? "My natal chart"
                    : "ჩემი ნატალური რუკა"}
              </Link>
              <Link
                href={am ? "/am/tests" : "/tests"}
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-2 text-sm transition-colors hover:bg-card/80"
              >
                {am ? "Թեստեր" : en ? "Tests" : "ტესტები"}
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
            src={`/tarot/${card.slug}.webp`}
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
