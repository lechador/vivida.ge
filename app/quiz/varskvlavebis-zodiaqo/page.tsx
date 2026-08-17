import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { SiteFooter } from "@/components/site-footer";
import { Starfield } from "@/components/landing/starfield";
import { FamousZodiacQuiz } from "@/components/quizzes/famous-zodiac-quiz";
import { FAMOUS_ZODIAC_ASSETS } from "@/lib/zodiac-famous-assets";
import { isR2Configured, objectExists, publicUrlFor } from "@/lib/r2";
import { breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, ENGLISH_SITE_URL, GEORGIAN_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const TITLE_KA = "ვარსკვლავების ზოდიაქო — გამოიცანი ცნობილი ადამიანების ნიშანი";
const DESCRIPTION_KA = "გამოიცანი 20 ცნობილი ადამიანის ზოდიაქოს ნიშანი. სწრაფი, უფასო ქვიზი ქართულად — შედეგი და გაზიარება დასრულებისთანავე.";
const TITLE_EN = "Celebrity Zodiac Quiz — Guess Their Star Signs";
const DESCRIPTION_EN = "Can you guess the zodiac signs of 20 famous actors, musicians, athletes and public figures? Play free and see every correct answer.";
const TITLE_AM = "Հայտնիների կենդանակերպը — գուշակեք նրանց նշանները";
const DESCRIPTION_AM = "Կարո՞ղ եք գուշակել 20 հայտնի դերասանների, երաժիշտների, մարզիկների և հանրային դեմքերի կենդանակերպի նշանները։ Խաղացեք անվճար և տեսեք բոլոր ճիշտ պատասխանները։";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const am = locale === "am";
  const siteUrl = am ? ARMENIAN_SITE_URL : en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const title = am ? TITLE_AM : en ? TITLE_EN : TITLE_KA;
  const description = am ? DESCRIPTION_AM : en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const url = `${siteUrl}/quiz/varskvlavebis-zodiaqo`;
  return {
    title: { absolute: title },
    description,
    keywords: am ? ["հայտնիների կենդանակերպ", "կենդանակերպի վիկտորինա", "գուշակել կենդանակերպի նշանը", "աստղաբանական վիկտորինա"] : en ? ["celebrity zodiac quiz", "guess the star sign", "famous people zodiac signs", "astrology quiz"] : undefined,
    alternates: localizedAlternates(am ? "/am/quiz/varskvlavebis-zodiaqo" : "/quiz/varskvlavebis-zodiaqo", "/quiz/varskvlavebis-zodiaqo", locale),
    openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url, title, description, siteName: "Vivida", locale: am ? "hy_AM" : en ? "en_US" : "ka_GE" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function FamousZodiacQuizPage() {
  const [session, locale] = await Promise.all([auth(), getRequestLocale()]);
  const authed = !!session?.user?.id;
  const en = locale === "en";
  const am = locale === "am";
  const siteUrl = am ? ARMENIAN_SITE_URL : en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const title = am ? TITLE_AM : en ? TITLE_EN : TITLE_KA;
  const description = am ? DESCRIPTION_AM : en ? DESCRIPTION_EN : DESCRIPTION_KA;

  const r2Ready = isR2Configured();
  const imageUrls = Object.fromEntries(
    await Promise.all(
      FAMOUS_ZODIAC_ASSETS.map(async (asset) => [
        asset.id,
        r2Ready && (await objectExists(asset.key))
          ? publicUrlFor(asset.key)
          : asset.sourceUrl,
      ]),
    ),
  );

  const ld = [
    { "@context": "https://schema.org", "@type": "Quiz", name: title, description, inLanguage: am ? "hy-AM" : en ? "en" : "ka-GE", url: `${siteUrl}/quiz/varskvlavebis-zodiaqo`, numberOfQuestions: 20 },
    breadcrumbLd([
      { name: am ? "Գլխավոր" : en ? "Home" : "მთავარი", url: siteUrl },
      { name: am ? "Թեստեր" : en ? "Tests" : "ტესტები", url: `${siteUrl}/tests` },
      { name: am ? "Հայտնիների կենդանակերպը" : en ? "Celebrity Zodiac Quiz" : "ვარსკვლავების ზოდიაქო", url: `${siteUrl}/quiz/varskvlavebis-zodiaqo` },
    ]),
  ];

  return (
    <main lang={locale} className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" />
      <Starfield count={120} shooting={2} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
      {authed ? <AppHeader authed active="tests" /> : <SmartHeader active="tests" locale={locale} georgianPath="/quiz/varskvlavebis-zodiaqo" />}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <header className="mb-6 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Vivida Quiz</div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {am ? "Կարո՞ղ եք գուշակել" : en ? "Can you guess the" : "რომელი ზოდიაქოს ნიშანია"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {am ? "հայտնի մարդու նշանը։" : en ? "celebrity’s zodiac sign?" : "ვარსკვლავი?"}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/80 sm:text-base">
            {am ? "Գուշակեք հայտնի դերասանների, երաժիշտների, մարզիկների և հանրային դեմքերի կենդանակերպի նշանները։" : en ? "Guess the star signs of famous actors, musicians, athletes and public figures." : "გამოიცანი ცნობილი მსახიობების, მომღერლებისა და სპორტსმენების ზოდიაქოს ნიშნები."}
          </p>
        </header>
        <FamousZodiacQuiz images={imageUrls} locale={locale} />
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
