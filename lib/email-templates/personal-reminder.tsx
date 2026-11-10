import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { pickCopy } from "./_copy";

export function PersonalReminderEmail({
  name,
  title,
  body,
  actionUrl,
  locale,
}: {
  name: string | null;
  title: string;
  body: string;
  actionUrl: string;
  locale: UserLocale;
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
    <EmailLayout preview={title} locale={locale}>
      <Heading
        as="h1"
        style={{
          color: "#ffffff",
          fontSize: "24px",
          lineHeight: "32px",
          margin: "0 0 16px",
        }}
      >
        {title}
      </Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>{body}</Text>
      <Button href={actionUrl} style={buttonStyle}>
        {t({
          ka: "გახსენი Vivida-ში",
          en: "Open in Vivida",
          pl: "Otwórz w Vivida",
        })}
      </Button>
      <Text style={mutedStyle}>
        {t({
          ka: "ეს შეხსენება შენ თვითონ აირჩიე ანგარიშში → პერსონალური შეხსენებები. შეცვლა ნებისმიერ დროს შეგიძლია.",
          en: "You chose this reminder in Account → Personal reminders. You can change it any time.",
          pl: "To przypomnienie wybrano w Konto → Osobiste przypomnienia. Możesz je zmienić w każdej chwili.",
        })}
      </Text>
    </EmailLayout>
  );
}
