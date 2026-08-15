import type { Metadata } from "next";
import Link from "next/link";

import { EnglishGuide } from "@/components/en/english-guide";
import { SIGNS } from "@/lib/zodiac";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { articleLd, breadcrumbLd, faqLd } from "@/lib/seo/jsonld";

const TITLE = "How Daily Horoscopes Work — Vivida";
const DESCRIPTION = "Learn how daily, weekly and monthly horoscopes use current planetary transits, and read Vivida's English forecasts for all twelve zodiac signs.";

export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESCRIPTION,
  // English-only explainer, like /about. The Georgian /horoskopi is a daily
  // hub, not an equivalent of this page — it now pairs with the English
  // /horoskopi instead.
  alternates: { canonical: `${ENGLISH_SITE_URL}/horoscope`, languages: { en: `${ENGLISH_SITE_URL}/horoscope`, "x-default": `${ENGLISH_SITE_URL}/horoscope` } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${ENGLISH_SITE_URL}/horoscope`, locale: "en_US" },
};

export default function EnglishHoroscopePage() {
  const url = `${ENGLISH_SITE_URL}/horoscope`;
  const ld = [
    // TITLE carries the " — Vivida" brand suffix for the <title> tag; the
    // structured-data headline should be the bare topic.
    articleLd({ url, headline: "How Daily Horoscopes Work", description: DESCRIPTION }),
    breadcrumbLd([
      { name: "Home", url: ENGLISH_SITE_URL },
      { name: "Horoscope", url },
    ]),
    faqLd([
      {
        q: "What is the difference between a Sun-sign and a personalized horoscope?",
        a: "A Sun-sign horoscope is written for one of the twelve signs and describes broad collective themes. A personalized horoscope compares current transits with the exact degrees, houses and aspects of an individual natal chart, so the interpretation is specific to one person.",
      },
      {
        q: "How often do horoscopes change?",
        a: "Daily forecasts usually follow the Moon and fast-moving aspects, weekly forecasts follow Mercury, Venus and Mars, and monthly forecasts cover lunations and slower cycles.",
      },
      {
        q: "Should a horoscope be treated as a prediction?",
        a: "No. A useful horoscope offers context and questions rather than commands or guarantees, and leaves every decision with the reader.",
      },
    ]),
  ];
  return (
    <EnglishGuide eyebrow="Current sky" title="How horoscopes work" intro="A horoscope connects current planetary movements—called transits—with a zodiac sign or a complete natal chart. It changes as the sky changes." georgianPath="/horoskopi" jsonLd={ld}>
      <section>
        <h2>Sun-sign and personalized horoscopes</h2>
        <p>A general horoscope is usually written for the twelve Sun signs. It can describe broad collective themes, but everyone born under one sign does not have the same chart. A personalized horoscope can compare current transits with the exact degrees, houses and aspects in an individual natal chart, making the interpretation more specific.</p>
      </section>
      <section>
        <h2>Different forecast periods</h2>
        <ul className="mt-4 list-disc">
          <li><strong>Daily forecasts</strong> often emphasize the Moon and fast-moving aspects.</li>
          <li><strong>Weekly forecasts</strong> can follow Mercury, Venus and Mars as themes develop.</li>
          <li><strong>Monthly forecasts</strong> provide room for longer cycles, lunations and slower transitions.</li>
        </ul>
        <p>No forecast should be treated as a command or guarantee. A useful horoscope offers context and questions while leaving decisions with the reader.</p>
      </section>
      <section>
        <h2>Today’s English readings by sign</h2>
        <p>Choose a sign below to open its current English forecast, including the day’s main theme, practical guidance, and key areas of focus:</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SIGNS.map((sign) => (
            <Link key={sign.key} href={`/zodiac/${sign.key}/dghes`} className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-4 hover:border-[var(--vivida-violet)]/45 hover:bg-card">
              <span className="text-2xl text-[var(--vivida-violet)]">{sign.symbol}</span>
              <span><strong className="block text-sm text-foreground">{sign.labelEn}</strong><span className="text-xs text-muted-foreground">English reading</span></span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2>A responsible way to read forecasts</h2>
        <p>Look for themes that help you pause, plan or communicate more thoughtfully. Avoid using astrology as the sole basis for health, money, legal or safety decisions. Vivida’s horoscope content is offered for entertainment and personal reflection.</p>
      </section>
    </EnglishGuide>
  );
}
