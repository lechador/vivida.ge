import type { Metadata } from "next";
import Link from "next/link";

import { EnglishGuide } from "@/components/en/english-guide";
import { GeorgianContentNote } from "@/components/en/georgian-content-note";
import { localizedAlternates, SITE_URL } from "@/lib/seo/locales";

const PATH = "/en/natal-chart";
const URL = `${SITE_URL}${PATH}`;
const TITLE = "What Is a Natal Chart? A Beginner's Birth Chart Guide";
const DESCRIPTION = "Learn what a natal chart shows, why birth time matters, and how planets, zodiac signs, houses and aspects combine in a birth chart.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/nataluri-ruka", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, locale: "en_US", alternateLocale: ["ka_GE"] },
};

const FAQ = [
  { q: "What information is needed for a natal chart?", a: "A birth date, birthplace and, ideally, an exact birth time. The time is especially important for the Ascendant and the twelve houses." },
  { q: "Can I calculate a birth chart without a birth time?", a: "Many planetary sign positions can still be calculated, but the Ascendant and houses may be unavailable or unreliable. The Moon can also change signs on some dates." },
  { q: "Does a natal chart predict the future?", a: "A natal chart is traditionally interpreted as a symbolic map of themes and tendencies, not a guaranteed prediction of events." },
];

export default function EnglishNatalChartPage() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <EnglishGuide eyebrow="Birth chart basics" title="What is a natal chart?" intro="A natal chart—also called a birth chart—is a map of the sky for a particular time and place. It records where the Sun, Moon and planets appeared when you were born." georgianPath="/nataluri-ruka">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GeorgianContentNote href="/nataluri-ruka" label="Open the free natal chart calculator" />

      <section>
        <h2>The four building blocks</h2>
        <p>A chart becomes easier to read when you separate it into four layers. Each layer answers a different question:</p>
        <ul className="mt-4 list-disc">
          <li><strong>Planets</strong> represent functions or drives: identity, emotion, communication, attraction, action and growth.</li>
          <li><strong>Zodiac signs</strong> describe the style through which a planet is expressed.</li>
          <li><strong>Houses</strong> divide the chart into twelve areas of life, such as home, relationships, work and community.</li>
          <li><strong>Aspects</strong> are angular relationships between planets and describe how different chart factors cooperate or create tension.</li>
        </ul>
      </section>

      <section>
        <h2>The Sun, Moon and Ascendant</h2>
        <p>The “big three” are a practical entry point. The Sun is associated with identity and conscious direction. The Moon is linked with emotional habits, safety and instinctive responses. The Ascendant, or rising sign, describes the zodiac sign appearing on the eastern horizon at birth and sets the house structure of the chart.</p>
        <p>They should not be treated as three competing labels. Together they describe different layers of experience, and their relationships to other planets add important context.</p>
      </section>

      <section>
        <h2>Why an exact birth time matters</h2>
        <p>The sky moves continuously. A difference of several minutes can shift house cusps, while a larger difference may change the rising sign. If your recorded time is approximate, treat house-based interpretation cautiously. It is better to acknowledge uncertainty than to present a false level of precision.</p>
      </section>

      <section>
        <h2>How to approach your chart</h2>
        <p>Start with repeated themes instead of interpreting every placement separately. Notice which elements and modalities are emphasized, which planets are close to the chart angles, and which aspects repeat similar ideas. Contradictions are normal: people contain competing needs, and a chart is meant to describe a system rather than a single personality label.</p>
        <p>Astrology is best used here as a reflective and cultural framework. It is not a scientific diagnosis and should not replace professional medical, psychological, financial or legal guidance.</p>
      </section>

      <section>
        <h2>Frequently asked questions</h2>
        <div className="mt-5 space-y-3">
          {FAQ.map((f) => <details key={f.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium text-foreground">{f.q}</summary><p className="mt-3 text-foreground/80">{f.a}</p></details>)}
        </div>
      </section>

      <p className="text-sm text-muted-foreground">Continue with the <Link href="/en/zodiac" className="text-[var(--vivida-cyan)] hover:underline">English zodiac guide</Link> or learn how a <Link href="/en/horoscope" className="text-[var(--vivida-cyan)] hover:underline">horoscope differs from a birth chart</Link>.</p>
    </EnglishGuide>
  );
}
