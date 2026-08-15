import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const PRIVACY_SECTIONS: Section[] = [
  {
    title: "1. Who we are",
    paragraphs: [
      "Vivida is a web application available at vivida.ge and vividaastro.com. It provides personal astrology tools, including birth charts, daily forecasts, and compatibility readings. We act as the controller of your personal data.",
      "The service is operated by an individual entrepreneur registered under identification number 09001026676.",
    ],
  },
  {
    title: "2. Information we collect",
    paragraphs: [
      "When you use Vivida, we may collect the following information:",
    ],
    bullets: [
      "Account data: your name, email address, and profile photo from Google OAuth, or the account details you provide when signing up by email.",
      "Birth data: date, time, and place of birth, including coordinates and time zone, which are required to calculate a natal chart.",
      "Public profile data: username, biography, and photos you choose to upload. Visibility depends on your profile settings.",
      "Activity data: messages, friendship requests, notes, test results, and other information required to provide the service.",
      "Technical and campaign data: IP address, browser type, device information, referral parameters, cookie identifiers, and interaction events used for security, analytics, and campaign measurement when you consent.",
      "Payment data: the credit pack purchased, amount, currency, and transaction identifier. Full card details are processed by the payment provider and are not stored by Vivida.",
    ],
  },
  {
    title: "3. Why we process data",
    bullets: [
      "Performance of our contract: calculating charts, generating interpretations, and operating profiles and other requested features.",
      "Your consent: for optional features such as uploaded photos, public-profile visibility, and notifications.",
      "Legitimate interests: protecting the service, preventing fraud and abuse, diagnosing problems, and improving Vivida.",
      "Legal obligations: retaining required financial records and responding to lawful requests.",
    ],
  },
  {
    title: "4. Who receives data",
    paragraphs: [
      "Vivida does not sell your personal data. We share only what is necessary with service providers that help us operate the product.",
      "Natal-chart calculations run on our server. Birth coordinates and time are not sent to an AI provider. AI requests use already calculated chart data without unnecessary identifiers.",
    ],
    bullets: [
      "Google for OAuth authentication.",
      "Vercel for application hosting and technical request processing.",
      "Neon Postgres for database hosting in the United States or European Union.",
      "Cloudflare R2 for photo storage and Cloudflare Turnstile for bot and abuse prevention.",
      "OpenRouter and Google Gemini for AI interpretations. Only the numerical chart information needed for the reading is sent; names and contact details are excluded.",
      "Stripe for one-time credit payments and automatically renewing PRO subscriptions. Vivida neither receives nor stores full card information.",
      "Resend for account and transactional email.",
      "Google Analytics and Meta for product and campaign measurement only after you consent. Meta may receive browser identifiers, campaign data, IP address and user agent, and hashed matching data such as email, internal account ID and country for checkout events. We never send exact birth details, chart inputs, messages, or card details.",
    ],
  },
  {
    title: "5. How long we keep data",
    paragraphs: [
      "We retain your data while your account remains active. After account deletion:",
    ],
    bullets: [
      "Your profile, photos, and messages are deleted immediately.",
      "Birth details and cached charts are deleted within 30 days.",
      "Financial records are retained for the period required by law, generally five to seven years.",
    ],
  },
  {
    title: "6. Your rights",
    paragraphs: [
      "Subject to applicable law, including the GDPR and Georgian data-protection law, you may request access, correction, deletion, portability, or restriction of your personal data. You may withdraw consent at any time for future processing.",
      "To exercise these rights, contact hello@vivida.ge.",
    ],
  },
  {
    title: "7. Security",
    paragraphs: [
      "Data is transmitted using TLS (HTTPS) and stored in protected databases. We use modern safeguards, but no online service can guarantee complete security. We will notify affected users when required after a relevant security incident.",
    ],
  },
  {
    title: "8. Children's privacy",
    paragraphs: [
      "Vivida is intended for adults aged 18 or older. Registration and birth-data validation enforce this requirement.",
    ],
  },
  {
    title: "9. Cookies and analytics",
    paragraphs: [
      "Vivida uses essential cookies for authentication, security, and bot prevention. Analytics, Meta Pixel, campaign attribution cookies, and server-side Meta conversion measurement are activated only after you choose Allow analytics & Meta.",
      "Essential only is equally available in the consent panel. You can reopen Privacy choices on any page, withdraw consent, and remove non-essential browser cookies. Withdrawal applies to future measurement and does not affect the lawfulness of earlier processing.",
    ],
  },
  {
    title: "10. International transfers",
    paragraphs: [
      "Some providers, including Google, Vercel, Cloudflare, Neon, OpenRouter, Stripe, and Resend, operate outside Georgia. International transfers rely on standard contractual clauses or comparable safeguards where required.",
    ],
  },
  {
    title: "11. Changes to this policy",
    paragraphs: [
      "If we make a material change, we will notify you by email or within the application. Continued use after the effective date means that the updated policy applies.",
    ],
  },
  {
    title: "12. Contact",
    paragraphs: [
      "For privacy questions or requests, email hello@vivida.ge. If you believe your rights have been infringed, you may also complain to the relevant supervisory authority.",
    ],
  },
];

const TERMS_SECTIONS: Section[] = [
  {
    title: "1. Acceptance of these terms",
    paragraphs: [
      "By using Vivida at vivida.ge or vividaastro.com, you agree to these Terms and Conditions. If you do not agree, do not use the service.",
      "The service is operated by an individual entrepreneur registered under identification number 09001026676.",
    ],
  },
  {
    title: "2. Who may use Vivida",
    paragraphs: [
      "Vivida is intended for adults aged 18 or older. By registering, you confirm that you are at least 18.",
    ],
  },
  {
    title: "3. Creating an account",
    paragraphs: [
      "You may register with Google or with an email address and password. You are responsible for protecting your sign-in credentials and for notifying us promptly about unauthorized use. We never receive your Google password; passwords created directly with Vivida are stored only in a secure hashed form.",
    ],
  },
  {
    title: "4. Free features, credits, and payments",
    paragraphs: [
      "Vivida provides free features, one-time credit packs, and country-specific Vivida PRO plans. PRO is an automatically renewing subscription unless you cancel it; its price, billing interval, included access, and renewal date are shown before purchase and on the subscription page.",
      "The credit cost of an action and the price of a credit pack are shown before confirmation. Free limits, bonuses, prices, and available features may change. We will give advance notice of material changes. Mandatory payment and refund rights remain governed by applicable law.",
    ],
  },
  {
    title: "5. User content",
    paragraphs: [
      "You may upload photos, write a biography, and create a public profile. You keep ownership of your content. By uploading it, you grant Vivida a non-exclusive, royalty-free licence to store and display it only as needed to operate the service.",
      "You may not upload another person's photo without consent, post illegal, abusive, or violent material, impersonate another person, or distribute spam, phishing, or malicious links.",
    ],
  },
  {
    title: "6. Astrology content is for entertainment",
    paragraphs: [
      "Vivida's astrology interpretations are provided for entertainment and self-reflection. They are not medical, psychological, financial, or legal advice. Consult qualified professionals before making important decisions.",
    ],
  },
  {
    title: "7. Intellectual property",
    paragraphs: [
      "The Vivida brand, logo, design, code, and interpretation systems belong to Vivida or its licensors. Copying, reproducing, or commercially using them without permission is prohibited.",
    ],
  },
  {
    title: "8. Personal data",
    paragraphs: [
      "Our data-processing practices are explained in the Privacy Policy, which forms part of these terms.",
    ],
  },
  {
    title: "9. Ending the service",
    paragraphs: [
      "You may delete your account at any time from the account page. If you breach these terms, Vivida may suspend or delete your account, with or without prior notice where permitted by law.",
    ],
  },
  {
    title: "10. Limitation of liability",
    paragraphs: [
      "Vivida is provided on an “as is” basis. To the extent permitted by law, Vivida is not liable for indirect, incidental, or consequential loss connected with use of the service. Nothing here excludes liability that cannot lawfully be limited.",
    ],
  },
  {
    title: "11. Changes",
    paragraphs: [
      "Vivida may update these terms. We will notify you by email or within the application of material changes. Continued use after the effective date means you accept the updated terms.",
    ],
  },
  {
    title: "12. Governing law",
    paragraphs: [
      "These terms are governed by the laws of Georgia. Disputes will be heard by the courts of Georgia, subject to any mandatory consumer rights that apply to you.",
    ],
  },
  {
    title: "13. Contact",
    paragraphs: ["Questions about these terms may be sent to hello@vivida.ge."],
  },
];

export function LegalPageEn({
  kind,
  lastUpdated,
}: {
  kind: "privacy" | "terms";
  lastUpdated: string;
}) {
  const privacy = kind === "privacy";
  const sections = privacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.28_0.14_300/0.4),transparent_70%)]"
      />
      <SmartHeader
        locale="en"
        georgianPath={privacy ? "/privacy" : "/terms"}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Legal
        </div>
        <h1 className="mb-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {privacy ? "Privacy Policy" : "Terms and Conditions"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
        <article className="mt-10 space-y-8 text-foreground/85">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
              {kind === "terms" && section.title.startsWith("8.") && (
                <p className="mt-2">
                  <Link
                    href="/privacy"
                    className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
                  >
                    Read the Privacy Policy
                  </Link>
                  .
                </p>
              )}
              {section.title.startsWith(privacy ? "12." : "13.") && (
                <p className="mt-2">
                  <a
                    href="mailto:hello@vivida.ge"
                    className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
                  >
                    hello@vivida.ge
                  </a>
                </p>
              )}
            </section>
          ))}
        </article>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}
