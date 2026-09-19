"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Check, Lock, RotateCcw, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scoreIq, type IqResult } from "@/lib/iq/scoring";
import { IQ_ANSWERS_STORAGE_KEY } from "@/lib/iq/items";
import { IqBellCurve, DomainBar } from "@/components/iq/iq-bell-curve";
import { ProfileVisibilityToggle } from "@/components/tests/profile-visibility-toggle";
import { NextTestWidget } from "@/components/tests/next-test-widget";

type Stored = {
  answers: Record<string, number>;
  timeUsedSec?: number;
  attemptId?: string;
};

import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * IQ result. The score, band, percentile and bell curve are free; the
 * per-domain breakdown is gated behind login (mirrors the personality test).
 * Everything is computed client-side from the stashed answers, so an anonymous
 * visitor still sees their number instantly.
 */
export function IqResultClient({ locale = "ka" }: { locale?: UserLocale }) {
  const router = useRouter();
  const en = locale !== "ka";
  const [stored, setStored] = useState<Stored | null | "missing">(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(IQ_ANSWERS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Stored) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStored(parsed && parsed.answers ? parsed : "missing");
    } catch {
      setStored("missing");
    }
  }, []);

  // Persist the attempt (idempotent server-side via unique attempt_id), then
  // route a signed-in taker to the gated saved view so the deep breakdown is
  // never shown for free here. Anonymous takers stay and see the login CTA.
  useEffect(() => {
    if (!stored || stored === "missing" || !stored.attemptId) return;
    fetch("/api/iq/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        attemptId: stored.attemptId,
        answers: stored.answers,
        timeUsedSec: stored.timeUsedSec,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) router.replace(`/iq-testi/shedegi/${data.id}`);
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

  const result: IqResult | null = useMemo(
    () => (stored && stored !== "missing" ? scoreIq(stored.answers) : null),
    [stored],
  );

  if (stored === "missing") {
    return (
      <div className="rounded-3xl border border-border bg-card/55 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
        <p className="text-foreground/85">
          {en
            ? "Take the test first to see your result."
            : "ჯერ ტესტი უნდა გაიარო."}
        </p>
        <Button asChild variant="mystic" className="mt-5">
          <Link href="/iq-testi">
            {en ? "Start the test" : "ტესტის დაწყება"}
          </Link>
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
      localStorage.removeItem(IQ_ANSWERS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    router.push("/iq-testi");
  }

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className="rounded-3xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {en ? "Your IQ estimate" : "შენი IQ შედეგი"}
        </div>
        <div className="mt-2 bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-7xl font-bold leading-none tracking-tight text-transparent sm:text-8xl">
          {result.iq}
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-4 py-1.5 text-sm font-medium text-[var(--vivida-violet)]">
          <Sparkles className="size-3.5" />
          {en ? result.band.labelEn : result.band.labelKa}
        </div>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-foreground/80">
          {en ? result.band.descEn : result.band.descKa}
        </p>

        <div className="mt-6">
          <IqBellCurve iq={result.iq} locale={locale} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat
            label={en ? "Estimated range" : "სავარაუდო დიაპაზონი"}
            value={`${result.range[0]}–${result.range[1]}`}
          />
          <Stat
            label={en ? "Percentile" : "ჯობნი მოსახლეობის"}
            value={en ? `${result.percentile}th` : `${result.percentile}%-ს`}
          />
          <Stat
            label={en ? "Correct answers" : "სწორი პასუხი"}
            value={`${result.correct} / ${result.total}`}
          />
        </div>
      </div>

      {/* Domain breakdown — gated behind login */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <Brain className="size-5 text-[var(--vivida-cyan)]" />
          <h2 className="text-lg font-semibold tracking-tight">
            {en ? "Your reasoning profile" : "შენი აზროვნების რუკა"}
          </h2>
        </div>

        <div
          className={cn(
            "space-y-4",
            authed === false && "pointer-events-none select-none blur-[6px]",
          )}
        >
          {result.domains.map((d) => (
            <DomainBar
              key={d.domain}
              label={en ? d.labelEn : d.labelKa}
              pct={d.pct}
            />
          ))}
        </div>

        {authed === false && (
          <div className="absolute inset-0 grid place-items-center bg-background/40 p-6 backdrop-blur-[2px]">
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10">
                <Lock className="size-5 text-[var(--vivida-violet)]" />
              </div>
              <p className="mx-auto mt-3 max-w-xs text-pretty text-sm text-foreground/85">
                {en
                  ? "Create a free account to save your result and explore your performance across all four reasoning domains."
                  : "დარეგისტრირდი უფასოდ და ნახე შენი აზროვნების სრული ანალიზი დომენების მიხედვით — და შეინახე შედეგი."}
              </p>
              <Button asChild variant="mystic" className="mt-4">
                <Link href="/signup?from=iq">
                  {en ? "Create free account" : "უფასო რეგისტრაცია"}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Show-on-profile opt-in (signed-in only; self-hides otherwise) */}
      <ProfileVisibilityToggle kind="iq" locale={locale} />

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ShareButton iq={result.iq} locale={locale} />
        <Button
          type="button"
          variant="outline"
          onClick={retake}
          className="gap-1.5"
        >
          <RotateCcw className="size-4" />
          {en ? "Retake" : "თავიდან გავლა"}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/tests">{en ? "Other tests" : "სხვა ტესტები"}</Link>
        </Button>
      </div>

      <NextTestWidget completed="iq" locale={locale} />

      <p className="mx-auto max-w-lg text-center text-xs leading-relaxed text-muted-foreground">
        {en
          ? "A single online result is approximate and can be affected by fatigue, environment and attention. This is not a clinical or professionally administered assessment."
          : "ერთჯერადი ონლაინ ტესტის შედეგი მიახლოებითია (±5 ქულა) და დამოკიდებულია დაღლილობაზე, გარემოსა და ყურადღებაზე. ეს არ არის კლინიკური დიაგნოზი."}
      </p>
    </div>
  );
}

function ShareButton({ iq, locale }: { iq: number; locale: UserLocale }) {
  const en = locale !== "ka";
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = en
      ? "https://www.vividaastro.com/iq-test"
      : "https://www.vivida.ge/iq-testi";
    const text = en
      ? `My estimated IQ on Vivida: ${iq} 🧠 What will you get?`
      : `ჩემი IQ Vivida-ს ტესტზე: ${iq} 🧠 შენ რას მიიღებ?`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: en ? "Vivida IQ Test" : "Vivida IQ ტესტი",
          text,
          url,
        });
        return;
      } catch {
        /* cancelled — fall through to copy */
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
