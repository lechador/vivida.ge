import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

/**
 * Notification email, fired only when the recipient has been absent
 * from the site for >1h, throttled to one per hour. The "from" name is
 * the requester; we send to the *recipient* of the friend request.
 */
import type { UserLocale } from "@/lib/i18n/user-locale";

export function FriendRequestEmail({
  recipientName,
  fromName,
  fromUsername,
  friendsUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  recipientName: string | null;
  fromName: string;
  fromUsername: string | null;
  friendsUrl: string;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const pl = locale === "pl";
  const en = locale === "en";
  const greeting = recipientName
    ? pl
      ? `Cześć, ${recipientName}!`
      : en
        ? `Hello, ${recipientName}!`
        : `სალამი, ${recipientName}!`
    : pl
      ? "Cześć!"
      : en
        ? "Hello!"
        : "სალამი!";
  const fromHandle = fromUsername ? `@${fromUsername}` : null;
  return (
    <EmailLayout
      preview={
        pl
          ? `${fromName} wysłał(a) Ci zaproszenie do znajomych`
          : en
            ? `${fromName} sent you a friend request`
            : `${fromName}-მ მეგობრობის მოთხოვნა გამოგიგზავნა`
      }
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
        {pl
          ? "Nowe zaproszenie do znajomych"
          : en
            ? "New friend request"
            : "ახალი მეგობრობის მოთხოვნა"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        <strong>{fromName}</strong>
        {fromHandle ? (
          <span style={{ color: "#9b94ad" }}> ({fromHandle})</span>
        ) : null}{" "}
        {pl
          ? " chce połączyć się z Tobą na Vivida. Zaakceptuj zaproszenie, aby sprawdzić Waszą kompatybilność."
          : en
            ? " wants to connect with you on Vivida. Accept the request to explore your compatibility."
            : " გსურს დაგიმეგობრდეს Vivida-ზე. დაამატე და გაიგე, რამდენად თავსებადი ხართ ერთმანეთთან."}
      </Text>

      <Button href={friendsUrl} style={buttonStyle}>
        {pl ? "Zobacz zaproszenie" : en ? "View request" : "ნახე მოთხოვნა"}
      </Button>

      <Text style={mutedStyle}>
        {pl
          ? "Otrzymujesz to powiadomienie, ponieważ od pewnego czasu nie odwiedzałeś Vivida."
          : en
            ? "You received this notification because you have not visited Vivida recently."
            : "ეს შეტყობინება მიიღე, რადგან გარკვეული ხნის წინ არ ეწვიე vivida.ge-ს."}
      </Text>
    </EmailLayout>
  );
}
