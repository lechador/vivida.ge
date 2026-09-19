"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitMbti } from "@/actions/submit-mbti";
import { MBTI_ANSWERS_STORAGE_KEY } from "@/lib/mbti-questions";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Runs once the user is authed and lands on /pirovnebis-testi/claim: reads the stored
 * answers, calls the (auth-gated) synthesis action, and redirects to the
 * result. This is the only place the expensive generation runs. Guards
 * against double-submit (React strict-mode / re-renders) with a ref.
 */
export function MbtiClaimRunner({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [noAnswers, setNoAnswers] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let answers: Record<number, number> | null = null;
    try {
      const raw = window.localStorage.getItem(MBTI_ANSWERS_STORAGE_KEY);
      if (raw) answers = JSON.parse(raw);
    } catch {
      /* fall through */
    }
    if (!answers || Object.keys(answers).length === 0) {
      // One-shot localStorage read (client-only external system) — intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNoAnswers(true);
      return;
    }

    (async () => {
      const res = await submitMbti(answers);
      if (res.ok) {
        try {
          window.localStorage.removeItem(MBTI_ANSWERS_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        router.replace(`/test-results/${res.id}`);
      } else {
        setError(
          en
            ? "We could not create your profile. Please try again."
            : res.error,
        );
      }
    })();
  }, [en, router]);

  if (noAnswers) {
    return (
      <div className="rounded-2xl border border-border bg-card/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {en
            ? "No saved answers were found. Please take the test again."
            : "პასუხები ვერ მოიძებნა. გაიარე ტესტი თავიდან."}
        </p>
        <Button asChild variant="mystic" className="mt-4">
          <Link href="/pirovnebis-testi">
            {en ? "Start the test" : "ტესტის დაწყება"}
          </Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/pirovnebis-testi">
            {en ? "Try again" : "თავიდან ცდა"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-10 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
        <Sparkles className="size-7 animate-pulse text-[var(--vivida-violet)]" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight">
        {en
          ? "Creating your personality profile…"
          : "ვქმნი შენს პიროვნულ ანალიზს…"}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {en
          ? "We are preparing your detailed personality portrait. This may take a few seconds—please keep this page open."
          : "ვაერთიანებ შენს ფსიქოლოგიურ ტიპსა და ნატალურ რუკას. ეს რამდენიმე წამს გრძელდება — გვერდი არ დახურო."}
      </p>
      <Loader2 className="mx-auto mt-6 size-5 animate-spin text-muted-foreground" />
    </div>
  );
}
