import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

import { db } from "@/db";
import { mbtiTestResults } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { MbtiResultView } from "@/components/mbti/mbti-result-view";

export const metadata = { title: "Astro-MBTI შედეგი" };
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
  const user = await requireUser();

  const [result] = await db
    .select()
    .from(mbtiTestResults)
    .where(and(eq(mbtiTestResults.id, id), eq(mbtiTestResults.userId, user.id)))
    .limit(1);
  // Not found OR not the owner → 404 (don't leak that the id exists).
  if (!result) notFound();

  const plan = await getCurrentPlan(user.id);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />

      <AppHeader authed plan={plan} />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Astro-MBTI · შენი შედეგი
        </div>

        <MbtiResultView
          type={result.mbtiType}
          archetypeNameGe={result.archetypeNameGe}
          scores={result.scores}
          analysis={result.aiSynthesisText}
        />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground">
            შედეგი გამოგზავნილია შენს ელფოსტაზეც.
          </p>
          <Button asChild variant="outline">
            <Link href="/test">თავიდან გავიარო</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
