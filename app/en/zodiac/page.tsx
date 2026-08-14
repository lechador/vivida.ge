import type { Metadata } from "next";
import Link from "next/link";

import { EnglishGuide } from "@/components/en/english-guide";
import { SIGNS } from "@/lib/zodiac";
import { ENGLISH_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const PATH = "/en/zodiac";
const TITLE = "The 12 Zodiac Signs: Elements, Modalities and Rulers";
const DESCRIPTION = "A clear English introduction to all twelve zodiac signs, their date ranges, elements, modalities and traditional planetary rulers.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` }, description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/zodiac", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${ENGLISH_SITE_URL}/zodiac`, locale: "en_US", alternateLocale: ["ka_GE"] },
};

const DETAILS: Record<string, { dates: string; element: string; modality: string; ruler: string; summary: string }> = {
  aries: { dates: "Mar 21–Apr 19", element: "Fire", modality: "Cardinal", ruler: "Mars", summary: "direct, initiating and action-oriented" },
  taurus: { dates: "Apr 20–May 20", element: "Earth", modality: "Fixed", ruler: "Venus", summary: "steady, sensory and resource-conscious" },
  gemini: { dates: "May 21–Jun 20", element: "Air", modality: "Mutable", ruler: "Mercury", summary: "curious, adaptable and communicative" },
  cancer: { dates: "Jun 21–Jul 22", element: "Water", modality: "Cardinal", ruler: "Moon", summary: "protective, responsive and emotionally perceptive" },
  leo: { dates: "Jul 23–Aug 22", element: "Fire", modality: "Fixed", ruler: "Sun", summary: "expressive, warm and creatively self-directed" },
  virgo: { dates: "Aug 23–Sep 22", element: "Earth", modality: "Mutable", ruler: "Mercury", summary: "observant, practical and improvement-focused" },
  libra: { dates: "Sep 23–Oct 22", element: "Air", modality: "Cardinal", ruler: "Venus", summary: "relational, balancing and aesthetically aware" },
  scorpio: { dates: "Oct 23–Nov 21", element: "Water", modality: "Fixed", ruler: "Mars / Pluto", summary: "intense, private and transformation-oriented" },
  sagittarius: { dates: "Nov 22–Dec 21", element: "Fire", modality: "Mutable", ruler: "Jupiter", summary: "exploratory, candid and meaning-seeking" },
  capricorn: { dates: "Dec 22–Jan 19", element: "Earth", modality: "Cardinal", ruler: "Saturn", summary: "structured, patient and responsibility-minded" },
  aquarius: { dates: "Jan 20–Feb 18", element: "Air", modality: "Fixed", ruler: "Saturn / Uranus", summary: "independent, conceptual and community-aware" },
  pisces: { dates: "Feb 19–Mar 20", element: "Water", modality: "Mutable", ruler: "Jupiter / Neptune", summary: "imaginative, receptive and compassionate" },
};

export default function EnglishZodiacPage() {
  return (
    <EnglishGuide eyebrow="Zodiac reference" title="The twelve zodiac signs" intro="The zodiac is a twelve-part framework used to describe styles of expression. Every natal chart contains all twelve signs, even when only a few receive strong emphasis." georgianPath="/zodiac">
      <section>
        <h2>Signs are more than Sun-sign labels</h2>
        <p>Your Sun sign is based on the Sun’s position at birth, but the Moon, Mercury, Venus, Mars and every other chart factor also occupy signs. A person can therefore express several sign styles in different contexts. Houses and aspects further change how a placement is experienced.</p>
      </section>
      <section>
        <h2>Signs at a glance</h2>
        <p>Date boundaries can shift slightly by year and time zone. Use a calculated natal chart when a birth falls near a sign change.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SIGNS.map((sign) => {
            const d = DETAILS[sign.key];
            return (
              <article key={sign.key} className="rounded-2xl border border-border bg-card/50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3"><span className="text-3xl text-[var(--vivida-violet)]">{sign.symbol}</span><div><h3>{sign.labelEn}</h3><p className="text-xs text-muted-foreground">{d.dates}</p></div></div>
                  <Link href={`/zodiac/${sign.key}`} className="text-xs text-[var(--vivida-cyan)] hover:underline">Complete guide</Link>
                </div>
                <p className="mt-4 text-sm text-foreground/80">Traditionally {d.summary}.</p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-xs"><div><dt className="text-muted-foreground">Element</dt><dd className="font-medium text-foreground">{d.element}</dd></div><div><dt className="text-muted-foreground">Modality</dt><dd className="font-medium text-foreground">{d.modality}</dd></div><div><dt className="text-muted-foreground">Ruler</dt><dd className="font-medium text-foreground">{d.ruler}</dd></div></dl>
              </article>
            );
          })}
        </div>
      </section>
      <section>
        <h2>Elements and modalities</h2>
        <p>The four elements group signs by broad orientation: Fire emphasizes inspiration and action, Earth practicality and material reality, Air ideas and exchange, and Water emotion and sensitivity. The three modalities describe movement: Cardinal signs initiate, Fixed signs sustain, and Mutable signs adapt.</p>
        <p>These categories are interpretive shorthand, not measures of value. A balanced reading looks at the full chart and avoids reducing a person to stereotypes.</p>
      </section>
    </EnglishGuide>
  );
}
