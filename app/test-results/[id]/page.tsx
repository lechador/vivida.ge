import { after } from "next/server";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

import { db } from "@/db";
import { mbtiTestResults } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { mbtiArchetypeEn, mbtiBaseType } from "@/lib/mbti-questions";
import { getTypeSections, mbtiSectionCombos, ensureMbtiLibraryFor } from "@/lib/mbti-library";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { MbtiResultView } from "@/components/mbti/mbti-result-view";
import { MbtiProfileSections } from "@/components/mbti/mbti-profile-sections";
import { MbtiEnglishProfile } from "@/components/mbti/mbti-english-profile";
import { MbtiFamousPeople } from "@/components/mbti/mbti-famous-people";
import { MbtiShareButton } from "@/components/mbti/mbti-share-button";
import { ProfileVisibilityToggle } from "@/components/tests/profile-visibility-toggle";
import { NextTestWidget } from "@/components/tests/next-test-widget";
import { UnlockCard } from "@/components/credits/unlock-card";
import { CREDIT_COST, getBalance, isUnlocked } from "@/lib/credits";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const am = locale === "am";
  return { title: am ? "Ձեր Աստրո-ՄԲՏԻ արդյունքը" : en ? "Your Astro-MBTI result" : "Astro-MBTI შედეგი" };
}
export const dynamic = "force-dynamic";

/**
 * Astro-MBTI result — gated: only the owner can view. Renders the type,
 * archetype, axis bars, and the full Georgian synthesis.
 */
export default async function TestResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, locale] = await Promise.all([requireUser(), getRequestLocale()]);
  const en = locale !== "ka";
  const am = locale === "am";

  const [result] = await db
    .select()
    .from(mbtiTestResults)
    .where(and(eq(mbtiTestResults.id, id), eq(mbtiTestResults.userId, user.id)))
    .limit(1);
  // Not found OR not the owner → 404 (don't leak that the id exists).
  if (!result) notFound();

  // Rich 16Personalities-style sections — pre-written per 4-letter type. If any
  // are missing (unseeded), self-heal them in the background so the next view
  // is complete; this render shows whatever already exists.
  const baseType = mbtiBaseType(result.mbtiType);
  const sections = en ? [] : await getTypeSections(baseType);
  if (!en && sections.length < 7) {
    after(() => ensureMbtiLibraryFor(mbtiSectionCombos(baseType)));
  }
  const archetype = en ? mbtiArchetypeEn(result.mbtiType) : result.archetypeNameGe;
  const resultLocale = result.model?.startsWith("en:") ? "en" : "ka";

  // Type + archetype are free (shareable); the full portrait unlocks once.
  const [unlocked, balance] = await Promise.all([
    isUnlocked(user.id, result.id, "spend_mbti"),
    getBalance(user.id),
  ]);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />

      <AppHeader authed />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {am ? "Աստրո-MBTI · Ձեր արդյունքը" : en ? "Astro-MBTI · Your result" : "Astro-MBTI · შენი შედეგი"}
        </div>

        {unlocked ? (
          <>
            <MbtiResultView
              type={result.mbtiType}
              archetypeNameGe={archetype}
              scores={result.scores}
              analysis={resultLocale === locale ? result.aiSynthesisText : null}
              locale={locale}
            />

            {en ? (
              <MbtiEnglishProfile type={result.mbtiType} scores={result.scores} />
            ) : (
              <>
                <MbtiProfileSections sections={sections} />
                <div className="mt-4">
                  <MbtiFamousPeople type={result.mbtiType} />
                </div>
              </>
            )}

            <ProfileVisibilityToggle kind="mbti" locale={locale} />
          </>
        ) : (
          <>
            <div className="rounded-3xl border border-border bg-card/55 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
              <div className="text-5xl font-bold tracking-tight sm:text-6xl">
                {result.mbtiType}
              </div>
              <div className="mt-2 text-lg font-semibold text-[var(--vivida-cyan)]">
                {archetype}
              </div>
            </div>
            <div className="mt-4">
              <UnlockCard
                kind="mbti"
                resultId={result.id}
                cost={CREDIT_COST.mbtiTest}
                balance={balance}
                title={am ? "Բացահայտեք Ձեր ամբողջական դիմանկարը" : en ? "Unlock your full portrait" : "სრული პორტრეტის გახსნა"}
                blurb={am ? "Բացահայտեք Ձեր հիմնական նախասիրությունները, ուժեղ կողմերը, հարաբերությունները և աշխատանքային ոճը։ Մեկ անգամ բացելուց հետո այն կմնա Ձեր հաշվում։" : en ? "Explore your core preferences, strengths, relationships and working style. Unlock once and keep it in your account." : "ღრმა ანალიზი, ძლიერი და სუსტი მხარეები, ურთიერთობები, კარიერა და ცნობილი ადამიანები შენი ტიპით — გადაიხდი ერთხელ, სამუდამოდ შენია."}
                locale={locale}
              />
            </div>
          </>
        )}

        <NextTestWidget completed="astro-mbti" locale={locale} />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground">
            {am ? "Ձեր արդյունքը պահպանված է Ձեր հաշվում։" : en ? "Your result is saved to your account." : "შედეგი გამოგზავნილია შენს ელფოსტაზეც."}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <MbtiShareButton
              path={`/r/${result.id}`}
              type={result.mbtiType}
              archetype={archetype}
              locale={locale}
            />
            <Button asChild variant="outline">
              <Link href="/pirovnebis-testi">{am ? "Կրկնել թեստը" : en ? "Retake test" : "თავიდან გავიარო"}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
