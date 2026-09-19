import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

import { db } from "@/db";
import { mbtiTestResults } from "@/db/schema";
import { mbtiArchetypeEn, mbtiArchetypeKa } from "@/lib/mbti-questions";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ENGLISH_SITE_URL, GEORGIAN_SITE_URL } from "@/lib/seo/locales";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { MbtiResultView } from "@/components/mbti/mbti-result-view";
import { MbtiFamousPeople } from "@/components/mbti/mbti-famous-people";

export const dynamic = "force-dynamic";

/**
 * PUBLIC share view of an Astro-MBTI result. Deliberately shows only the
 * non-sensitive, shareable surface — type, archetype, and axis percentages
 * (plus the type's generic material). The private deep synthesis stays behind
 * the owner-gated /test-results/[id]. Anyone with the link can open this (the
 * owner chose to share it), and it unfurls on social via the colocated
 * opengraph-image.
 */
async function getResult(id: string) {
  const [r] = await db
    .select({
      id: mbtiTestResults.id,
      mbtiType: mbtiTestResults.mbtiType,
      archetypeNameGe: mbtiTestResults.archetypeNameGe,
      scores: mbtiTestResults.scores,
    })
    .from(mbtiTestResults)
    .where(eq(mbtiTestResults.id, id))
    .limit(1);
  return r ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [r, locale] = await Promise.all([getResult(id), getRequestLocale()]);
  const en = locale !== "ka";
  if (!r) return { title: "Astro-MBTI" };
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const archetype = en ? mbtiArchetypeEn(r.mbtiType) : r.archetypeNameGe;
  const title = `${r.mbtiType} — ${archetype} · Astro-MBTI`;
  const description = en
    ? `My personality type is ${r.mbtiType}. Discover your type on Vivida.`
    : `ჩემი ფსიქოლოგიური ტიპია ${r.mbtiType}. აღმოაჩინე შენი ტიპი Vivida-ზე.`;
  return {
    title,
    description,
    // Share landings exist for the OG preview, not for search — thousands of
    // near-identical result pages would only dilute crawl budget and sit in
    // GSC as "Crawled – currently not indexed". Point authority at the test.
    robots: { index: false },
    alternates: { canonical: `${siteUrl}/pirovnebis-testi` },
    openGraph: { title, description, url: `${siteUrl}/r/${id}` },
  };
}

export default async function MbtiSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [r, session, locale] = await Promise.all([
    getResult(id),
    auth(),
    getRequestLocale(),
  ]);
  if (!r) notFound();
  const en = locale !== "ka";
  const authed = !!session?.user?.id;
  const archetype = en ? mbtiArchetypeEn(r.mbtiType) : r.archetypeNameGe;

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />

      {authed ? <AppHeader authed /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Astro-MBTI
        </div>

        <MbtiResultView
          type={r.mbtiType}
          archetypeNameGe={archetype}
          scores={r.scores}
          analysis={null}
          locale={locale}
        />

        {!en ? (
          <div className="mt-4">
            <MbtiFamousPeople type={r.mbtiType} />
          </div>
        ) : null}

        {/* CTA to take the test yourself */}
        <div className="mt-8 rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {en
              ? `Are you a ${mbtiArchetypeEn(r.mbtiType)} too?`
              : `${mbtiArchetypeKa(r.mbtiType)} ხარ შენც?`}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {en
              ? "Take the free test and discover your personality type."
              : "გაიარე უფასო ტესტი და აღმოაჩინე შენი ფსიქოლოგიური ტიპი."}
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-5">
            <Link href="/pirovnebis-testi">
              {en ? "Start the test" : "დაიწყე ტესტი"}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
