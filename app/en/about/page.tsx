import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

import { EnglishGuide } from "@/components/en/english-guide";
import { SITE_URL } from "@/lib/seo/locales";

const PATH = "/en/about";
const TITLE = "About Vivida";
const DESCRIPTION = "Learn what Vivida is, how its astrology and self-discovery content is created, and how to contact the team in Georgia.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Astrology and Self-Discovery` }, description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}`, languages: { en: `${SITE_URL}${PATH}`, "x-default": SITE_URL } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, locale: "en_US" },
};

export default function EnglishAboutPage() {
  return (
    <EnglishGuide eyebrow="About us" title="Vivida makes complex chart ideas easier to explore" intro="Vivida is a Georgia-based astrology and self-discovery platform that combines natal-chart calculations, educational guides and reflective tools in one experience." georgianPath="/">
      <section>
        <h2>What we build</h2>
        <p>Our public guides explain the basic structure of natal charts, zodiac signs, planetary cycles and relationship synastry. Registered users can also access personalized chart features and community tools. The original product was created in Georgian; the English section is being introduced carefully, beginning with core navigation and educational material.</p>
        <p>We intentionally label any destination that still uses Georgian. We would rather publish a smaller, complete English section than present untranslated interpretations as if they were localized.</p>
      </section>
      <section>
        <h2>How to use our content</h2>
        <p>Vivida’s astrology content is intended for entertainment, cultural interest and personal reflection. It is not medical, psychological, financial or legal advice, and it should not replace qualified professional help or direct communication with other people.</p>
        <p>Personality and cognitive tests are also educational self-discovery tools. Online results are estimates and are not clinical diagnoses or professionally administered assessments.</p>
      </section>
      <section>
        <h2>Transparency and contact</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/50 p-5"><MapPin className="size-5 text-[var(--vivida-violet)]" /><h3 className="mt-3">Based in Georgia</h3><p className="mt-2 text-sm text-muted-foreground">Vivida is operated from Georgia and serves a growing multilingual audience.</p></div>
          <div className="rounded-2xl border border-border bg-card/50 p-5"><ShieldCheck className="size-5 text-[var(--vivida-violet)]" /><h3 className="mt-3">Privacy information</h3><p className="mt-2 text-sm text-muted-foreground">Read what data we collect and how it is handled in our <Link href="/en/privacy" className="text-[var(--vivida-cyan)] hover:underline">privacy policy</Link>.</p></div>
          <div className="rounded-2xl border border-border bg-card/50 p-5"><Mail className="size-5 text-[var(--vivida-violet)]" /><h3 className="mt-3">Contact</h3><p className="mt-2 text-sm text-muted-foreground">Questions or corrections: <a href="mailto:hello@vivida.ge" className="text-[var(--vivida-cyan)] hover:underline">hello@vivida.ge</a>.</p></div>
        </div>
      </section>
    </EnglishGuide>
  );
}
