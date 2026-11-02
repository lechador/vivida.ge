"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Check, Lock, RotateCcw, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isScorableIqAttempt, scoreIq, type IqResult } from "@/lib/iq/scoring";
import { IQ_ANSWERS_STORAGE_KEY } from "@/lib/iq/items";
import { IqBellCurve, DomainBar } from "@/components/iq/iq-bell-curve";
import { ProfileVisibilityToggle } from "@/components/tests/profile-visibility-toggle";
import { NextTestWidget } from "@/components/tests/next-test-widget";
import { localizedHref } from "@/lib/seo/public-paths";

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
  const pl = locale === "pl";
  const en = locale === "en";
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
          {pl
            ? "Aby zobaczyć wynik, najpierw rozwiąż test."
            : en
              ? "Take the test first to see your result."
              : "ჯერ ტესტი უნდა გაიარო."}
        </p>
        <Button asChild variant="mystic" className="mt-5">
          <Link href={localizedHref("/iq-testi", locale)}>
            {pl ? "Rozpocznij test" : en ? "Start the test" : "ტესტის დაწყება"}
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
    router.push(localizedHref("/iq-testi", locale));
  }

  // Too few administered items (the timer ran out early) is not a
  // measurement: the estimate would be mostly prior. Show that honestly
  // instead of a precise-looking number from a handful of answers.
  const timeUsedSec = (stored as Stored | null)?.timeUsedSec;
  if (!isScorableIqAttempt(result.total, timeUsedSec)) {
    return (
      <div className="rounded-3xl border border-border bg-card/55 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
        <p className="mx-auto max-w-md text-pretty text-foreground/85">
          {pl
            ? `Rozwiązano tylko ${result.total} zadań, co nie wystarcza do wiarygodnego oszacowania. Rozwiąż test ponownie i odpowiedz na co najmniej 20 zadań.`
            : en
              ? `Only ${result.total} tasks were completed, which is not enough for a reliable estimate. Please retake the test and answer at least 20 tasks.`
              : `მხოლოდ ${result.total} დავალებაა შესრულებული, ეს საიმედო შეფასებისთვის საკმარისი არ არის. გაიარე ტესტი თავიდან და უპასუხე მინიმუმ 20 დავალებას.`}
        </p>
        <Button
          type="button"
          variant="mystic"
          className="mt-5 gap-1.5"
          onClick={retake}
        >
          <RotateCcw className="size-4" />
          {pl
            ? "Rozwiąż test ponownie"
            : en
              ? "Retake the test"
              : "ტესტის თავიდან გავლა"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className="rounded-3xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {pl
            ? "Twój szacowany wynik IQ"
            : en
              ? "Your IQ estimate"
              : "შენი IQ შედეგი"}
        </div>
        <div className="mt-2 bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-7xl font-bold leading-none tracking-tight text-transparent sm:text-8xl">
          {result.iq}
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-4 py-1.5 text-sm font-medium text-[var(--vivida-violet)]">
          <Sparkles className="size-3.5" />
          {pl
            ? result.band.labelPl
            : en
              ? result.band.labelEn
              : result.band.labelKa}
        </div>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-foreground/80">
          {pl
            ? result.band.descPl
            : en
              ? result.band.descEn
              : result.band.descKa}
        </p>

        <div className="mt-6">
          <IqBellCurve iq={result.iq} locale={locale} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat
            label={
              pl
                ? "Szacowany zakres"
                : en
                  ? "Estimated range"
                  : "სავარაუდო დიაპაზონი"
            }
            value={`${result.range[0]}–${result.range[1]}`}
          />
          <Stat
            label={pl ? "Percentyl" : en ? "Percentile" : "ჯობნი მოსახლეობის"}
            value={
              pl
                ? `${result.percentile}. percentyl`
                : en
                  ? `${result.percentile}th`
                  : `${result.percentile}%-ს`
            }
          />
          <Stat
            label={
              pl
                ? "Poprawne odpowiedzi"
                : en
                  ? "Correct answers"
                  : "სწორი პასუხი"
            }
            value={`${result.correct} / ${result.total}`}
          />
        </div>
      </div>

      {/* Domain breakdown, gated behind login */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <Brain className="size-5 text-[var(--vivida-cyan)]" />
          <h2 className="text-lg font-semibold tracking-tight">
            {pl
              ? "Twój profil rozumowania"
              : en
                ? "Your reasoning profile"
                : "შენი აზროვნების რუკა"}
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
              label={pl ? d.labelPl : en ? d.labelEn : d.labelKa}
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
                {pl
                  ? "Załóż bezpłatne konto, aby zapisać swój wynik i zbadać swoje osiągnięcia we wszystkich czterech domenach rozumowania."
                  : en
                    ? "Create a free account to save your result and explore your performance across all four reasoning domains."
                    : "დარეგისტრირდი უფასოდ და ნახე შენი აზროვნების სრული ანალიზი დომენების მიხედვით, და შეინახე შედეგი."}
              </p>
              <Button asChild variant="mystic" className="mt-4">
                <Link href={localizedHref("/signup?from=iq", locale)}>
                  {pl
                    ? "Załóż bezpłatne konto"
                    : en
                      ? "Create free account"
                      : "უფასო რეგისტრაცია"}
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
          {pl ? "Rozwiąż ponownie" : en ? "Retake" : "თავიდან გავლა"}
        </Button>
        <Button asChild variant="ghost">
          <Link href={localizedHref("/tests", locale)}>
            {pl ? "Inne testy" : en ? "Other tests" : "სხვა ტესტები"}
          </Link>
        </Button>
      </div>

      <NextTestWidget completed="iq" locale={locale} />

      <p className="mx-auto max-w-lg text-center text-xs leading-relaxed text-muted-foreground">
        {pl
          ? "Pojedynczy wynik testu online ma charakter przybliżony i może zależeć od zmęczenia, otoczenia oraz skupienia. Powyższy zakres odzwierciedla margines błędu pomiaru. Test nie stanowi profesjonalnej diagnozy klinicznej."
          : en
            ? "A single online result is approximate and can be affected by fatigue, environment and attention. The range shown above reflects the measurement uncertainty. This is not a clinical or professionally administered assessment."
            : "ერთჯერადი ონლაინ ტესტის შედეგი მიახლოებითია და დამოკიდებულია დაღლილობაზე, გარემოსა და ყურადღებაზე. ზემოთ ნაჩვენები დიაპაზონი სწორედ ამ ცდომილებას ასახავს. ეს არ არის კლინიკური დიაგნოზი."}
      </p>
    </div>
  );
}

function ShareButton({ iq, locale }: { iq: number; locale: UserLocale }) {
  const pl = locale === "pl";
  const en = locale === "en";
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = pl
      ? "https://www.vividaastro.com/pl/test-iq"
      : en
        ? "https://www.vividaastro.com/iq-test"
        : "https://www.vivida.ge/iq-testi";
    const text = pl
      ? `Mój szacowany wynik IQ w Vivida: ${iq} 🧠 Jaki będzie Twój?`
      : en
        ? `My estimated IQ on Vivida: ${iq} 🧠 What will you get?`
        : `ჩემი IQ Vivida-ს ტესტზე: ${iq} 🧠 შენ რას მიიღებ?`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: pl
            ? "Test IQ Vivida"
            : en
              ? "Vivida IQ Test"
              : "Vivida IQ ტესტი",
          text,
          url,
        });
        return;
      } catch {
        /* cancelled, fall through to copy */
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
      {copied
        ? pl
          ? "Skopiowano"
          : en
            ? "Copied"
            : "დაკოპირდა"
        : pl
          ? "Udostępnij"
          : en
            ? "Share"
            : "გააზიარე"}
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
