import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * One-time 10-credit gift for engaged users who spent credits on paid
 * features, ran down to <= 3, and never topped up. The credits are granted
 * BEFORE this email is sent (lib/credit-gift.ts), so the copy speaks in the
 * past tense: the gift is already on the balance, the email only announces
 * it. CTA lands on /taro (via login) because tarot is what this cohort
 * overwhelmingly spent on, and 10 credits is exactly one full reading.
 */
export function CreditGiftEmail({
  name,
  balance,
  amount,
  tarotUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  /** Balance at audience-resolution time, before the gift landed. */
  balance: number;
  /** Credits gifted, already on the balance when this lands. */
  amount: number;
  tarotUrl: string;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const greeting = name
    ? en
      ? `Hello, ${name}!`
      : `სალამი, ${name}!`
    : en
      ? "Hello!"
      : "სალამი!";

  const balanceLead = en
    ? balance <= 0
      ? "You've been using Vivida's paid readings, but your credits have run out, so the next reading is locked."
      : `You've been using Vivida's paid readings, but only ${balance} ${balance === 1 ? "credit is" : "credits are"} left, not enough for the next one.`
    : balance <= 0
      ? "Vivida-ს ფასიან ფუნქციებს აქტიურად იყენებ, მაგრამ კრედიტები ამოგეწურა და შემდეგი კითხვა დაბლოკილია."
      : `Vivida-ს ფასიან ფუნქციებს აქტიურად იყენებ, მაგრამ ბალანსზე სულ ${balance} კრედიტი დაგრჩა და შემდეგი კითხვისთვის აღარ გყოფნის.`;

  return (
    <EmailLayout
      preview={
        en
          ? `🎁 ${amount} free credits are already on your Vivida balance`
          : `🎁 ${amount} უფასო კრედიტი უკვე შენს Vivida-ს ბალანსზეა`
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
        {en
          ? `🎁 ${amount} free credits are already yours`
          : `🎁 ${amount} უფასო კრედიტი უკვე შენია`}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#f3e8ff", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>{balanceLead}</Text>

      <Text style={paragraphStyle}>
        {en
          ? `So we've added ${amount} free credits to your account, no card, no catch. That's a full Tarot reading, a complete compatibility analysis, or five conversations with your AI astrologer.`
          : `ამიტომ შენს ანგარიშზე ${amount} უფასო კრედიტი უკვე დავამატეთ, ბარათის და ყოველგვარი პირობის გარეშე. ეს ერთი სრული ტაროს გაშლაა, თავსებადობის სრული ანალიზი, ან ხუთი საუბარი შენს AI ასტროლოგთან.`}
      </Text>

      <div style={{ marginTop: 26, marginBottom: 8 }}>
        <Button href={tarotUrl} style={buttonStyle}>
          {en ? "Open Tarot →" : "გახსენი ტარო →"}
        </Button>
      </div>

      <Text style={mutedStyle}>
        {en
          ? "The gift is one-time and never expires. If you need more later, you can top up any time in seconds."
          : "საჩუქარი ერთჯერადია და ვადა არ აქვს. თუ მოგვიანებით მეტი დაგჭირდა, ბალანსის შევსება ნებისმიერ დროს, რამდენიმე წამში შეგიძლია."}
      </Text>
    </EmailLayout>
  );
}

export const CREDIT_GIFT_SUBJECT =
  "🎁 Vivida-დან შენთვის 10 უფასო კრედიტი გვაქვს";
export const CREDIT_GIFT_SUBJECT_EN = "🎁 Your 10 free Vivida credits are here";
