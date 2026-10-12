import { Button, Heading, Hr, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Win-back offer for users who have nearly run out of credits: three months of
 * PRO for ₾29. The reader's actual balance is on the page, the offer only
 * makes sense next to the number that prompted it, and the deadline is
 * spelled out rather than implied, since the card on /credits disappears on
 * its own when it lapses.
 *
 * The button goes to /credits, not straight to Stripe: the price has to be
 * re-checked against the campaign server-side before anyone is charged, and
 * /credits is where that check already lives.
 */
export function LowCreditOfferEmail({
  name,
  balance,
  priceLabel,
  months,
  deadlineLabel,
  creditsUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  /** The reader's credit balance at send time, the reason for the email. */
  balance: number;
  /** Pre-formatted price, e.g. "₾29.00". */
  priceLabel: string;
  months: number;
  /**
   * Localised last day of the offer, already in the form the sentence needs,
   * genitive in Georgian ("1 სექტემბრის"), plain in English ("1 September").
   */
  deadlineLabel: string;
  creditsUrl: string;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const greeting = name
    ? en ? `Hello, ${name}!` : `სალამი, ${name}!`
    : en ? "Hello!" : "სალამი!";

  const perks = en
    ? [
        "Unlimited AI chat with your astrologer",
        "Compatibility readings with anyone, as often as you like",
        "Full test results, personality, IQ, EQ, Big Five",
        "7-day forecasts, tarot readings and PDF charts",
        "Verified badge on your profile",
      ]
    : [
        "ულიმიტო AI ჩატი შენს ასტროლოგთან",
        "თავსებადობა ნებისმიერთან, რამდენჯერაც გინდა",
        "ტესტების სრული შედეგები, პიროვნება, IQ, EQ, Big Five",
        "7-დღიანი პროგნოზები, ტარო და PDF რუკები",
        "Verified badge შენს პროფილზე",
      ];

  return (
    <EmailLayout
      preview={
        en
          ? `${months} months of unlimited Vivida for ${priceLabel}`
          : `${months} თვე ულიმიტო Vivida ${priceLabel}-ად`
      }
      unsubscribeUrl={unsubscribeUrl}
      locale={locale}
    >
      <Text
        style={{
          color: "#9b94ad",
          fontSize: "12px",
          letterSpacing: "0.18em",
          margin: "0 0 6px",
          textTransform: "uppercase",
        }}
      >
        {en ? "Personal offer" : "პერსონალური შეთავაზება"}
      </Text>

      <Heading
        as="h1"
        style={{
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          lineHeight: "30px",
          margin: "0 0 14px",
        }}
      >
        {en
          ? `${months} months of unlimited Vivida, ${priceLabel}`
          : `${months} თვე ულიმიტო Vivida, ${priceLabel}`}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#cfc7df", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>
        {en
          ? `You have ${balance} ${balance === 1 ? "credit" : "credits"} left. Before they run out, here is something we are offering only to you: ${months} months of Vivida PRO for ${priceLabel}, no credits, no limits, everything open.`
          : `შენს ბალანსზე ${balance} კრედიტია დარჩენილი. სანამ ისინი ამოიწურება, გთავაზობთ იმას, რაც მხოლოდ შენთვისაა: ${months} თვე Vivida PRO ${priceLabel}-ად, კრედიტების გარეშე, ლიმიტების გარეშე, ყველაფერი ღიაა.`}
      </Text>

      {/* Offer block, the price gets its own frame so it survives a skim. */}
      <div
        style={{
          background: "rgba(234, 195, 88, 0.07)",
          border: "1px solid rgba(234, 195, 88, 0.35)",
          borderRadius: "12px",
          margin: "0 0 18px",
          padding: "18px 20px",
        }}
      >
        <Text
          style={{
            color: "#eac358",
            fontSize: "26px",
            fontWeight: 700,
            lineHeight: "32px",
            margin: 0,
          }}
        >
          {priceLabel}
        </Text>
        <Text
          style={{
            color: "#d8d2ee",
            fontSize: "14px",
            lineHeight: "20px",
            margin: "4px 0 0",
          }}
        >
          {en
            ? `for ${months} full months of unlimited access`
            : `${months} სრული თვის ულიმიტო წვდომისთვის`}
        </Text>
      </div>

      <Text style={{ ...paragraphStyle, margin: "0 0 8px", fontWeight: 600 }}>
        {en ? "What opens up:" : "რა იხსნება:"}
      </Text>
      {perks.map((perk) => (
        <Text
          key={perk}
          style={{
            color: "#e7e3f0",
            fontSize: "15px",
            lineHeight: "22px",
            margin: "0 0 6px",
          }}
        >
          ✦&nbsp;&nbsp;{perk}
        </Text>
      ))}

      <div style={{ marginTop: 22 }}>
        <Button href={creditsUrl} style={buttonStyle}>
          {en ? "Activate the offer" : "გაააქტიურე შეთავაზება"}
        </Button>
      </div>

      <Hr style={{ borderColor: "rgba(167, 139, 250, 0.12)", margin: "24px 0 0" }} />

      <Text style={mutedStyle}>
        {en
          ? `The offer is tied to your account and is open until ${deadlineLabel}. Afterwards it renews at the same ${priceLabel} every ${months} months, and you can cancel any time.`
          : `შეთავაზება შენს ანგარიშზეა მიბმული და ძალაშია ${deadlineLabel} ჩათვლით. შემდეგ ავტომატურად განახლდება იმავე ${priceLabel}-ად ყოველ ${months} თვეში, გაუქმება კი ნებისმიერ დროს შეგიძლია.`}
      </Text>
    </EmailLayout>
  );
}
