import { Button, Heading, Section, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { pickCopy } from "./_copy";

export function ProfileIncompleteEmail({
  name,
  onboardingUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  onboardingUrl: string;
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
  return (
    <EmailLayout
      preview={t({
        ka: "დაასრულე რეგისტრაცია, შენი ნატალური რუკა გელოდება",
        en: "Complete your profile, your birth chart is waiting",
        pl: "Dokończ profil, Twój horoskop urodzeniowy czeka",
      })}
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
        {t({
          ka: "შენი რუკა ჯერ კიდევ გელოდება",
          en: "Your chart is still waiting",
          pl: "Twój horoskop wciąż czeka",
        })}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        {t({
          ka: "შენ vivida.ge-ზე დარეგისტრირდი, მაგრამ ჯერ არ შეგიყვანია დაბადების თარიღი, დრო და ადგილი, ამიტომ ვერ ვუშვით შენი ნატალური რუკა.",
          en: "You created a Vivida account but have not added your birth date, time, and place yet, so we cannot calculate your natal chart.",
          pl: "Masz konto w Vivida, ale nie podano jeszcze daty, godziny i miejsca urodzenia, więc nie możemy obliczyć Twojego horoskopu urodzeniowego.",
        })}
      </Text>
      <Section
        style={{
          backgroundColor: "#1a1533",
          border: "1px solid #3b2f66",
          borderRadius: "12px",
          margin: "4px 0 20px",
          padding: "18px 20px",
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: 700,
            lineHeight: "26px",
            margin: "0 0 6px",
          }}
        >
          {t({
            ka: "✦ 50 კრედიტი საჩუქრად",
            en: "✦ 50 bonus credits",
            pl: "✦ 50 kredytów w prezencie",
          })}
        </Text>
        <Text
          style={{
            color: "#cfc7df",
            fontSize: "14px",
            lineHeight: "21px",
            margin: 0,
          }}
        >
          {t({
            ka: "შეავსე დაბადების დეტალები და ბონუსი ავტომატურად დაგერიცხება.",
            en: "Complete your birth details and the bonus will be added automatically.",
            pl: "Uzupełnij dane urodzenia, a bonus zostanie dodany automatycznie.",
          })}
        </Text>
      </Section>

      <Text style={{ ...paragraphStyle, fontWeight: 600, color: "#ffffff" }}>
        {t({
          ka: "სულ 60 წამში მიიღებ:",
          en: "In about 60 seconds, you will unlock:",
          pl: "W około 60 sekund odblokujesz:",
        })}
      </Text>

      <ul
        style={{
          color: "#e7e3f0",
          fontSize: "15px",
          lineHeight: "24px",
          margin: "0 0 16px",
          paddingLeft: 22,
        }}
      >
        <li>
          {t({
            ka: "შენი დიდი სამეული, მზე, მთვარე და ასცენდენტი",
            en: "Your big three, Sun, Moon, and rising sign",
            pl: "Twoją wielką trójkę: Słońce, Księżyc i ascendent",
          })}
        </li>
        <li>
          {t({
            ka: "სრული ნატალური რუკა და ინტერპრეტაცია",
            en: "A complete natal chart and interpretation",
            pl: "Pełny horoskop urodzeniowy z interpretacją",
          })}
        </li>
        <li>
          {t({
            ka: "ყოველდღიური ჰოროსკოპი, შენს რუკაზე მორგებული",
            en: "A daily horoscope personalized to your chart",
            pl: "Codzienny horoskop dopasowany do Twojego horoskopu",
          })}
        </li>
        <li>
          {t({
            ka: "თავსებადობა მეგობრებთან და პარტნიორებთან",
            en: "Compatibility with friends and partners",
            pl: "Zgodność z przyjaciółmi i partnerami",
          })}
        </li>
      </ul>

      <div style={{ marginTop: 22 }}>
        <Button href={onboardingUrl} style={buttonStyle}>
          {t({
            ka: "შეავსე მონაცემები და მიიღე 50 კრედიტი",
            en: "Complete my profile and get 50 credits",
            pl: "Uzupełnij profil i odbierz 50 kredytów",
          })}
        </Button>
      </div>

      <Text style={mutedStyle}>
        {t({
          ka: "თუ შეკითხვა გაქვს, უბრალოდ უპასუხე ამ წერილს.",
          en: "If you have a question, simply reply to this email.",
          pl: "Jeśli masz pytanie, po prostu odpowiedz na tego e-maila.",
        })}
      </Text>
    </EmailLayout>
  );
}
