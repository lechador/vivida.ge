"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Lock, RotateCcw, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EQ_ANSWERS_STORAGE_KEY } from "@/lib/eq/questions";
import { calculateEq, EQ_BAND_META, type EqResult } from "@/lib/eq/scoring";
import { EqProfile } from "@/components/eq/eq-profile";
import { ProfileVisibilityToggle } from "@/components/tests/profile-visibility-toggle";
import { NextTestWidget } from "@/components/tests/next-test-widget";
import { EqArticleRecommendations } from "@/components/eq/eq-article-recommendations";

type Stored = { answers: Record<number, number>; attemptId?: string };

/**
 * Fresh EQ result — computed client-side from the stashed answers so an
 * anonymous visitor sees their score instantly. The overall score + band are
 * free; the 5-domain profile is gated behind login here. A signed-in taker is
 * routed to the persistent /eq-testi/shedegi/[id] view (deep profile behind a
 * one-time credit unlock).
 */
export function EqResultClient() {
  const router = useRouter();
  const [stored, setStored] = useState<Stored | null | "missing">(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(EQ_ANSWERS_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Stored) : null;
        setStored(parsed && parsed.answers ? parsed : "missing");
      } catch {
        setStored("missing");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Persist (idempotent via unique attemptId), then route a signed-in taker to
  // the gated saved view. Anonymous takers stay and see the login CTA.
  useEffect(() => {
    if (!stored || stored === "missing" || !stored.attemptId) return;
    fetch("/api/eq/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        attemptId: stored.attemptId,
        answers: stored.answers,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) router.replace(`/eq-testi/shedegi/${data.id}`);
      })
      .catch(() => {
        /* best-effort */
      });
  }, [stored, router]);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setAuthed(!!d?.user);
      })
      .catch(() => {
        if (alive) setAuthed(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const result: EqResult | null = useMemo(
    () => (stored && stored !== "missing" ? calculateEq(stored.answers) : null),
    [stored]
  );

  if (stored === "missing") {
    return (
      <div className="rounded-3xl border border-border bg-card/55 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
        <p className="text-foreground/85">ჯერ ტესტი უნდა გაიარო.</p>
        <Button asChild variant="mystic" className="mt-5">
          <Link href="/eq-testi">ტესტის დაწყება</Link>
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-3xl border border-border bg-card/55 p-10 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
        <div className="mx-auto size-6 animate-spin rounded-full border-2 border-[var(--vivida-violet)]/30 border-t-[var(--vivida-violet)]" />
      </div>
    );
  }

  function retake() {
    try {
      localStorage.removeItem(EQ_ANSWERS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    router.push("/eq-testi");
  }

  const bandMeta = EQ_BAND_META[result.band];

  return (
    <div className="space-y-5">
      {/* Score card (free) */}
      <div className="rounded-3xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          შენი EQ ქულა
        </div>
        <div className="mt-2 bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-7xl font-bold leading-none tracking-tight text-transparent sm:text-8xl">
          {result.overall}
        </div>
        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
          style={{
            color: bandMeta.hue,
            borderColor: `color-mix(in oklch, ${bandMeta.hue} 45%, transparent)`,
            background: `color-mix(in oklch, ${bandMeta.hue} 12%, transparent)`,
          }}
        >
          <Sparkles className="size-3.5" />
          {bandMeta.labelKa}
        </div>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-foreground/80">
          {bandMeta.summaryKa}
        </p>
      </div>

      {/* 5-domain profile — gated behind login here */}
      <div className="relative overflow-hidden rounded-3xl">
        <div
          className={
            authed === false ? "pointer-events-none select-none blur-[7px]" : ""
          }
        >
          <EqProfile result={result} />
        </div>

        {authed === false && (
          <div className="absolute inset-0 grid place-items-center bg-background/40 p-6 backdrop-blur-[2px]">
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10">
                <Lock className="size-5 text-[var(--vivida-violet)]" />
              </div>
              <p className="mx-auto mt-3 max-w-xs text-pretty text-sm text-foreground/85">
                დარეგისტრირდი უფასოდ და ნახე შენი ემოციური რუკა ხუთივე
                სფეროში — და შეინახე შედეგი.
              </p>
              <Button asChild variant="mystic" className="mt-4">
                <Link href="/signup?from=eq">უფასო რეგისტრაცია</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <EqArticleRecommendations result={result} />

      <ProfileVisibilityToggle kind="eq" />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <ShareButton overall={result.overall} />
        <Button type="button" variant="outline" onClick={retake} className="gap-1.5">
          <RotateCcw className="size-4" />
          თავიდან გავლა
        </Button>
        <Button asChild variant="ghost">
          <Link href="/tests">სხვა ტესტები</Link>
        </Button>
      </div>

      <NextTestWidget completed="eq" />

      <p className="mx-auto max-w-lg text-center text-xs leading-relaxed text-muted-foreground">
        ეს არის თვითშეფასების ტესტი — ის ასახავს იმას, როგორ აღიქვამ საკუთარ
        ემოციურ უნარებს. ეს არ არის კლინიკური დიაგნოზი.
      </p>
    </div>
  );
}

function ShareButton({ overall }: { overall: number }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = "https://www.vivida.ge/eq-testi";
    const text = `ჩემი ემოციური ინტელექტი (EQ) Vivida-ზე: ${overall} 💗 შენ რას მიიღებ?`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Vivida EQ ტესტი", text, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }
  return (
    <Button type="button" variant="mystic" onClick={share} className="gap-1.5">
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "დაკოპირდა" : "გააზიარე"}
    </Button>
  );
}
