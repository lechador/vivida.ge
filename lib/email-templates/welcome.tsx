import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

/**
 * Sent once when a user finishes signup. Pitches what they get from Vivida
 * and funnels them into the dashboard. No unsubscribe, transactional.
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
  const pl = locale === "pl";
  const en = locale === "en";
  const greeting = name
    ? pl
      ? `Witaj, ${name}!`
      : en
        ? `Welcome, ${name}!`
        : `კეთილი იყოს მობრძანება, ${name}!`
    : pl
      ? "Witaj!"
      : en
        ? "Welcome!"
        : "კეთილი იყოს მობრძანება!";
  return (
    <EmailLayout
      preview={
        pl
          ? "Twoja kosmiczna podróż się zaczyna · Vivida"
          : en
            ? "Your cosmic journey begins, Vivida"
            : "შენი კოსმიური მოგზაურობა იწყება, Vivida"
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
        {pl
          ? "Twoja kosmiczna podróż się zaczyna"
          : en
            ? "Your cosmic journey begins"
            : "შენი კოსმიური მოგზაურობა იწყება"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        {pl
          ? "Twój horoskop urodzeniowy i codzienny horoskop są już gotowe do odkrycia. Pierwszy rozkład tarota jest bezpłatny; porównania kompatybilności, dalsze interpretacje i zaawansowane analizy korzystają z kredytów. Twoje powitalne kredyty czekają na koncie."
          : en
            ? "Your natal chart and daily horoscope are ready to explore. Your first tarot reading is free; compatibility comparisons, further readings and some other actions use credits. Your starting credits are in your account."
            : "შენი ნატალური რუკა და ყოველდღიური ჰოროსკოპი ხელმისაწვდომია უფასოდ. ტაროს პირველი კითხვა უფასოა; თავსებადობის შედარება, მომდევნო კითხვები და ზოგი სხვა მოქმედება კრედიტებს იყენებს. საწყისი კრედიტები შენს ანგარიშზეა."}
      </Text>

      <Text style={{ ...paragraphStyle, fontWeight: 600, color: "#ffffff" }}>
        {pl ? "Dostępne od zaraz:" : en ? "Available now:" : "ხელმისაწვდომია:"}
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
          <strong>
            {pl ? "Horoskop urodzeniowy" : en ? "Natal chart" : "ნატალური რუკა"}
          </strong>
          ,{" "}
          {pl
            ? "kompletna interpretacja planet, domów i aspektów"
            : en
              ? "complete interpretations of planets, houses, and aspects"
              : "სრული ინტერპრეტაცია, პლანეტები, სახლები და ასპექტები"}
        </li>
        <li>
          <strong>
            {pl
              ? "Codzienny horoskop"
              : en
                ? "Daily horoscope"
                : "ყოველდღიური ჰოროსკოპი"}
          </strong>
          ,{" "}
          {pl
            ? "spersonalizowany pod Twój kosmogram"
            : en
              ? "personalized to your chart"
              : "შენს რუკაზე მორგებული, AI-ით გენერირებული"}
        </li>
        <li>
          <strong>
            {pl ? "Kompatybilność" : en ? "Compatibility" : "თავსებადობა"}
          </strong>
          ,{" "}
          {pl
            ? "porównaj kosmogramy z bliskimi i partnerem"
            : en
              ? "compare charts with friends and partners"
              : "შეადარე თავი მეგობრებს, პარტნიორებს, ცნობილ ადამიანებს"}
        </li>
        <li>
          <strong>
            {pl
              ? "Wydarzenia kosmiczne"
              : en
                ? "Cosmic events"
                : "კოსმიური მოვლენები"}
          </strong>
          ,{" "}
          {pl
            ? "nowie, pełnie, retrogradacje i tranzyty"
            : en
              ? "new moons, retrogrades, and transits"
              : "ახალმთვარეები, რეტროგრადები, ტრანზიტები"}
        </li>
      </ul>

      <Button href={dashboardUrl} style={buttonStyle}>
        {pl
          ? "Otwórz swój kosmogram"
          : en
            ? "Open your chart"
            : "ნახე შენი რუკა"}
      </Button>

      <Text style={mutedStyle}>
        {pl
          ? "Jeśli masz jakiekolwiek pytania, po prostu odpowiedz na tę wiadomość."
          : en
            ? "If you have a question, simply reply to this email."
            : "თუ შეკითხვა გაქვს, უბრალოდ უპასუხე ამ წერილს."}
      </Text>
    </EmailLayout>
  );
}
