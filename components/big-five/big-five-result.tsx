"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Lock, RotateCcw, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BIG5_ANSWERS_STORAGE_KEY } from "@/lib/big-five/questions";
import {
  calculateBigFive,
  big5HeadlineKa,
  big5HeadlineEn,
  type BigFiveResult,
} from "@/lib/big-five/scoring";
import { BigFiveChart } from "@/components/big-five/big-five-chart";
import { BigFiveDetail } from "@/components/big-five/big-five-detail";
import { ProfileVisibilityToggle } from "@/components/tests/profile-visibility-toggle";
import { NextTestWidget } from "@/components/tests/next-test-widget";

type Stored = { answers: Record<number, number>; attemptId?: string };

import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * The anonymous Big Five result page. Reads answers from localStorage so an
 * anonymous visitor sees the profile instantly. The radar + trait scores are
 * free; the per-trait written analysis is gated behind login here. A signed-in
 * taker is routed to the persistent /big-five/shedegi/[id] view (analysis behind
 * a one-time credit unlock).
 */
export function BigFiveResultClient({ locale = "ka" }: { locale?: UserLocale }) {
  const router = useRouter();
  const en = locale === "en";
  const [stored, setStored] = useState<Stored | null | "missing">(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(BIG5_ANSWERS_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Stored) : null;
        setStored(parsed && parsed.answers ? parsed : "missing");
      } catch {
        setStored("missing");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!stored || stored === "missing" || !stored.attemptId) return;
    fetch("/api/big-five/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        attemptId: stored.attemptId,
        answers: stored.answers,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) router.replace(`/big-five/shedegi/${data.id}`);
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

  const result: BigFiveResult | null = useMemo(
    () => (stored && stored !== "missing" ? calculateBigFive(stored.answers) : null),
    [stored]
  );

  if (stored === "missing") {
    return (
      <div className="rounded-3xl border border-border bg-card/55 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
        <p className="text-foreground/85">{en ? "Take the test first to see your result." : "ჯერ ტესტი უნდა გაიარო."}</p>
        <Button asChild variant="mystic" className="mt-5">
          <Link href="/big-five">{en ? "Start the test" : "ტესტის დაწყება"}</Link>
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
      localStorage.removeItem(BIG5_ANSWERS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    router.push("/big-five");
  }

  return (
    <div className="space-y-5">
      {/* Profile chart (free) */}
      <BigFiveChart result={result} locale={locale} />

      {/* Per-trait analysis — gated behind login here */}
      <div className="relative overflow-hidden rounded-3xl">
        <div
          className={
            authed === false ? "pointer-events-none select-none blur-[7px]" : ""
          }
        >
          <BigFiveDetail result={result} locale={locale} />
        </div>

        {authed === false && (
          <div className="absolute inset-0 grid place-items-center bg-background/40 p-6 backdrop-blur-[2px]">
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10">
                <Lock className="size-5 text-[var(--vivida-violet)]" />
              </div>
              <p className="mx-auto mt-3 max-w-xs text-pretty text-sm text-foreground/85">
                {en ? "Create a free account to save your result and read the detailed interpretation of every trait." : "დარეგისტრირდი უფასოდ და ნახე თითოეული თვისების დეტალური ანალიზი — და შეინახე შედეგი."}
              </p>
              <Button asChild variant="mystic" className="mt-4">
                <Link href="/signup?from=big-five">{en ? "Create free account" : "უფასო რეგისტრაცია"}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProfileVisibilityToggle kind="big-five" locale={locale} />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <ShareButton headline={en ? big5HeadlineEn(result) : big5HeadlineKa(result)} locale={locale} />
        <Button type="button" variant="outline" onClick={retake} className="gap-1.5">
          <RotateCcw className="size-4" />
          {en ? "Retake" : "თავიდან გავლა"}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/tests">{en ? "Other tests" : "სხვა ტესტები"}</Link>
        </Button>
      </div>

      <NextTestWidget completed="big-five" locale={locale} />

      <p className="mx-auto max-w-lg text-center text-xs leading-relaxed text-muted-foreground">
        {en ? "This is a self-report assessment reflecting how you perceive yourself. It is not a clinical diagnosis." : "ეს არის თვითშეფასების ტესტი — ის ასახავს იმას, თუ როგორ აღიქვამ საკუთარ თავს. ეს არ არის კლინიკური დიაგნოზი."}
      </p>
    </div>
  );
}

function ShareButton({ headline, locale }: { headline: string; locale: UserLocale }) {
  const en = locale === "en";
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = en ? "https://www.vividaastro.com/big-five" : "https://www.vivida.ge/big-five";
    const text = en ? `${headline} — my Big Five profile on Vivida 🧬 What will you get?` : `${headline} — ჩემი Big Five პროფილი Vivida-ზე 🧬 შენ რას მიიღებ?`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: en ? "Vivida Big Five Test" : "Vivida Big Five ტესტი", text, url });
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
      {copied ? (en ? "Copied" : "დაკოპირდა") : en ? "Share" : "გააზიარე"}
    </Button>
  );
}
