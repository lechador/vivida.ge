import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { pickCopy, plCredits } from "./_copy";

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
  const t = <T,>(copy: { ka: T; en: T; pl: T }) => pickCopy(locale, copy);
  const greeting = name
    ? t({
        ka: `სალამი, ${name}!`,
        en: `Hello, ${name}!`,
        pl: `Cześć, ${name}!`,
      })
    : t({ ka: "სალამი!", en: "Hello!", pl: "Cześć!" });

  const balanceLead =
    balance <= 0
      ? t({
          ka: "Vivida-ს ფასიან ფუნქციებს აქტიურად იყენებ, მაგრამ კრედიტები ამოგეწურა და შემდეგი კითხვა დაბლოკილია.",
          en: "You've been using Vivida's paid readings, but your credits have run out, so the next reading is locked.",
          pl: "Aktywnie korzystasz z płatnych odczytów Vivida, ale skończyły Ci się kredyty, więc kolejny odczyt jest zablokowany.",
        })
      : t({
          ka: `Vivida-ს ფასიან ფუნქციებს აქტიურად იყენებ, მაგრამ ბალანსზე სულ ${balance} კრედიტი დაგრჩა და შემდეგი კითხვისთვის აღარ გყოფნის.`,
          en: `You've been using Vivida's paid readings, but only ${balance} ${balance === 1 ? "credit is" : "credits are"} left, not enough for the next one.`,
          pl: `Aktywnie korzystasz z płatnych odczytów Vivida, ale na koncie zostało Ci tylko ${plCredits(balance)}, za mało na kolejny odczyt.`,
        });

  return (
    <EmailLayout
      preview={t({
        ka: `🎁 ${amount} უფასო კრედიტი უკვე შენს Vivida-ს ბალანსზეა`,
        en: `🎁 ${amount} free credits are already on your Vivida balance`,
        pl: `🎁 ${plCredits(amount)} gratis jest już na Twoim koncie Vivida`,
      })}
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
        {t({
          ka: `🎁 ${amount} უფასო კრედიტი უკვე შენია`,
          en: `🎁 ${amount} free credits are already yours`,
          pl: `🎁 ${plCredits(amount)} gratis jest już Twoje`,
        })}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#f3e8ff", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>{balanceLead}</Text>

      <Text style={paragraphStyle}>
        {t({
          en: `So we've added ${amount} free credits to your account, no card, no catch. That's a full Tarot reading, a complete compatibility analysis, or five conversations with your AI astrologer.`,
          pl: `Dlatego dodaliśmy do Twojego konta ${plCredits(amount)} gratis, bez karty i bez haczyków. To jeden pełny rozkład tarota, pełna analiza zgodności albo pięć rozmów z Twoim astrologiem AI.`,
          ka: `ამიტომ შენს ანგარიშზე ${amount} უფასო კრედიტი უკვე დავამატეთ, ბარათის და ყოველგვარი პირობის გარეშე. ეს ერთი სრული ტაროს გაშლაა, თავსებადობის სრული ანალიზი, ან ხუთი საუბარი შენს AI ასტროლოგთან.`,
        })}
      </Text>

      <div style={{ marginTop: 26, marginBottom: 8 }}>
        <Button href={tarotUrl} style={buttonStyle}>
          {t({
            ka: "გახსენი ტარო →",
            en: "Open Tarot →",
            pl: "Otwórz tarota →",
          })}
        </Button>
      </div>

      <Text style={mutedStyle}>
        {t({
          en: "The gift is one-time and never expires. If you need more later, you can top up any time in seconds.",
          pl: "Prezent jest jednorazowy i nigdy nie wygasa. Jeśli później będziesz potrzebować więcej, doładujesz konto w kilka sekund.",
          ka: "საჩუქარი ერთჯერადია და ვადა არ აქვს. თუ მოგვიანებით მეტი დაგჭირდა, ბალანსის შევსება ნებისმიერ დროს, რამდენიმე წამში შეგიძლია.",
        })}
      </Text>
    </EmailLayout>
  );
}

export const CREDIT_GIFT_SUBJECT =
  "🎁 Vivida-დან შენთვის 10 უფასო კრედიტი გვაქვს";
export const CREDIT_GIFT_SUBJECT_EN = "🎁 Your 10 free Vivida credits are here";
export const CREDIT_GIFT_SUBJECT_PL = "🎁 Masz od Vivida 10 darmowych kredytów";
