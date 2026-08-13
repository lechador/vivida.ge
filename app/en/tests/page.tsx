import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Fingerprint, HeartHandshake, Layers } from "lucide-react";

import { EnglishGuide } from "@/components/en/english-guide";
import { GeorgianContentNote } from "@/components/en/georgian-content-note";
import { ENGLISH_SITE_URL, GEORGIAN_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const PATH = "/en/tests";
const TITLE = "Personality, IQ and Emotional Intelligence Tests";
const DESCRIPTION = "Explore Vivida's personality, IQ, EQ and Big Five self-discovery tests. Test interfaces and results currently remain available in Georgian.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` }, description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/tests", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${ENGLISH_SITE_URL}/tests`, locale: "en_US", alternateLocale: ["ka_GE"] },
};

const TESTS = [
  { href: "/mbti", Icon: Fingerprint, title: "Astro-MBTI personality test", text: "Explore preferences in energy, information, decisions and structure through a sixteen-type framework." },
  { href: "/iq-testi", Icon: Brain, title: "IQ test", text: "A structured set of logic and pattern questions that provides an estimated score—not a clinical assessment." },
  { href: "/eq-testi", Icon: HeartHandshake, title: "Emotional intelligence test", text: "Reflect on emotional awareness, regulation, empathy and relationship skills." },
  { href: "/big-five", Icon: Layers, title: "Big Five personality test", text: "Review five broad trait dimensions used in contemporary personality research." },
];

export default function EnglishTestsPage() {
  return (
    <EnglishGuide eyebrow="Self-discovery" title="Tests and personality tools" intro="Vivida offers several structured tools for reflection. This English page explains what they cover; the questionnaires and detailed results remain in Georgian for now." georgianPath="/tests">
      <GeorgianContentNote href="/tests" label="Open the Georgian tests hub" />
      <section>
        <h2>Choose a test</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TESTS.map(({ href, Icon, title, text }) => (
            <Link key={href} href={`${GEORGIAN_SITE_URL}${href}`} hrefLang="ka-GE" className="rounded-2xl border border-border bg-card/50 p-5 transition-colors hover:border-[var(--vivida-violet)]/45 hover:bg-card">
              <Icon className="size-6 text-[var(--vivida-violet)]" /><h3 className="mt-4">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p><span className="mt-4 inline-block text-xs font-medium text-[var(--vivida-cyan)]">Start in Georgian →</span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2>How to interpret a result</h2>
        <p>Online scores are best treated as estimates and prompts for reflection. Results can be influenced by language, mood, context, familiarity with question formats and how honestly a person answers. A personality type is not a diagnosis, and an online IQ or EQ score is not equivalent to a professionally administered assessment.</p>
        <p>Use results to notice patterns, compare frameworks and identify questions worth exploring. Avoid using them to rank personal worth or make high-stakes decisions about health, education or employment.</p>
      </section>
    </EnglishGuide>
  );
}
