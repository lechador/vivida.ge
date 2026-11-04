import { Button, Heading, Text } from "@react-email/components";

import { EmailLayout, buttonStyle, paragraphStyle } from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Sean Ellis PMF baseline survey.
 *
 * One question, three tappable answers, nothing else competing for the
 * click. Every answer link is signed with the reader's unsubscribe token
 * and lands on /api/pmf/respond, which records the answer and thanks them.
 */
export function PmfSurveyEmail({
  name,
  answerUrls,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  answerUrls: {
    very_disappointed: string;
    somewhat_disappointed: string;
    not_disappointed: string;
  };
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

  const answers = [
    {
      href: answerUrls.very_disappointed,
      label: pl
        ? "Bardzo — Vivida to część mojej rutyny"
        : en
          ? "Very disappointed — Vivida is part of my routine"
          : "ძალიან — Vivida ჩემი ყოველდღიურობის ნაწილია",
      primary: true,
    },
    {
      href: answerUrls.somewhat_disappointed,
      label: pl
        ? "Trochę — lubię, ale dałbym radę bez"
        : en
          ? "Somewhat — I like it, but I could manage without"
          : "გარკვეულწილად — მომწონს, მაგრამ მის გარეშეც გავძლებ",
      primary: false,
    },
    {
      href: answerUrls.not_disappointed,
      label: pl
        ? "Wcale — rzadko tu zaglądam"
        : en
          ? "Not disappointed — I rarely use it"
          : "საერთოდ არა — იშვიათად ვსარგებლობ",
      primary: false,
    },
  ];

  return (
    <EmailLayout
      preview={
        pl
          ? "Jedno pytanie, 10 sekund: jak bardzo brakowałoby Ci Vivida?"
          : en
            ? "One question, 10 seconds: how much would you miss Vivida?"
            : "ერთი კითხვა, 10 წამი: რამდენად მოგენატრებოდა Vivida?"
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
          ? "Jak byś się czuł, gdyby Vivida zniknęła?"
          : en
            ? "How would you feel if Vivida disappeared?"
            : "რას იგრძნობდი, Vivida რომ გაქრეს?"}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#f3e8ff", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>
        {pl
          ? "Budujemy Vivida dla takich osób jak Ty i chcemy wiedzieć, czy idziemy w dobrą stronę. Jedno pytanie, jedna odpowiedź — zajmie Ci to 10 sekund, a nam powie więcej niż miesiąc zgadywania."
          : en
            ? "We are building Vivida for people like you and we want to know if we are heading the right way. One question, one tap — it takes 10 seconds and tells us more than a month of guessing."
            : "Vivida-ს შენნაირი ადამიანებისთვის ვაშენებთ და გვინდა ვიცოდეთ, სწორი მიმართულებით მივდივართ თუ არა. ერთი კითხვა, ერთი შეხება — 10 წამი დაგჭირდება, ჩვენ კი ერთთვიან გამოცნობაზე მეტს გვეტყვის."}
      </Text>

      {answers.map((a) => (
        <div key={a.href} style={{ marginTop: 12 }}>
          <Button
            href={a.href}
            style={{
              ...buttonStyle,
              ...(a.primary
                ? {}
                : {
                    background: "rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }),
              display: "block",
              textAlign: "center" as const,
              padding: "13px 20px",
            }}
          >
            {a.label}
          </Button>
        </div>
      ))}

      <Text style={paragraphStyle}>
        {pl
          ? "Nie ma dobrych i złych odpowiedzi — zła odpowiedź to tylko ta, której nie dostaniemy."
          : en
            ? "There are no right or wrong answers — the only bad answer is the one we never get."
            : "სწორი და არასწორი პასუხი არ არსებობს — ცუდი მხოლოდ ის პასუხია, რომელსაც ვერ მივიღებთ."}
      </Text>
    </EmailLayout>
  );
}
