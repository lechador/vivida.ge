import { Button, Heading, Section, Text } from "@react-email/components";

import { EmailLayout, buttonStyle, paragraphStyle } from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { WinbackStep } from "@/lib/winback-sequence";

/**
 * One React Email template for all three dormant win-back steps.
 *
 * The copy comes from `lib/winback-sequence.ts` (approved in COR-21), so the
 * email body and the campaign record cannot disagree. Personalization is
 * deliberately limited to the recipient's name: the brief forbids reusing the
 * daily-blast headline, credits, prices, or scarcity.
 */
export function WinbackSequenceEmail({
  step,
  ctaUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  step: WinbackStep;
  ctaUrl: string;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const pl = locale === "pl";
  const en = locale === "en";
  const body = pl ? step.bodyPl : en ? step.bodyEn : step.bodyKa;
  const preview = pl
    ? step.preheaderPl
    : en
      ? step.preheaderEn
      : step.preheaderKa;
  const heading = pl ? step.subjectPl : en ? step.subjectEn : step.subjectKa;
  const cta = pl ? step.ctaPl : en ? step.ctaEn : step.ctaKa;
  return (
    <EmailLayout
      preview={preview}
      unsubscribeUrl={unsubscribeUrl}
      locale={locale}
    >
      <Section style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <Text
          style={{ fontSize: "40px", lineHeight: "48px", margin: "0 0 8px" }}
        >
          {step.step === 1 ? "🌙✨" : step.step === 2 ? "🌙" : "🃏"}
        </Text>
        <Heading
          as="h1"
          style={{
            color: "#ffffff",
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: "34px",
            margin: "0 0 10px",
          }}
        >
          {heading}
        </Heading>
      </Section>

      {body.map((paragraph) => (
        <Text
          key={paragraph.slice(0, 24)}
          style={{ ...paragraphStyle, fontSize: "16px", lineHeight: "26px" }}
        >
          {paragraph}
        </Text>
      ))}

      <Section style={{ textAlign: "center", padding: "10px 0 8px" }}>
        <Button href={ctaUrl} style={buttonStyle}>
          {cta}
        </Button>
      </Section>
    </EmailLayout>
  );
}
