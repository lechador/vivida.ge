import type { Metadata } from "next";
import Link from "next/link";

import { EnglishGuide } from "@/components/en/english-guide";
import {
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const PATH = "/en/privacy";
const TITLE = "Privacy Policy";
const DESCRIPTION = "Vivida's English privacy policy: what information is collected, why it is used, service providers, retention, cookies and your data rights.";
const LAST_UPDATED = "August 13, 2026";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` }, description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/privacy", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${ENGLISH_SITE_URL}/privacy`, locale: "en_US", alternateLocale: ["ka_GE"] },
};

export default function EnglishPrivacyPage() {
  return (
    <EnglishGuide eyebrow="Legal" title="Privacy policy" intro={`Last updated: ${LAST_UPDATED}. This policy explains how Vivida collects, uses and protects information when you use vivida.ge or vividaastro.com.`} georgianPath="/privacy">
      <section><h2>1. Who operates Vivida</h2><p>Vivida is operated by an individual entrepreneur registered in Georgia, identification number <strong>09001026676</strong>. Privacy questions and data requests can be sent to <a href="mailto:hello@vivida.ge" className="text-[var(--vivida-cyan)] hover:underline">hello@vivida.ge</a>.</p></section>
      <section><h2>2. Information we collect</h2><ul className="mt-4 list-disc"><li>Account information received through Google sign-in, such as your name, email address and profile image.</li><li>Birth details you provide for chart calculations, including date, time and place of birth.</li><li>Profile content you choose to add, including a biography, preferences, visibility settings and uploaded photographs.</li><li>Content and interactions you create through community features, such as messages, posts and reactions.</li><li>Technical and usage information, including device, browser, approximate location, referral and interaction events collected through essential logs and configured analytics.</li><li>Payment and transaction references when you purchase a paid feature. Full card details are processed by the payment provider and are not stored by Vivida.</li></ul></section>
      <section><h2>3. Why we use information</h2><p>We use information to create and secure accounts, calculate natal charts, provide requested interpretations and forecasts, operate social features, process purchases, respond to support requests, prevent abuse and understand how the service performs. Where required, processing is based on your consent, performance of our agreement, legal obligations or our legitimate interest in running a safe and reliable service.</p></section>
      <section><h2>4. Service providers</h2><p>Vivida uses carefully selected providers to operate the service. These may include Google for authentication, Neon/PostgreSQL and hosting infrastructure for application data, Cloudflare R2 for media storage, analytics and advertising measurement providers when configured, payment processors, and AI providers used to generate requested interpretations. We share only the information reasonably necessary for the relevant function.</p><p>Natal-chart calculations are performed from birth coordinates and time. AI interpretation requests are designed to use chart data rather than unnecessary contact information.</p></section>
      <section><h2>5. Retention and deletion</h2><p>Account information is generally retained while your account remains active. When an account is deleted, profile content, photos and messages are scheduled for deletion; birth data and cached chart material may remain in backups or deletion queues for up to 30 days. Financial records may be retained for the period required by tax and accounting law.</p></section>
      <section><h2>6. Your rights</h2><p>Depending on applicable law, you may request access, correction, deletion, restriction or export of your personal data, and may withdraw consent for future processing. You can change many profile settings inside your account or contact us at <a href="mailto:hello@vivida.ge" className="text-[var(--vivida-cyan)] hover:underline">hello@vivida.ge</a>. You may also have the right to complain to the relevant data-protection authority.</p></section>
      <section><h2>7. Cookies, analytics and advertising</h2><p>Essential cookies keep sessions secure and remember necessary settings. Where configured, analytics and advertising technologies help us measure traffic, understand feature use and evaluate campaigns. Browser settings and supported consent controls can limit non-essential technologies, though disabling essential cookies may prevent account features from working.</p></section>
      <section><h2>8. Security and international processing</h2><p>Information is transmitted over HTTPS and protected through access controls and modern infrastructure practices. No internet service can guarantee absolute security. Providers may process data outside Georgia; when relevant, we rely on the safeguards made available under applicable data-protection law.</p></section>
      <section><h2>9. Children</h2><p>Vivida is not directed to children under 16. If we learn that a child provided personal data without the required permission, we will take reasonable steps to delete it.</p></section>
      <section><h2>10. Changes and contact</h2><p>We may update this policy as the service changes. The date above will be revised when material changes are published. Questions can be sent to <a href="mailto:hello@vivida.ge" className="text-[var(--vivida-cyan)] hover:underline">hello@vivida.ge</a>. The Georgian policy remains available at <Link href={`${GEORGIAN_SITE_URL}/privacy`} hrefLang="ka-GE" className="text-[var(--vivida-cyan)] hover:underline">vivida.ge/privacy</Link>.</p></section>
    </EnglishGuide>
  );
}
