import { Button, Heading, Text } from "@react-email/components";

import { EmailLayout, buttonStyle, mutedStyle, paragraphStyle } from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

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
  const en = locale !== "ka";
  const greeting = name ? (en ? `Hello, ${name}!` : `სალამი, ${name}!`) : (en ? "Hello!" : "სალამი!");
  return (
    <EmailLayout preview={title} locale={locale}>
      <Heading as="h1" style={{ color: "#ffffff", fontSize: "24px", lineHeight: "32px", margin: "0 0 16px" }}>{title}</Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>{body}</Text>
      <Button href={actionUrl} style={buttonStyle}>{en ? "Open in Vivida" : "გახსენი Vivida-ში"}</Button>
      <Text style={mutedStyle}>{en ? "You chose this reminder in Account → Personal reminders. You can change it any time." : "ეს შეხსენება შენ თვითონ აირჩიე ანგარიშში → პერსონალური შეხსენებები. შეცვლა ნებისმიერ დროს შეგიძლია."}</Text>
    </EmailLayout>
  );
}
