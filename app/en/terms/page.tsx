import type { Metadata } from "next";
import Link from "next/link";

import { EnglishGuide } from "@/components/en/english-guide";
import { DEFAULT_OG_IMAGE, ENGLISH_SITE_URL, GEORGIAN_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const PATH = "/en/terms";
const TITLE = "Terms and Conditions";
const DESCRIPTION = "The English terms governing use of Vivida's astrology, self-discovery, account and community features.";
const LAST_UPDATED = "August 16, 2026";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` }, description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/terms", "en"),
  openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: `${ENGLISH_SITE_URL}/terms`, locale: "en_US", alternateLocale: ["ka_GE"] },
};

export default function EnglishTermsPage() {
  return (
    <EnglishGuide eyebrow="Legal" title="Terms and conditions" intro={`Last updated: ${LAST_UPDATED}. By accessing or using Vivida, you agree to these terms.`} georgianPath="/terms">
      <section><h2>1. Operator and acceptance</h2><p>Vivida is operated by an individual entrepreneur registered in Georgia, identification number <strong>09001026676</strong>. If you do not agree to these terms, please do not use the service.</p></section>
      <section><h2>2. Eligibility and accounts</h2><p>You must be at least 18 years old. Accounts may be created through Google sign-in or email. You are responsible for protecting access to your account and for activity performed through it.</p></section>
      <section><h2>3. Service availability and payments</h2><p>Vivida may offer free features, one-time credit packs and automatically renewing PRO subscriptions. The price, currency, billing interval and included access are shown before purchase. PRO renews monthly until cancelled; you can cancel from the subscription page or Stripe billing portal and retain access until the paid period ends. Mandatory UK consumer and refund rights are unaffected.</p></section>
      <section><h2>4. User content and conduct</h2><p>You retain rights in profile text, photographs and other content you submit. You grant Vivida a limited, non-exclusive licence to store, display and process that content only as needed to operate and improve the service. You must have the right to upload the content.</p><p>You may not impersonate others, upload unlawful or abusive material, violate privacy or intellectual-property rights, send spam or phishing content, attempt unauthorized access, interfere with the service, or use Vivida to harm another person.</p></section>
      <section><h2>5. Astrology and test content</h2><p>Astrology interpretations, horoscopes, compatibility results and personality tools are provided for entertainment, education and personal reflection. They are not medical, psychological, financial, legal or other professional advice. Online test results are estimates and not diagnoses. Seek qualified professional advice for important decisions.</p></section>
      <section><h2>6. Intellectual property</h2><p>Vivida’s name, branding, interface, original text, software and generated content systems are protected by applicable intellectual-property law. Except where law permits, you may not copy, reproduce, scrape, sell or commercially exploit them without written permission.</p></section>
      <section><h2>7. Privacy</h2><p>Our handling of personal information is explained in the <Link href="/privacy" className="text-[var(--vivida-cyan)] hover:underline">privacy policy</Link>, which forms part of these terms.</p></section>
      <section><h2>8. Suspension and termination</h2><p>You may request deletion of your account. Vivida may restrict or terminate access when these terms are violated, when required by law, or when necessary to protect users, the service or third parties. Where appropriate, we will provide notice or an opportunity to appeal.</p></section>
      <section><h2>9. Disclaimers and liability</h2><p>The service is provided on an “as is” and “as available” basis to the extent permitted by law. We do not guarantee uninterrupted availability or that interpretive content will be error-free. To the maximum extent permitted by law, Vivida is not liable for indirect, incidental or consequential loss arising from use of the service. Nothing in these terms excludes liability that cannot lawfully be excluded.</p></section>
      <section><h2>10. Governing law and changes</h2><p>These terms are governed by the laws of Georgia, and disputes are subject to the competent courts of Georgia unless mandatory consumer law provides otherwise. We may update the terms as the service changes. Continued use after an effective update indicates acceptance where permitted by law.</p></section>
      <section><h2>11. Contact</h2><p>Questions about these terms can be sent to <a href="mailto:hello@vivida.ge" className="text-[var(--vivida-cyan)] hover:underline">hello@vivida.ge</a>. The Georgian terms are available at <Link href={`${GEORGIAN_SITE_URL}/terms`} hrefLang="ka-GE" className="text-[var(--vivida-cyan)] hover:underline">vivida.ge/terms</Link>.</p></section>
    </EnglishGuide>
  );
}
