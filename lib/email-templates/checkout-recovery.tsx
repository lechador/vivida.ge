import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Abandoned-checkout rescue, sent 1–48 hours after a checkout started.
 *
 * One job: get the reader back to the exact decision they almost made.
 * It does not re-sell the whole product and it does not invent a discount;
 * for never-subscribed readers it adds the one honest alternative that
 * removes the payment entirely for a week (the free trial).
 */
export function CheckoutRecoveryEmail({
  name,
  recoveryUrl,
  trialUrl,
  trialDays,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  recoveryUrl: string;
  /** Set only when the reader has never had a subscription (trial-eligible). */
  trialUrl: string | null;
  trialDays: number;
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
          ? "Twoja płatność nie została dokończona — brakuje jednego kroku"
          : en
            ? "Your checkout did not finish — one step left"
            : "შენი შეძენა არ დასრულებულა — ერთი ნაბიჯი დაგრჩა"
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
        {pl ? "Został jeden krok" : en ? "One step left" : "ერთი ნაბიჯი დაგრჩა"}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#f3e8ff", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>
        {pl
          ? "Zauważyliśmy, że rozpocząłeś zakup w Vivida, ale płatność nie została dokończona. Nic nie przepadło — możesz wrócić dokładnie do tego samego miejsca i dokończyć, kiedy będziesz gotowy."
          : en
            ? "We noticed you started a purchase on Vivida but the payment did not finish. Nothing is lost — you can pick up exactly where you left off whenever you are ready."
            : "შევნიშნეთ, რომ Vivida-ზე შეძენა დაიწყე, მაგრამ გადახდა არ დასრულებულა. არაფერი დაგიკარგავს — შეგიძლია ზუსტად იმავე ადგილიდან გააგრძელო, როცა მზად იქნები."}
      </Text>

      <div style={{ marginTop: 22, marginBottom: 8 }}>
        <Button
          href={recoveryUrl}
          style={{
            ...buttonStyle,
            background: "linear-gradient(135deg, #f5c451 0%, #f59e0b 100%)",
            color: "#1a1207",
            fontWeight: 700,
            padding: "14px 28px",
          }}
        >
          {pl
            ? "Dokończ zakup →"
            : en
              ? "Finish my purchase →"
              : "დაასრულე შეძენა →"}
        </Button>
      </div>

      {trialUrl && (
        <Text style={paragraphStyle}>
          {pl
            ? `A jeśli wolisz najpierw sprawdzić, jak to jest mieć wszystko otwarte: możesz zacząć ${trialDays} dni Vivida PRO zupełnie za darmo i zapłacić tylko, jeśli zostaniesz. `
            : en
              ? `Or, if you would rather feel what fully-open Vivida is like first: you can start ${trialDays} days of Vivida PRO completely free and only pay if you stay. `
              : `ან თუ ჯერ გინდა იგრძნო, როგორი ყველაფერი ღია Vivida, შეგიძლია დაიწყო ${trialDays} დღე Vivida PRO სრულიად უფასოდ და მხოლოდ მაშინ გადაიხადო, თუ დარჩები. `}
          <a href={trialUrl} style={{ color: "#f5c451" }}>
            {pl
              ? "Zacznij darmowy okres →"
              : en
                ? "Start the free trial →"
                : "დაიწყე უფასო პერიოდი →"}
          </a>
        </Text>
      )}

      <Text style={{ ...mutedStyle, margin: "10px 0 0" }}>
        {pl
          ? "Jeśli płatność jednak doszła do skutku, zignoruj tę wiadomość — i dziękujemy."
          : en
            ? "If your payment did go through after all, please ignore this email — and thank you."
            : "თუ გადახდა მაინც დასრულდა, ეს მეილი უგულებელყავი — და მადლობა."}
      </Text>
    </EmailLayout>
  );
}
