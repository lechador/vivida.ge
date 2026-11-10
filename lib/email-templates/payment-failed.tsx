import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Failed subscription renewal notice (dunning).
 *
 * Billing notice, not marketing: one clear fact (the charge did not go
 * through), one clear action (update the card), and the honest consequence.
 * Stripe retries the charge automatically, so the copy says access continues
 * for now and that fixing the card is what keeps it uninterrupted.
 */
export function PaymentFailedEmail({
  name,
  amountLabel,
  manageUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  /** Pre-formatted amount that failed to charge, e.g. "£4.99"; null if unknown. */
  amountLabel: string | null;
  manageUrl: string;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const pl = locale === "pl";
  const en = locale === "en";

  const greeting = name
    ? pl
      ? `Cześć, ${name}!`
      : en
        ? `Hello, ${name}!`
        : `სალამი, ${name}!`
    : pl
      ? "Cześć!"
      : en
        ? "Hello!"
        : "სალამი!";

  return (
    <EmailLayout
      preview={
        pl
          ? "Nie udało się pobrać płatności za Vivida PRO — zaktualizuj kartę"
          : en
            ? "We could not charge your card for Vivida PRO — please update it"
            : "Vivida PRO-ს გადახდა ვერ განხორციელდა — განაახლე ბარათი"
      }
      unsubscribeUrl={unsubscribeUrl}
      locale={locale}
    >
      <Heading
        as="h1"
        style={{
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: 700,
          letterSpacing: "-0.015em",
          lineHeight: "32px",
          margin: "0 0 16px",
        }}
      >
        {pl
          ? "Nie udało się pobrać płatności"
          : en
            ? "Your payment did not go through"
            : "გადახდა ვერ განხორციელდა"}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#f3e8ff", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>
        {pl
          ? `Nie udało nam się pobrać opłaty${amountLabel ? ` (${amountLabel})` : ""} za Twoją subskrypcję Vivida PRO. Zwykle to wygasła karta lub niewystarczające środki. Spróbujemy ponownie automatycznie, ale najszybciej załatwisz to, aktualizując metodę płatności — wtedy PRO pozostanie włączone bez przerwy.`
          : en
            ? `We could not charge${amountLabel ? ` ${amountLabel}` : ""} for your Vivida PRO subscription. This is usually an expired card or insufficient funds. We will retry automatically, but the quickest fix is to update your payment method — that keeps PRO on without interruption.`
            : `ვერ მოხერხდა Vivida PRO გამოწერის გადასახადის${amountLabel ? ` (${amountLabel})` : ""} ჩამოჭრა. ჩვეულებრივ ეს ბარათის ვადის გასვლაა ან არასაკმარისი თანხა. ავტომატურად კიდევ ვცდით, მაგრამ ყველაზე სწრაფად გადახდის მეთოდის განახლებით მოგვარდება — ასე PRO შეფერხების გარეშე დარჩება.`}
      </Text>

      <div style={{ marginTop: 22, marginBottom: 8 }}>
        <Button
          href={manageUrl}
          style={{
            ...buttonStyle,
            background: "linear-gradient(135deg, #f5c451 0%, #f59e0b 100%)",
            color: "#1a1207",
            fontWeight: 700,
            padding: "14px 28px",
          }}
        >
          {pl
            ? "Zaktualizuj kartę →"
            : en
              ? "Update my card →"
              : "ბარათის განახლება →"}
        </Button>
      </div>

      <Text style={{ ...mutedStyle, margin: "10px 0 0" }}>
        {pl
          ? "Jeśli już zaktualizowałeś kartę, zignoruj tę wiadomość."
          : en
            ? "If you have already updated your card, please ignore this email."
            : "თუ ბარათი უკვე განაახლე, ეს მეილი უგულებელყავი."}
      </Text>
    </EmailLayout>
  );
}
