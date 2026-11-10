import { Button, Heading, Hr, Section, Text } from "@react-email/components";

import { EmailLayout, buttonStyle, paragraphStyle } from "./_layout";
import { pickCopy, plCredits } from "./_copy";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Birthday email, a celebration, not a promo. The person is the centerpiece:
 * festive centered opening, warm AI-written body, a heartfelt sign-off from
 * the team… and the +1 month gift demoted to a quiet P.S. at the very bottom.
 * Transactional (once a year), so no unsubscribe link, like welcome.
 */
export function BirthdayEmail({
  name,
  paragraphs,
  dashboardUrl,
  showGift = true,
  credits = 10,
  locale = "ka",
}: {
  name: string | null;
  paragraphs: string[];
  dashboardUrl: string;
  showGift?: boolean;
  /** Credits added to the balance (BIRTHDAY_CREDITS), named in the P.S. */
  credits?: number;
  locale?: UserLocale;
}) {
  const t = <T,>(copy: { ka: T; en: T; pl: T }) => pickCopy(locale, copy);
  const tagline = t({
    ka: "დღეს შენი დღეა, და მთელი ცა ამას აღნიშნავს",
    en: "Today is your day, and the whole sky is celebrating it",
    pl: "Dziś jest Twój dzień, a całe niebo go świętuje",
  });
  return (
    <EmailLayout preview={`${tagline} ✨`} locale={locale}>
      {/* Festive opening, centered, big, personal */}
      <Section style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <Text
          style={{
            fontSize: "44px",
            lineHeight: "52px",
            margin: "0 0 8px",
          }}
        >
          🎂✨🎉
        </Text>
        <Heading
          as="h1"
          style={{
            color: "#ffffff",
            fontSize: "30px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: "38px",
            margin: "0 0 10px",
          }}
        >
          {t({
            ka: "გილოცავ",
            en: "Happy birthday",
            pl: "Wszystkiego najlepszego",
          })}
          {name ? `, ${name}` : ""}!
        </Heading>
        <Text
          style={{
            color: "#c4b5fd",
            fontSize: "16px",
            lineHeight: "24px",
            margin: "0 0 4px",
          }}
        >
          {tagline}
        </Text>
      </Section>

      {/* Star divider */}
      <Text
        style={{
          color: "#a78bfa",
          fontSize: "14px",
          letterSpacing: "12px",
          margin: "18px 0",
          textAlign: "center",
        }}
      >
        ✦&nbsp;✦&nbsp;✦
      </Text>

      {/* Warm AI-written body */}
      {paragraphs.map((p, i) => (
        <Text
          key={i}
          style={{
            ...paragraphStyle,
            fontSize: "16px",
            lineHeight: "26px",
          }}
        >
          {p}
        </Text>
      ))}

      {/* Heartfelt sign-off, the team, by name, celebrating them */}
      <Text
        style={{
          ...paragraphStyle,
          fontSize: "16px",
          lineHeight: "26px",
          margin: "20px 0 6px",
        }}
      >
        {t({
          ka: "გმადლობთ, რომ ვივიდას ვარსკვლავებქვეშ ხარ, შენნაირი ადამიანების გამო ვაკეთებთ ამ საქმეს.",
          en: "Thank you for being under Vivida's stars. People like you are why we do this.",
          pl: "Dziękujemy, że jesteś pod gwiazdami Vivida. To dla takich osób jak Ty robimy to, co robimy.",
        })}
      </Text>
      <Text
        style={{
          color: "#f0abfc",
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "24px",
          margin: "0 0 22px",
        }}
      >
        {t({
          ka: "სითბოთი და აღფრთოვანებით, Vivida-ს გუნდი ❤️",
          en: "With warmth and delight, the Vivida team ❤️",
          pl: "Z ciepłem i radością, zespół Vivida ❤️",
        })}
      </Text>

      <Section style={{ textAlign: "center", padding: "4px 0 8px" }}>
        <Button href={dashboardUrl} style={buttonStyle}>
          {t({
            ka: "ნახე, რას გპირდება დღეს შენი ცა",
            en: "See what your sky holds today",
            pl: "Zobacz, co szykuje dziś Twoje niebo",
          })}
        </Button>
      </Section>

      {/* The gift, a quiet P.S., deliberately not the headline (omitted for PRO users) */}
      {showGift ? (
        <>
          <Hr
            style={{
              borderColor: "rgba(167, 139, 250, 0.18)",
              margin: "22px 0 14px",
            }}
          />
          <Text
            style={{
              color: "#8d82a6",
              fontSize: "13px",
              lineHeight: "21px",
              margin: 0,
            }}
          >
            {t({
              ka: "P.S. პატარა საჩუქარი ჩვენგან: შენს ბალანსს დაბადების დღის საპატივცემულოდ ",
              en: "P.S. A small gift from us: in honour of your birthday, ",
              pl: "P.S. Mały prezent od nas: z okazji urodzin na Twoje konto trafiło ",
            })}
            <span style={{ color: "#eac358", fontWeight: 600 }}>
              {t({
                ka: `${credits} კრედიტი`,
                en: `${credits} credits`,
                pl: plCredits(credits),
              })}
            </span>
            {t({
              ka: " დაემატა, უკვე შენია, არაფერი გჭირდება. 🎁",
              en: " have been added to your balance. They're already yours, nothing to do. 🎁",
              pl: ". Już są Twoje, nic nie musisz robić. 🎁",
            })}
          </Text>
        </>
      ) : null}
    </EmailLayout>
  );
}
