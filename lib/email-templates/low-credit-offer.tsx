import { Button, Heading, Hr, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Halloween win-back offer for users who have run down to <= 3 credits and
 * keep visiting the site: 1 month of unlimited PRO for ₾9.99 (50% off ₾19.90).
 *
 * The button goes to /credits (via /login?next=%2Fcredits), not straight to
 * Stripe: eligibility is verified against `email_campaign_recipient` on both
 * /credits and /api/subscription/checkout.
 */
export function LowCreditOfferEmail({
  name,
  balance,
  priceLabel,
  regularPriceLabel = "₾19.90",
  months,
  deadlineLabel,
  creditsUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  /** The reader's credit balance at send time, the reason for the email. */
  balance: number;
  /** Pre-formatted promo price, e.g. "₾9.99". */
  priceLabel: string;
  /** Pre-formatted anchor price shown struck through, e.g. "₾19.90". */
  regularPriceLabel?: string;
  months: number;
  /**
   * Localised last day of the offer, already in the form the sentence needs,
   * genitive in Georgian ("2 ნოემბრის"), plain in English ("2 November").
   */
  deadlineLabel: string;
  creditsUrl: string;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const pl = locale === "pl";
  const en = locale === "en";
  const isSingleMonth = months === 1;
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

  const spanTextPl = isSingleMonth ? "1 miesiąc" : `${months} miesiące`;
  const spanTextEn = isSingleMonth ? "1 month" : `${months} months`;
  const spanTextKa = isSingleMonth ? "1 თვე" : `${months} თვე`;

  const balanceLead = pl
    ? balance <= 0
      ? "Twoje kredyty się wyczerpały, a jednak widzimy, że wciąż wracasz, by sprawdzać układ gwiazd."
      : `Zostało Ci tylko ${balance} ${balance === 1 ? "kredyt" : "kredyty"}, a jednak widzimy, że wciąż wracasz, by sprawdzać układ gwiazd.`
    : en
      ? balance <= 0
        ? "Your credits have reached 0, yet we see you still coming back to check the stars."
        : `You only have ${balance} ${balance === 1 ? "credit" : "credits"} left, yet we see you still coming back to check the stars.`
      : balance <= 0
        ? "შენს ბალანსზე კრედიტები ამოიწურა, მაგრამ ვხედავთ, რომ ვარსკვლავებთან კავშირს არ წყვეტ და კვლავ გვსტუმრობ."
        : `შენს ბალანსზე სულ ${balance} კრედიტია დარჩენილი, მაგრამ ვხედავთ, რომ ვარსკვლავებთან კავშირს არ წყვეტ და კვლავ ჩვენთან ხარ.`;

  const perks = pl
    ? [
        "🔮  Nielimitowane rozkłady Tarota i pogłębione pytania przez cały miesiąc",
        "✨  Nielimitowany czat AI 24/7 z Twoim osobistym astrologiem",
        "🌙  Nielimitowane analizy synastrii i kompatybilności z dowolną osobą",
        "📜  7-dniowe prognozy kosmiczne, interpretacje snów i raporty PDF",
        "👑  Pełne wyniki testów (MBTI, IQ, EQ, Big Five) i odznaka Zweryfikowanego Profilu",
      ]
    : en
      ? [
          "🔮  Unlimited Tarot spreads & deep follow-up questions all month long",
          "✨  Unlimited 24/7 AI chat with your personal astrologer",
          "🌙  Unlimited synastry & compatibility readings with anyone",
          "📜  7-day cosmic forecasts, dream interpretations & PDF reports",
          "👑  Full personality, IQ, EQ & Big Five results + Verified profile badge",
        ]
      : [
          "🔮  ულიმიტო ტაროს გაშლები და ჩაღრმავებული კითხვები მთელი თვის განმავლობაში",
          "✨  ულიმიტო AI ჩატი შენს პირად ასტროლოგთან — იკითხე რაც გინდა, ლიმიტის გარეშე",
          "🌙  თავსებადობისა და სინასტრიის ანალიზი ნებისმიერ ადამიანთან, რამდენჯერაც გინდა",
          "📜  7-დღიანი პროგნოზები, სიზმრების ახსნა და პერსონალური PDF რუკები",
          "👑  ტესტების სრული შედეგები (MBTI, IQ, EQ, Big Five) და Verified badge პროფილზე",
        ];

  const halloweenButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background:
      "linear-gradient(135deg, #f97316 0%, #ec4899 52%, #a855f7 100%)",
    color: "#ffffff",
    fontWeight: 700,
    padding: "14px 28px",
    boxShadow: "0 8px 24px rgba(249, 115, 22, 0.28)",
  };

  return (
    <EmailLayout
      preview={
        pl
          ? `🎃 Oferta Halloweenowa: ${spanTextPl} nielimitowanego Vivida PRO za jedyne ${priceLabel}`
          : en
            ? `🎃 Halloween Special: ${spanTextEn} of unlimited Vivida PRO for just ${priceLabel}`
            : `🎃 ჰელოუინის სპეციალური შეთავაზება: ${spanTextKa} ულიმიტო Vivida PRO მხოლოდ ${priceLabel}-ად`
      }
      unsubscribeUrl={unsubscribeUrl}
      locale={locale}
    >
      {/* Halloween badge */}
      <div style={{ marginBottom: "14px" }}>
        <span
          style={{
            backgroundColor: "rgba(249, 115, 22, 0.14)",
            border: "1px solid rgba(249, 115, 22, 0.42)",
            borderRadius: "9999px",
            color: "#fb923c",
            display: "inline-block",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            padding: "5px 12px",
            textTransform: "uppercase",
          }}
        >
          {pl
            ? "🎃 Oferta Halloweenowa · Specjalnie dla Ciebie"
            : en
              ? "🎃 Halloween Special · Personal Offer"
              : "🎃 ჰელოუინის სპეციალური შეთავაზება"}
        </span>
      </div>

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
          ? `Uchyl zasłonę tajemnicy: ${spanTextPl} nielimitowanego Vivida PRO za jedyne ${priceLabel}`
          : en
            ? `Unlock the veil: ${spanTextEn} of unlimited Vivida PRO for just ${priceLabel}`
            : `როცა სამყაროებს შორის ზღვარი ქრება — ${spanTextKa} ულიმიტო Vivida PRO მხოლოდ ${priceLabel}-ად`}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#f3e8ff", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>
        {balanceLead}{" "}
        {pl
          ? "Halloween to najbardziej mistyczny okres w roku — czas, kiedy intuicja, karty Tarota i kosmiczne tranzyty przemawiają najsilniej."
          : en
            ? "Halloween is the most mystical week of the year — when intuition, Tarot cards, and astrological transits speak the loudest."
            : "ჰელოუინი წლის ყველაზე მისტიკური პერიოდია — დრო, როცა ინტუიცია, ტაროს არკანები და ვარსკვლავების მინიშნებები ყველაზე მძაფრად იგრძნობა."}
      </Text>

      <Text style={paragraphStyle}>
        {pl
          ? `Ponieważ jesteś jednym z naszych najbardziej zaangażowanych odkrywców, odblokowaliśmy na Twoim koncie prywatną ofertę halloweenową: ${spanTextPl} nielimitowanego Vivida PRO za jedyne ${priceLabel} zamiast ${regularPriceLabel}. Koniec z liczeniem kredytów — wszystko stoi przed Tobą otworem.`
          : en
            ? `Because you're one of our most engaged explorers, we unlocked a private Halloween offer on your account: ${spanTextEn} of unlimited Vivida PRO for just ${priceLabel} instead of ${regularPriceLabel}. No credit counting, no locked answers — everything is open.`
            : `რადგან ჩვენი ერთ-ერთი ყველაზე აქტიური მომხმარებელი ხარ, სპეციალურად შენს ანგარიშზე გავხსენით დახურული ჰელოუინის ფასდაკლება: ${spanTextKa} ულიმიტო Vivida PRO მხოლოდ ${priceLabel}-ად (სტანდარტული ${regularPriceLabel}-ის ნაცვლად). აღარანაირი კრედიტების თვლა — ყველაფერი სრულად ღიაა.`}
      </Text>

      {/* Halloween Offer Frame */}
      <div
        style={{
          background:
            "linear-gradient(145deg, rgba(249, 115, 22, 0.13) 0%, rgba(168, 85, 247, 0.12) 100%)",
          border: "1px solid rgba(249, 115, 22, 0.45)",
          borderRadius: "16px",
          margin: "20px 0 22px",
          padding: "20px 22px",
        }}
      >
        <Text
          style={{
            color: "#fdba74",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            margin: "0 0 6px",
            textTransform: "uppercase",
          }}
        >
          {pl
            ? "✦ −50% Przywilej Halloweenowy"
            : en
              ? "✦ −50% Halloween Privilege"
              : "✦ −50% ჰელოუინის პრივილეგია"}
        </Text>
        <Text
          style={{
            color: "#ffffff",
            fontSize: "30px",
            fontWeight: 800,
            lineHeight: "36px",
            margin: 0,
          }}
        >
          <span
            style={{
              color: "#9b94ad",
              fontSize: "18px",
              fontWeight: 500,
              marginRight: "10px",
              textDecoration: "line-through",
            }}
          >
            {regularPriceLabel}
          </span>
          <span style={{ color: "#fb923c" }}>{priceLabel}</span>
          <span
            style={{
              color: "#d8d2ee",
              fontSize: "15px",
              fontWeight: 500,
              marginLeft: "6px",
            }}
          >
            {pl
              ? isSingleMonth
                ? "/ miesiąc"
                : `/ ${months} mies.`
              : en
                ? isSingleMonth
                  ? "/ month"
                  : `/ ${months} months`
                : isSingleMonth
                  ? "/ 1 თვე"
                  : `/ ${months} თვე`}
          </span>
        </Text>
        <Text
          style={{
            color: "#e7e3f0",
            fontSize: "14px",
            lineHeight: "20px",
            margin: "6px 0 0",
          }}
        >
          {pl
            ? `Pełne ${spanTextPl} nielimitowanego dostępu PRO — zero ograniczeń`
            : en
              ? `Full ${spanTextEn} of unlimited PRO access — zero credit limits`
              : `${isSingleMonth ? "1 სრული თვის" : `${months} სრული თვის`} ულიმიტო PRO წვდომა — ნული შეზღუდვა`}
        </Text>
      </div>

      <Text
        style={{
          ...paragraphStyle,
          color: "#ffffff",
          margin: "0 0 10px",
          fontWeight: 600,
        }}
      >
        {pl
          ? "Wszystko, co odblokowujesz natychmiast:"
          : en
            ? "Everything that opens immediately:"
            : "რა იხსნება გააქტიურებისთანავე:"}
      </Text>
      {perks.map((perk) => (
        <Text
          key={perk}
          style={{
            color: "#e7e3f0",
            fontSize: "15px",
            lineHeight: "23px",
            margin: "0 0 8px",
          }}
        >
          {perk}
        </Text>
      ))}

      <div style={{ marginTop: 26, marginBottom: 8 }}>
        <Button href={creditsUrl} style={halloweenButtonStyle}>
          {pl
            ? `🎃 Odbierz nielimitowany miesiąc za ${priceLabel} →`
            : en
              ? `🎃 Claim Unlimited Month for ${priceLabel} →`
              : `🎃 გაააქტიურე ულიმიტო თვე ${priceLabel}-ად →`}
        </Button>
      </div>

      <Hr
        style={{
          borderColor: "rgba(249, 115, 22, 0.2)",
          margin: "24px 0 0",
        }}
      />

      <Text style={mutedStyle}>
        {pl
          ? `⏳ Ta oferta halloweenowa jest przypisana wyłącznie do Twojego konta i wygasa ${deadlineLabel}. Następnie odnawia się w tej samej cenie ${priceLabel} co ${isSingleMonth ? "miesiąc" : `${months} miesiące`}, a subskrypcję możesz anulować w każdej chwili jednym kliknięciem.`
          : en
            ? `⏳ This Halloween offer is exclusively linked to your account and expires on ${deadlineLabel}. Afterwards it renews at the same ${priceLabel} every ${isSingleMonth ? "month" : `${months} months`}, and you can cancel any time with one click.`
            : `⏳ ეს ჰელოუინის შეთავაზება მიბმულია მხოლოდ შენს ანგარიშზე და მოქმედებს ${deadlineLabel} ჩათვლით. შემდეგ ავტომატურად განახლდება იმავე ${priceLabel}-ად ${isSingleMonth ? "ყოველ თვეში" : `ყოველ ${months} თვეში`}, გაუქმება კი ნებისმიერ დროს, ერთი კლიკით შეგიძლია.`}
      </Text>
    </EmailLayout>
  );
}
