import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { db } from "@/db";
import { bigFiveResults } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { calculateBigFive } from "@/lib/big-five/scoring";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { BigFiveChart } from "@/components/big-five/big-five-chart";
import { BigFiveDetail } from "@/components/big-five/big-five-detail";
import { ProfileVisibilityToggle } from "@/components/tests/profile-visibility-toggle";
import { NextTestWidget } from "@/components/tests/next-test-widget";
import { UnlockCard } from "@/components/credits/unlock-card";
import { CREDIT_COST, getBalance, isUnlocked } from "@/lib/credits";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return {
    title: en ? "Your Big Five Result" : "შენი Big Five შედეგი",
    robots: { index: false },
  };
}
export const dynamic = "force-dynamic";

/**
 * A saved Big Five result, owner-only, the persistent view behind "ჩემი
 * შედეგი" on the tests hub. The radar + trait scores are free; the per-trait
 * written analysis unlocks once for CREDIT_COST.bigFiveTest credits. Re-scored
 * from the stored answers so it works on any device.
 */
export default async function SavedBigFiveResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const locale = await getRequestLocale();
  const en = locale !== "ka";

  const [row] = await db
    .select()
    .from(bigFiveResults)
    .where(and(eq(bigFiveResults.id, id), eq(bigFiveResults.userId, user.id)))
    .limit(1);
  if (!row) notFound(); // not found OR not the owner

  const result = calculateBigFive(row.answers as Record<number, number>);

  const [unlocked, balance] = await Promise.all([
    isUnlocked(user.id, row.id, "spend_bigfive"),
    getBalance(user.id),
  ]);

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_265/0.4),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <AppHeader authed active="tests" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        {/* Profile chart, free */}
        <BigFiveChart result={result} locale={locale} />

        {/* Per-trait analysis, gated behind a one-time credit unlock */}
        {unlocked ? (
          <div className="mt-4">
            <BigFiveDetail result={result} locale={locale} />
          </div>
        ) : (
          <div className="mt-4">
            <UnlockCard
              kind="big-five"
              resultId={row.id}
              cost={CREDIT_COST.bigFiveTest}
              balance={balance}
              title={
                en ? "Unlock the detailed analysis" : "დეტალური ანალიზის გახსნა"
              }
              blurb={
                en
                  ? "Read what your level means for each of the five traits. Pay once and keep the result."
                  : "ნახე თითოეული თვისების სრული ანალიზი, რას ნიშნავს შენი დონე ხუთივე თვისებაზე. გადაიხდი ერთხელ, შედეგი სამუდამოდ შენია."
              }
              locale={locale}
            />
          </div>
        )}

        {unlocked && (
          <ProfileVisibilityToggle kind="big-five" locale={locale} />
        )}

        <NextTestWidget completed="big-five" locale={locale} />

        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/big-five">
              <RotateCcw className="size-4" />
              {en ? "Retake the test" : "ტესტის თავიდან გავლა"}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
