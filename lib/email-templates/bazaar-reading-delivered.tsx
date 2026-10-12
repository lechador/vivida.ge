import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Buyer notification, their reader delivered the reading. Transactional:
 * sent immediately, exactly once per booking. Never includes the reading
 * itself, the inbox holds the private content, the email is only the knock.
 */
export function ReadingDeliveredEmail({
  recipientName,
  readerName,
  serviceTitle,
  readingUrl,
  locale = "en",
}: {
  recipientName: string | null;
  readerName: string;
  serviceTitle: string;
  readingUrl: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const greeting = recipientName
    ? en
      ? `Hello, ${recipientName}!`
      : `სალამი, ${recipientName}!`
    : en
      ? "Hello!"
      : "სალამი!";
  return (
    <EmailLayout
      preview={
        en
          ? `${readerName} delivered your ${serviceTitle}`
          : `${readerName}-მ მოგაწოდა შენი ${serviceTitle}`
      }
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
        {en ? "Your reading is ready" : "შენი საკითხავი მზადაა"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        <strong>{readerName}</strong>{" "}
        {en ? "has delivered your" : "მოგაწოდა შენი"}{" "}
        <strong>{serviceTitle}</strong>
        {en
          ? ". Take your time with it, it's waiting in your inbox."
          : ". მშვიდად გაეცანი, ის შენს შემოსულებში გელოდება."}
      </Text>

      <Button href={readingUrl} style={buttonStyle}>
        {en ? "Read your reading" : "საკითხავის წაკითხვა"}
      </Button>

      <Text style={mutedStyle}>
        {en
          ? "If it resonated, a review on your reader's profile goes a long way. Manage these emails anytime from My readings → notifications."
          : "თუ მოგეწონა, მიმოხილვა მკითხველის პროფილზე ბევრს ნიშნავს. ამ წერილების მართვა შეგიძლია My readings → შეტყობინებებიდან."}
      </Text>
    </EmailLayout>
  );
}

export function readingDeliveredSubject(locale: UserLocale = "en"): string {
  return locale === "en"
    ? "Your reading is ready · Vivida"
    : "შენი საკითხავი მზადაა · Vivida";
}
