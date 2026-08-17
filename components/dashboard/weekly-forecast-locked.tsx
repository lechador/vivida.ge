"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Locked state for the 7-day forecast. The forecast is a one-time credit
 * unlock (CREDIT_COST.weeklyForecast) — pay once and it stays unlocked
 * forever. Shows a blurred teaser of the week behind a lock + unlock CTA;
 * on a short balance it points to the credits hub. A successful unlock does
 * a full reload so the now-unlocked forecast streams in from the server.
 */
export function WeeklyForecastLocked({
  cost,
  balance,
  locale = "ka",
}: {
  cost: number;
  balance: number;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const [pending, setPending] = useState(false);
  const [short, setShort] = useState(balance < cost);

  async function unlock() {
    setPending(true);
    try {
      const r = await fetch("/api/credits/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "weekly" }),
      });
      if (r.ok) {
        // Reload so the dashboard re-fetches with the forecast unlocked.
        window.location.reload();
        return;
      }
      if (r.status === 402) setShort(true);
    } catch {
      /* ignore — button re-enables */
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/35 bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <div
        aria-hidden
        className="absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,var(--vivida-cyan)/0.3_0%,transparent_70%)] opacity-60 blur-3xl"
      />

      <header className="relative mb-5 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {am ? "Հաջորդ 7 օրը" : en ? "Next 7 days" : "შემდეგი 7 დღე"}
          </div>
          <h2 className="mt-1 text-balance text-lg font-semibold tracking-tight sm:text-xl">
            {am ? "Ձեր շաբաթը երկնքում" : en ? "Your week in the sky" : "შენი კვირის ცის რუკა"}
          </h2>
        </div>
        <Sparkles className="size-5 shrink-0 text-[var(--vivida-cyan)]" aria-hidden />
      </header>

      {/* Blurred teaser rows — a hint of the week behind the lock. */}
      <div className="relative">
        <ol
          aria-hidden
          className="space-y-3.5 select-none blur-[6px]"
        >
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border-2 border-border/50 bg-[oklch(0.23_0.04_285/0.7)] p-3 pl-5 sm:p-4"
            >
              <div className="flex flex-col items-center rounded-lg border border-border bg-[oklch(0.27_0.05_285/0.7)] px-3 py-2">
                <span className="text-[10px] uppercase text-muted-foreground">
                  {(en ? ["Mon", "Tue", "Wed", "Thu"] : ["ორშ", "სამ", "ოთხ", "ხუთ"])[i]}
                </span>
                <span className="text-lg font-semibold">{12 + i}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-3 w-3/4 rounded bg-foreground/15" />
                <div className="mt-2 h-2 w-1/2 rounded bg-foreground/10" />
                <div className="mt-2.5 h-2 w-full rounded-full bg-foreground/[0.08]" />
              </div>
            </li>
          ))}
        </ol>

        {/* Lock overlay + unlock CTA. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-transparent via-card/40 to-card/80 px-4 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
            <Lock className="size-6 text-[var(--vivida-violet)]" />
          </div>
          <p className="max-w-xs text-sm text-foreground/85">
            {en
              ? "Unlock a detailed seven-day forecast with daily harmony and challenge scores, reasons, and guidance."
              : "გახსენი მომდევნო 7 დღის დეტალური პროგნოზი — ჰარმონიისა და დაძაბულობის ქულები ყოველ დღეს, მიზეზებით და რჩევებით."}
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-sm">
            <Sparkles className="size-4 text-[var(--vivida-cyan)]" />
            <span className="font-semibold">{cost} {am ? "կրեդիտներ" : en ? "credits" : "კრედიტი"}</span>
            <span className="text-muted-foreground">· {am ? "մեկ անգամ · հավասարակշռություն" : en ? "one time · balance" : "ერთჯერადად · ბალანსი"} {balance}</span>
          </div>

          {!short ? (
            <Button
              type="button"
              variant="mystic"
              size="lg"
              disabled={pending}
              onClick={unlock}
              className="gap-1.5"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              {en ? `Unlock for ${cost} credits` : `გახსნა ${cost} კრედიტით`}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-[var(--vivida-pink)]">
                {am ? "Ձեր հաշվեկշիռը շատ ցածր է։" : en ? "Your balance is too low." : "ბალანსი არ არის საკმარისი."}
              </p>
              <Button asChild variant="mystic">
                <Link href="/credits">
                  <Users className="size-4" />
                  {am ? "Հրավիրել / լիցքավորել" : en ? "Invite / top up" : "მოიწვიე / შეავსე"}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
