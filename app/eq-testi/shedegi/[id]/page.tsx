import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RotateCcw, Sparkles } from "lucide-react";

import { db } from "@/db";
import { eqResults } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { calculateEq, EQ_BAND_META } from "@/lib/eq/scoring";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { EqProfile } from "@/components/eq/eq-profile";
import { ProfileVisibilityToggle } from "@/components/tests/profile-visibility-toggle";
import { NextTestWidget } from "@/components/tests/next-test-widget";
import { UnlockCard } from "@/components/credits/unlock-card";
import { CREDIT_COST, getBalance, isUnlocked } from "@/lib/credits";
import { EqArticleRecommendations } from "@/components/eq/eq-article-recommendations";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return {
    title: en ? "Your EQ Result" : "შენი EQ შედეგი",
    robots: { index: false },
  };
}
export const dynamic = "force-dynamic";

/**
 * A saved EQ result, owner-only — the persistent view behind "ჩემი შედეგი" on
 * the tests hub (the fresh /eq-testi/shedegi is localStorage-only). The overall
 * score + band are free; the deep 5-domain profile unlocks once for
 * CREDIT_COST.eqTest credits. Re-scored from the stored answers so it works on
 * any device.
 */
export default async function SavedEqResultPage({
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
    .from(eqResults)
    .where(and(eq(eqResults.id, id), eq(eqResults.userId, user.id)))
    .limit(1);
  if (!row) notFound(); // not found OR not the owner

  const result = calculateEq(row.answers as Record<number, number>);
  const bandMeta = EQ_BAND_META[result.band];

  const [unlocked, balance] = await Promise.all([
    isUnlocked(user.id, row.id, "spend_eq"),
    getBalance(user.id),
  ]);

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <AppHeader authed active="tests" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        {/* Headline — free */}
        <div className="rounded-3xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            VIVIDA EQ
          </div>
          <div className="mt-3 text-6xl font-bold tabular-nums tracking-tight sm:text-7xl">
            {result.overall}
          </div>
          <div
            className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold"
            style={{ color: bandMeta.hue }}
          >
            <Sparkles className="size-4" />
            {en ? bandMeta.labelEn : bandMeta.labelKa}
          </div>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground/75">
            {en ? bandMeta.summaryEn : bandMeta.summaryKa}
          </p>
        </div>

        {/* Deep 5-domain profile — gated behind a one-time credit unlock */}
        {unlocked ? (
          <div className="mt-4">
            <EqProfile result={result} locale={locale} />
          </div>
        ) : (
          <div className="mt-4">
            <UnlockCard
              kind="eq"
              resultId={row.id}
              cost={CREDIT_COST.eqTest}
              balance={balance}
              title={
                en ? "Unlock your emotional profile" : "ემოციური რუკის გახსნა"
              }
              blurb={
                en
                  ? "Explore all five areas—self-awareness, self-regulation, motivation, empathy and social skills—with interpretations and practical suggestions. Pay once and keep the result."
                  : "ნახე შენი პროფილი ხუთ სფეროში — თვითშემეცნება, თვითრეგულაცია, მოტივაცია, ემპათია და სოციალური უნარები, თითოეულის ანალიზითა და რჩევებით. გადაიხდი ერთხელ, შედეგი სამუდამოდ შენია."
              }
              locale={locale}
            />
          </div>
        )}

        {!en && (
          <div className="mt-4">
            <EqArticleRecommendations result={result} />
          </div>
        )}

        {unlocked && <ProfileVisibilityToggle kind="eq" locale={locale} />}

        <NextTestWidget completed="eq" locale={locale} />

        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/eq-testi">
              <RotateCcw className="size-4" />
              {en ? "Retake the test" : "ტესტის თავიდან გავლა"}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
