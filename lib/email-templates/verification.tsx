import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

import type { UserLocale } from "@/lib/i18n/user-locale";

export function VerificationEmail({
  name,
  verifyUrl,
  code,
  locale = "ka",
}: {
  name: string | null;
  verifyUrl: string;
  /** 6-digit OTP alternative to the link; omitted (null) → link-only email. */
  code?: string | null;
  locale?: UserLocale;
}) {
  const pl = locale === "pl";
  const en = locale === "en";
  const greeting = name
    ? pl
      ? `Cześć, ${name}!`
      : en
        ? `Hi, ${name}!`
        : `სალამი, ${name}!`
    : pl
      ? "Cześć!"
      : en
        ? "Hi!"
        : "სალამი!";
  return (
    <EmailLayout
      locale={locale}
      preview={
        pl
          ? "Potwierdź swój adres e-mail · Vivida"
          : en
            ? "Verify your email for Vivida"
            : "დაადასტურე შენი ელფოსტა Vivida-ზე"
      }
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
        {pl
          ? "Potwierdź swój adres e-mail"
          : en
            ? "Verify your email"
            : "დაადასტურე შენი ელფოსტა"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>

      {code ? (
        <>
          <Text style={paragraphStyle}>
            {pl
              ? "Dziękujemy za dołączenie do Vivida. Wpisz poniższy kod na stronie rejestracji:"
              : en
                ? "Thanks for joining Vivida. Enter this code on the page where you started signing up:"
                : "მადლობა, რომ Vivida-ს შეუერთდი. შეიყვანე ეს კოდი გვერდზე, სადაც რეგისტრაცია დაიწყე:"}
          </Text>
          <div
            style={{
              backgroundColor: "#1a1533",
              border: "1px solid #3b2f66",
              borderRadius: "12px",
              padding: "18px",
              textAlign: "center",
              margin: "0 0 20px",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "34px",
                fontWeight: 700,
                letterSpacing: "0.3em",
                fontFamily: "monospace",
              }}
            >
              {code}
            </span>
          </div>
          <Text style={paragraphStyle}>
            {pl
              ? "Lub kliknij poniższy przycisk:"
              : en
                ? "Or simply use the button below:"
                : "ან უბრალოდ დააჭირე ღილაკს:"}
          </Text>
        </>
      ) : (
        <Text style={paragraphStyle}>
          {pl
            ? "Dziękujemy za dołączenie do Vivida. Potwierdź swój e-mail poniższym przyciskiem — dzieli Cię tylko krok od Twojego kosmogramu."
            : en
              ? "Thanks for joining Vivida. Verify your email with the button below, your cosmic map is one step away."
              : "მადლობა, რომ Vivida-ს შეუერთდი. დაადასტურე შენი ელფოსტა ქვემოთა ღილაკით, ერთ ნაბიჯში შენი კოსმიური რუკა გელოდება."}
        </Text>
      )}

      <Button href={verifyUrl} style={buttonStyle}>
        {pl
          ? "Potwierdź adres e-mail"
          : en
            ? "Verify email"
            : "ელფოსტის დადასტურება"}
      </Button>

      <Text style={mutedStyle}>
        {pl
          ? "Albo wklej ten link do przeglądarki:"
          : en
            ? "Or paste this into your browser:"
            : "ან ჩასვი ბრაუზერში:"}{" "}
        <br />
        <span style={{ color: "#c4b5fd", wordBreak: "break-all" }}>
          {verifyUrl}
        </span>
      </Text>

      <Text style={mutedStyle}>
        {pl
          ? `${code ? "Kod i link są" : "Link jest"} ważny przez 24 godziny. Po tym czasie możesz poprosić o nowy na stronie logowania.`
          : en
            ? `${code ? "The code and link are" : "The link is"} valid for 24 hours. After that, request a new one from the sign-in page.`
            : `${code ? "კოდიც და ლინკიც მოქმედია" : "ლინკი მოქმედია"} 24 საათი. ვადის გასვლის შემდეგ შეგიძლია ხელახლა მოითხოვო შესვლის გვერდიდან.`}
      </Text>
    </EmailLayout>
  );
}
