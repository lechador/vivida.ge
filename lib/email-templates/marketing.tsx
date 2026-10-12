import { Button, Heading, Text } from "@react-email/components";

import { EmailLayout, buttonStyle, paragraphStyle } from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Generic marketing template, admin types subject + body in the panel,
 * we wrap it in the brand chrome. Body is split on \n\n into paragraphs.
 * No markdown rendering: we keep it deliberately plain so admin can't
 * accidentally embed JS/HTML.
 */
export function MarketingEmail({
  name,
  heading,
  body,
  ctaLabel,
  ctaUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  heading: string;
  body: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const greeting = name
    ? en
      ? `Hello, ${name}!`
      : `სალამი, ${name}!`
    : en
      ? "Hello!"
      : "სალამი!";
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  return (
    <EmailLayout
      preview={heading}
      unsubscribeUrl={unsubscribeUrl}
      locale={locale}
    >
      <Heading
        as="h1"
        style={{
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          lineHeight: "32px",
          margin: "0 0 16px",
        }}
      >
        {heading}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      {paragraphs.map((p, i) => (
        <Text key={i} style={paragraphStyle}>
          {p}
        </Text>
      ))}

      {ctaLabel && ctaUrl ? (
        <div style={{ marginTop: 16 }}>
          <Button href={ctaUrl} style={buttonStyle}>
            {ctaLabel}
          </Button>
        </div>
      ) : null}
    </EmailLayout>
  );
}
