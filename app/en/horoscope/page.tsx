import type { Metadata } from "next";
import Link from "next/link";

import { EnglishGuide } from "@/components/en/english-guide";
import { GeorgianContentNote } from "@/components/en/georgian-content-note";
import { SIGNS } from "@/lib/zodiac";
import { ENGLISH_SITE_URL, GEORGIAN_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const PATH = "/en/horoscope";
const TITLE = "How Daily Horoscopes Work — Vivida";
const DESCRIPTION = "Learn how daily, weekly and monthly horoscopes use current planetary transits, and access Vivida's Georgian readings for all twelve zodiac signs.";

export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/horoskopi", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${ENGLISH_SITE_URL}/horoscope`, locale: "en_US", alternateLocale: ["ka_GE"] },
};

export default function EnglishHoroscopePage() {
  return (
    <EnglishGuide eyebrow="Current sky" title="How horoscopes work" intro="A horoscope connects current planetary movements—called transits—with a zodiac sign or a complete natal chart. It changes as the sky changes." georgianPath="/horoskopi">
      <GeorgianContentNote href="/horoskopi" label="Read today's horoscopes in Georgian" />
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
        <h2>Today’s Georgian readings by sign</h2>
        <p>Vivida’s generated daily interpretations remain Georgian in this release. Choose a sign below to open its current reading:</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SIGNS.map((sign) => (
            <Link key={sign.key} href={`${GEORGIAN_SITE_URL}/zodiac/${sign.key}/dghes`} hrefLang="ka-GE" className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-4 hover:border-[var(--vivida-violet)]/45 hover:bg-card">
              <span className="text-2xl text-[var(--vivida-violet)]">{sign.symbol}</span>
              <span><strong className="block text-sm text-foreground">{sign.labelEn}</strong><span className="text-xs text-muted-foreground">Georgian reading</span></span>
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
