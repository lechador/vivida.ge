import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Reader notification — a buyer paid for one of their services and the
 * payment verified on-chain. Transactional: sent immediately, exactly once
 * per booking (idempotency key on the booking id). Never includes the
 * buyer's question or birth details — those stay inside the booking.
 */
export function BookingPaidEmail({
  recipientName,
  buyerName,
  serviceTitle,
  amountUsdc,
  orderUrl,
  locale = "en",
}: {
  recipientName: string | null;
  buyerName: string;
  serviceTitle: string;
  amountUsdc: string;
  orderUrl: string;
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
          ? `${buyerName} paid ${amountUsdc} USDC for ${serviceTitle}`
          : `${buyerName}-მ გადაგიხადა ${amountUsdc} USDC (${serviceTitle})`
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
        {en ? "You have a paid order" : "გადახდილი შეკვეთა გაქვს"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        <strong>{buyerName}</strong> {en ? "just paid" : "ახლახან გადაიხადა"}{" "}
        <strong>{amountUsdc} USDC</strong> {en ? "for" : "—"}{" "}
        <strong>{serviceTitle}</strong>
        {en
          ? ". The payment is verified on Solana."
          : ". გადახდა Solana-ზე დადასტურებულია."}
      </Text>
      <Text style={paragraphStyle}>
        {en
          ? "Their question and birth details are waiting in your inbox. Deliver the reading from there — the buyer is notified the moment you do."
          : "მათი კითხვა და დაბადების მონაცემები შენს შემოსულებში გელოდება. საკითხავი იქიდან მიაწოდე — მყიდველი მაშინვე მიიღებს შეტყობინებას."}
      </Text>

      <Button href={orderUrl} style={buttonStyle}>
        {en ? "View order" : "შეკვეთის ნახვა"}
      </Button>

      <Text style={mutedStyle}>
        {en
          ? "Manage these emails anytime from My readings → notifications."
          : "ამ წერილების მართვა შეგიძლია My readings → შეტყობინებებიდან."}
      </Text>
    </EmailLayout>
  );
}

export function bookingPaidSubject(
  serviceTitle: string,
  locale: UserLocale = "en",
): string {
  return locale === "en"
    ? `New paid order: ${serviceTitle} · Vivida`
    : `ახალი გადახდილი შეკვეთა: ${serviceTitle} · Vivida`;
}
