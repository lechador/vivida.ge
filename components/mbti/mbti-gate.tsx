"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MbtiResultView } from "@/components/mbti/mbti-result-view";
import {
  calculateMbti,
  mbtiArchetypeKa,
  MBTI_ANSWERS_STORAGE_KEY,
  type MbtiResult,
} from "@/lib/mbti-questions";

/**
 * Anonymous teaser gate. Computes the type client-side (free — no AI, no
 * server) from the stored answers and shows it with the axis bars, but keeps
 * the deep synthesis locked behind login/registration. The CTAs carry
 * `next=/test/claim` so the user returns here and auto-generates after auth.
 */
export function MbtiGate() {
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [noAnswers, setNoAnswers] = useState(false);

  useEffect(() => {
    // One-shot localStorage read (client-only external system) — intentional.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = window.localStorage.getItem(MBTI_ANSWERS_STORAGE_KEY);
      if (!raw) {
        setNoAnswers(true);
        return;
      }
      setResult(calculateMbti(JSON.parse(raw)));
    } catch {
      setNoAnswers(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (noAnswers) {
    return (
      <div className="rounded-2xl border border-border bg-card/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          პასუხები ვერ მოიძებნა. გაიარე ტესტი თავიდან.
        </p>
        <Button asChild variant="mystic" className="mt-4">
          <Link href="/test">ტესტის დაწყება</Link>
        </Button>
      </div>
    );
  }
  if (!result) return null;

  const next = encodeURIComponent("/test/claim");

  return (
    <div>
      <MbtiResultView
        type={result.type}
        archetypeNameGe={mbtiArchetypeKa(result.type)}
        scores={result.scores}
        analysis={null}
      />

      {/* Locked synthesis CTA */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
          <Lock className="size-5 text-[var(--vivida-violet)]" />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">
          შენი ღრმა ანალიზი მზადაა
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          შედი ან დარეგისტრირდი, რომ ნახო სრული ფსიქოლოგიურ-ასტროლოგიური
          ანალიზი — მიიღებ ელფოსტაზეც.
        </p>
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="mystic" size="lg">
            <Link href={`/signup?next=${next}`}>
              <Sparkles className="size-4" />
              დარეგისტრირდი უფასოდ
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/login?next=${next}`}>შესვლა</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
