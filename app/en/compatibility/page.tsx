import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { EnglishGuide } from "@/components/en/english-guide";
import { CompatibilityCalculator } from "@/components/landing/compatibility-calculator";
import { buildCalculatorData } from "@/lib/compatibility-calculator-data";
import { ENGLISH_SITE_URL, localizedAlternates } from "@/lib/seo/locales";
import { articleLd, breadcrumbLd } from "@/lib/seo/jsonld";

const PATH = "/en/compatibility";
const TITLE = "Astrology Compatibility Beyond Sun Signs";
const DESCRIPTION = "Learn how synastry compares two natal charts through the Sun, Moon, Venus, Mars, houses and planetary aspects—not only Sun signs.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` }, description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/zodiac/tavsebadoba", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${ENGLISH_SITE_URL}/compatibility`, locale: "en_US", alternateLocale: ["ka_GE"] },
};

export default function EnglishCompatibilityPage() {
  const { signs, pairs } = buildCalculatorData("en");
  const url = `${ENGLISH_SITE_URL}/compatibility`;
  const ld = [
    articleLd({ url, headline: TITLE, description: DESCRIPTION }),
    breadcrumbLd([
      { name: "Home", url: ENGLISH_SITE_URL },
      { name: "Compatibility", url },
    ]),
  ];
  return (
    <EnglishGuide eyebrow="Relationships and synastry" title="Compatibility is more than two Sun signs" intro="Astrological compatibility, often called synastry, compares two complete natal charts. It explores patterns of ease, attraction, difference and growth without deciding whether a relationship will succeed." georgianPath="/zodiac/tavsebadoba" jsonLd={ld}>
      <section className="not-prose rounded-3xl border border-border bg-card/40 p-4 sm:p-7">
        <div className="mb-6 text-center">
          <Heart className="mx-auto size-7 text-[var(--vivida-pink)]" />
          <h2 className="mt-3 text-2xl font-semibold">Try the free Sun-sign calculator</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Choose two signs for an instant English compatibility reading, then open the full pair analysis.</p>
        </div>
        <CompatibilityCalculator signs={signs} pairs={pairs} locale="en" />
      </section>
      <section>
        <h2>What a compatibility reading compares</h2>
        <ul className="mt-4 list-disc">
          <li><strong>Sun connections</strong> can describe identity, direction and mutual recognition.</li>
          <li><strong>Moon connections</strong> are often read for emotional rhythm, comfort and everyday needs.</li>
          <li><strong>Mercury aspects</strong> can highlight communication styles and ways of processing information.</li>
          <li><strong>Venus and Mars</strong> are traditionally associated with affection, attraction, desire and pursuit.</li>
          <li><strong>Saturn contacts</strong> may emphasize responsibility, endurance, boundaries or pressure.</li>
          <li><strong>House overlays</strong> show which areas of one person’s life are activated by the other’s planets.</li>
        </ul>
      </section>
      <section>
        <h2>Why one score cannot tell the whole story</h2>
        <p>A percentage can be a playful introduction, but real relationships are multidimensional. Some challenging aspects can support growth and commitment, while easy aspects can be taken for granted. Birth-time accuracy, individual maturity, communication and real-life circumstances matter more than a single astrological category.</p>
      </section>
      <section>
        <h2>Use compatibility as a conversation</h2>
        <p>The healthiest use of synastry is to ask better questions: Where do we naturally understand each other? Where do our needs differ? Which patterns require clearer boundaries or more patient communication? Astrology should never be used to excuse harmful behavior, ignore consent or replace direct conversation.</p>
      </section>
      <div className="rounded-3xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-6 text-center sm:p-8">
        <Heart className="mx-auto size-7 text-[var(--vivida-pink)]" />
        <h2 className="mt-3">Try the free Sun-sign calculator</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">Create a free profile to compare complete birth charts, including the Moon, Venus, Mars, houses, and cross-chart aspects—in English.</p>
        <Link href="/signup" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-3 text-sm font-semibold text-white">Create my profile <ArrowRight className="size-4" /></Link>
      </div>
    </EnglishGuide>
  );
}
