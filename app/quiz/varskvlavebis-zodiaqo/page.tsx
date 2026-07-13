import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { FamousZodiacQuiz } from "@/components/quizzes/famous-zodiac-quiz";
import { getCurrentPlan } from "@/lib/plan";
import { FAMOUS_ZODIAC_ASSETS } from "@/lib/zodiac-famous-assets";
import { isR2Configured, publicUrlFor } from "@/lib/r2";
import { breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";
const TITLE = "ვარსკვლავების ზოდიაქო — გამოიცანი ცნობილი ადამიანების ნიშანი";
const DESCRIPTION = "გამოიცანი 10 ცნობილი ადამიანის ზოდიაქოს ნიშანი. სწრაფი, უფასო ქვიზი ქართულად — შედეგი და გაზიარება დასრულებისთანავე.";
const QUIZ_IS_LIVE = false;

export const metadata: Metadata = { title: { absolute: TITLE }, description: DESCRIPTION, alternates: { canonical: `${SITE_URL}/quiz/varskvlavebis-zodiaqo` }, openGraph: { type: "website", url: `${SITE_URL}/quiz/varskvlavebis-zodiaqo`, title: TITLE, description: DESCRIPTION, siteName: "Vivida", locale: "ka_GE" }, twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION } };

export default async function FamousZodiacQuizPage() {
  if (!QUIZ_IS_LIVE) notFound();
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";
  const imageUrls = Object.fromEntries(
    FAMOUS_ZODIAC_ASSETS.map((asset) => [asset.id, isR2Configured() ? publicUrlFor(asset.key) : asset.sourceUrl])
  );
  const ld = [{ "@context": "https://schema.org", "@type": "Quiz", name: TITLE, description: DESCRIPTION, inLanguage: "ka-GE", url: `${SITE_URL}/quiz/varskvlavebis-zodiaqo`, numberOfQuestions: 10 }, breadcrumbLd([{ name: "მთავარი", url: SITE_URL }, { name: "ტესტები", url: `${SITE_URL}/tests` }, { name: "ვარსკვლავების ზოდიაქო", url: `${SITE_URL}/quiz/varskvlavebis-zodiaqo` }])];
  return <main className="relative isolate flex min-h-screen flex-col overflow-hidden"><div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" /><Starfield count={120} shooting={2} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />{authed ? <AppHeader authed plan={plan} active="tests" /> : <SmartHeader />}<section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10"><header className="mb-6 text-center"><div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Vivida Quiz</div><h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">რომელი ზოდიაქოს ნიშანია <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">ვარსკვლავი?</span></h1><p className="mx-auto mt-3 max-w-md text-sm text-foreground/80 sm:text-base">გამოიცანი ცნობილი მსახიობების, მომღერლებისა და სპორტსმენების ზოდიაქოს ნიშნები.</p></header><FamousZodiacQuiz images={imageUrls} /></section></main>;
}
