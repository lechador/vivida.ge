import { Button, Heading, Section, Text } from "@react-email/components";

import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

export function VerifiedBadgeGiftEmail({
  name,
  profileUrl,
  locale = "ka",
}: {
  name: string | null;
  profileUrl: string;
  locale?: UserLocale;
}) {
  const copy =
    locale === "en"
      ? {
          preview: "Your Vivida profile received a Verified Badge",
          heading: "You received a Verified Badge as a gift",
          greeting: name ? `Hi, ${name}!` : "Hi!",
          body: "The Vivida team gifted your profile a Verified Badge. It is now visible beside your name on your profile, in the community, and in comments.",
          note: "The badge is a gift and does not require a paid subscription.",
          cta: "View my profile",
        }
      : {
          preview: "შენს Vivida პროფილს Verified Badge მიენიჭა",
          heading: "Verified Badge საჩუქრად მიიღე",
          greeting: name ? `გამარჯობა, ${name}!` : "გამარჯობა!",
          body: "Vivida-ს გუნდმა შენს პროფილს Verified Badge აჩუქა. ნიშანი უკვე ჩანს შენი სახელის გვერდით — პროფილში, საზოგადოებასა და კომენტარებში.",
          note: "Badge საჩუქარია და ფასიან გამოწერას არ საჭიროებს.",
          cta: "ნახე ჩემი პროფილი",
        };

  return (
    <EmailLayout preview={copy.preview} locale={locale}>
      <Section
        style={{
          margin: "0 0 20px",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            backgroundColor: "#22d3ee",
            borderRadius: "999px",
            color: "#0b0814",
            display: "inline-block",
            fontSize: "28px",
            fontWeight: 800,
            height: "52px",
            lineHeight: "52px",
            margin: 0,
            width: "52px",
          }}
        >
          ✓
        </Text>
      </Section>
      <Heading
        as="h1"
        style={{
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          lineHeight: "32px",
          margin: "0 0 16px",
          textAlign: "center",
        }}
      >
        {copy.heading}
      </Heading>
      <Text style={paragraphStyle}>{copy.greeting}</Text>
      <Text style={paragraphStyle}>{copy.body}</Text>
      <Button href={profileUrl} style={buttonStyle}>
        {copy.cta}
      </Button>
      <Text style={mutedStyle}>{copy.note}</Text>
    </EmailLayout>
  );
}
