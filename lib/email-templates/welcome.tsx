import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

/**
 * Sent once when a user finishes signup. Pitches what they get from Vivida
 * and funnels them into the dashboard. No unsubscribe — transactional.
 *
 * Free features and credit-gated actions are described separately because
 * the signup credit grant can differ by experiment cohort.
 */
import type { UserLocale } from "@/lib/i18n/user-locale";

export function WelcomeEmail({
  name,
  dashboardUrl,
  locale = "ka",
}: {
  name: string | null;
  dashboardUrl: string;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const greeting = name
    ? en
      ? `Welcome, ${name}!`
      : `კეთილი იყოს მობრძანება, ${name}!`
    : en
      ? "Welcome!"
      : "კეთილი იყოს მობრძანება!";
  return (
    <EmailLayout
      preview={
        en
          ? "Your cosmic journey begins — Vivida"
          : "შენი კოსმიური მოგზაურობა იწყება — Vivida"
      }
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
        {en ? "Your cosmic journey begins" : "შენი კოსმიური მოგზაურობა იწყება"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        {en
          ? "Your natal chart and daily horoscope are ready to explore. Your first compatibility comparison and tarot reading are free; further readings and some other actions use credits. Your starting credits are in your account."
          : "შენი ნატალური რუკა და ყოველდღიური ჰოროსკოპი ხელმისაწვდომია უფასოდ. თავსებადობის პირველი შედარება და ტაროს პირველი კითხვა უფასოა; მომდევნო კითხვები და ზოგი სხვა მოქმედება კრედიტებს იყენებს. საწყისი კრედიტები შენს ანგარიშზეა."}
      </Text>

      <Text style={{ ...paragraphStyle, fontWeight: 600, color: "#ffffff" }}>
        {en ? "Available now:" : "ხელმისაწვდომია:"}
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
          <strong>{en ? "Natal chart" : "ნატალური რუკა"}</strong> —{" "}
          {en
            ? "complete interpretations of planets, houses, and aspects"
            : "სრული ინტერპრეტაცია, პლანეტები, სახლები და ასპექტები"}
        </li>
        <li>
          <strong>{en ? "Daily horoscope" : "ყოველდღიური ჰოროსკოპი"}</strong> —{" "}
          {en
            ? "personalized to your chart"
            : "შენს რუკაზე მორგებული, AI-ით გენერირებული"}
        </li>
        <li>
          <strong>{en ? "Compatibility" : "თავსებადობა"}</strong> —{" "}
          {en
            ? "compare charts with friends and partners"
            : "შეადარე თავი მეგობრებს, პარტნიორებს, ცნობილ ადამიანებს"}
        </li>
        <li>
          <strong>{en ? "Cosmic events" : "კოსმიური მოვლენები"}</strong> —{" "}
          {en
            ? "new moons, retrogrades, and transits"
            : "ახალმთვარეები, რეტროგრადები, ტრანზიტები"}
        </li>
      </ul>

      <Button href={dashboardUrl} style={buttonStyle}>
        {en ? "Open your chart" : "ნახე შენი რუკა"}
      </Button>

      <Text style={mutedStyle}>
        {en
          ? "If you have a question, simply reply to this email."
          : "თუ შეკითხვა გაქვს, უბრალოდ უპასუხე ამ წერილს."}
      </Text>
    </EmailLayout>
  );
}
