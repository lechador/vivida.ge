import type { Metadata } from "next";

import { auth } from "@/auth";
import { getMbtiQuestions } from "@/lib/mbti-questions-db";
import { MBTI_QUESTIONS_EN } from "@/lib/mbti-questions";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { MbtiGate } from "@/components/mbti/mbti-gate";
import { MbtiClaimRunner } from "@/components/mbti/mbti-claim-runner";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  // Transient per-user result state, like the /shedegi pages — keep it out of
  // the index rather than letting it self-canonicalize as content.
  return {
    title: en ? "Your Astro-MBTI result" : "შენი შედეგი",
    robots: { index: false },
  };
}
export const dynamic = "force-dynamic";
// The synthesis (flash) runs here and can take ~20s — well above the default
// serverless budget, so give the action room.
export const maxDuration = 60;

/**
 * The pivot between anonymous and authed:
 *   - not signed in → the teaser gate (type + bars, deep analysis locked)
 *   - signed in     → auto-run the synthesis from the stored answers, then
 *                     redirect to /test-results/[id]
 */
export default async function TestClaimPage() {
  const [session, locale] = await Promise.all([auth(), getRequestLocale()]);
  const en = locale !== "ka";
  const authed = !!session?.user?.id;
  // The anonymous teaser recomputes the type client-side from the stored
  // answers, so it needs the question structure. Only loaded when anon.
  const questions = authed
    ? null
    : en
      ? MBTI_QUESTIONS_EN
      : await getMbtiQuestions();

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />

      {authed ? (
        <AppHeader authed />
      ) : (
        <SmartHeader
          active="tests"
          locale={locale}
          georgianPath="/pirovnebis-testi/claim"
        />
      )}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        {authed ? (
          <MbtiClaimRunner locale={locale} />
        ) : (
          <MbtiGate questions={questions!} locale={locale} />
        )}
      </section>
    </main>
  );
}
