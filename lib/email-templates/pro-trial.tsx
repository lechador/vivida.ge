import { Button, Heading, Hr, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Launch email for the 7-day PRO free trial.
 *
 * Conversion shape, in order: the pain (credit counting), the zero-risk
 * offer (₾0 today, first charge only after day 7 and only if not cancelled),
 * what unlocks, the three honest steps including why a card is asked for,
 * then one single CTA. No invented deadline: the urgency claim is only that
 * the trial itself is new. The CTA lands on /subscription (through /login),
 * where the buyer picks the post-trial plan before Checkout.
 */
export function ProTrialEmail({
  name,
  trialDays,
  zeroPriceLabel,
  monthlyPriceLabel,
  quarterlyPriceLabel,
  quarterlyPerMonthLabel,
  trialUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  trialDays: number;
  /** Pre-formatted "₾0.00" in the reader's market currency. */
  zeroPriceLabel: string;
  /** Pre-formatted monthly plan price, e.g. "₾19.90". */
  monthlyPriceLabel: string;
  /** Pre-formatted quarterly plan price, e.g. "₾29.00". Null where the market has no quarterly plan. */
  quarterlyPriceLabel: string | null;
  /** Pre-formatted quarterly price spread per month, e.g. "₾9.67". */
  quarterlyPerMonthLabel: string | null;
  trialUrl: string;
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

  const perks = pl
    ? [
        "Tarot bez limitu — rozkłady i pytania uzupełniające, ile chcesz",
        "Czat AI z Twoim osobistym astrologiem, bez dziennego limitu",
        "Synastria i zgodność z dowolną osobą, bez odblokowywania za kredyty",
        "Pełne raporty PDF, prognozy 7-dniowe i interpretacje snów",
        "Pełne wyniki testów (MBTI, IQ, EQ, Big Five) i odznaka Verified",
      ]
    : en
      ? [
          "Unlimited tarot — spreads and follow-up questions, as many as you want",
          "AI chat with your personal astrologer, no daily limit",
          "Synastry and compatibility with anyone, no credit unlocks",
          "Full PDF reports, 7-day forecasts and dream interpretations",
          "Full test results (MBTI, IQ, EQ, Big Five) and the Verified badge",
        ]
      : [
          "ულიმიტო ტარო — გაშლები და დამაზუსტებელი კითხვები, რამდენიც გინდა",
          "AI ჩატი შენს პირად ასტროლოგთან, დღიური ლიმიტის გარეშე",
          "თავსებადობა ნებისმიერ ადამიანთან, კრედიტებით გახსნის გარეშე",
          "სრული PDF ანგარიშები, 7-დღიანი პროგნოზები და სიზმრების ახსნა",
          "ტესტების სრული შედეგები (MBTI, IQ, EQ, Big Five) და Verified ნიშანი",
        ];

  const steps = pl
    ? [
        "Kliknij przycisk i wybierz, co ma się wydarzyć po okresie próbnym: płatność co 3 miesiące czy co miesiąc.",
        `Podaj kartę — dziś płacisz ${zeroPriceLabel}. Karta jest potrzebna tylko po to, by PRO nie wyłączyło się samo po 7 dniach, jeśli zechcesz zostać.`,
        "Przez cały tydzień wszystko jest otwarte. Anuluj przed końcem okresu próbnego, a nie zapłacisz nic.",
      ]
    : en
      ? [
          "Tap the button and choose what happens after the trial: billed every 3 months, or monthly.",
          `Add your card — today you pay ${zeroPriceLabel}. The card is only there so PRO does not switch itself off after day 7 if you decide to stay.`,
          "Everything stays open for the full week. Cancel before the trial ends and you pay nothing.",
        ]
      : [
          "დააჭირე ღილაკს და აირჩიე, ტრიალის მერე რა გირჩევნია: გადახდა ყოველ 3 თვეში თუ ყოველთვიურად.",
          `მიუთითე ბარათი — დღეს იხდი ${zeroPriceLabel}-ს. ბარათი მხოლოდ იმიტომ გვჭირდება, რომ მე-8 დღეს PRO თავისით არ გაგეთიშოს, თუ დარჩენა გინდა.`,
          "მთელი კვირა ყველაფერი ღიაა. თუ ვადის ამოწურვამდე გააუქმებ, არაფერს იხდი.",
        ];

  return (
    <EmailLayout
      preview={
        pl
          ? `${trialDays} dni nielimitowanego Vivida PRO za darmo — dziś ${zeroPriceLabel}, anuluj kiedy chcesz`
          : en
            ? `${trialDays} days of unlimited Vivida PRO, free — ${zeroPriceLabel} today, cancel anytime`
            : `${trialDays} დღე ულიმიტო Vivida PRO უფასოდ — დღეს ${zeroPriceLabel}, გააუქმე ნებისმიერ დროს`
      }
      unsubscribeUrl={unsubscribeUrl}
      locale={locale}
    >
      <div style={{ marginBottom: "14px" }}>
        <span
          style={{
            backgroundColor: "rgba(245, 197, 81, 0.12)",
            border: "1px solid rgba(245, 197, 81, 0.4)",
            borderRadius: "9999px",
            color: "#f5c451",
            display: "inline-block",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            padding: "5px 12px",
            textTransform: "uppercase",
          }}
        >
          {pl
            ? "Nowość w Vivida · Darmowy okres próbny"
            : en
              ? "New on Vivida · Free trial"
              : "სიახლე Vivida-ზე · უფასო საცდელი პერიოდი"}
        </span>
      </div>

      <Heading
        as="h1"
        style={{
          color: "#ffffff",
          fontSize: "26px",
          fontWeight: 700,
          letterSpacing: "-0.015em",
          lineHeight: "34px",
          margin: "0 0 16px",
        }}
      >
        {pl
          ? `Cała Vivida otwarta przez ${trialDays} dni. Za darmo.`
          : en
            ? `All of Vivida, open for ${trialDays} days. Free.`
            : `მთელი Vivida ღიაა ${trialDays} დღით. უფასოდ.`}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#f3e8ff", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>
        {pl
          ? "Do tej pory każda głębsza odpowiedź kosztowała kredyty — kolejny rozkład Tarota, pytanie uzupełniające, pełny raport. Od dziś możesz po prostu przestać je liczyć: po raz pierwszy w Vivida PRO zaczyna się od darmowego tygodnia."
          : en
            ? "Until now every deeper answer cost credits — the next tarot spread, the follow-up question, the full report. From today you can simply stop counting them: for the first time, Vivida PRO starts with a free week."
            : "აქამდე ყველა ღრმა პასუხი კრედიტები ღირდა — შემდეგი ტაროს გაშლა, დამაზუსტებელი კითხვა, სრული ანგარიში. დღეიდან შეგიძლია მათი თვლა უბრალოდ შეწყვიტო: Vivida-ზე პირველად, PRO უფასო კვირით იწყება."}
      </Text>

      {/* Offer frame */}
      <div
        style={{
          background:
            "linear-gradient(145deg, rgba(245, 197, 81, 0.12) 0%, rgba(245, 197, 81, 0.04) 100%)",
          border: "1px solid rgba(245, 197, 81, 0.45)",
          borderRadius: "16px",
          margin: "20px 0 22px",
          padding: "20px 22px",
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: "30px",
            fontWeight: 800,
            lineHeight: "36px",
            margin: 0,
          }}
        >
          {trialDays} {pl ? "dni" : en ? "days" : "დღე"}
          <span style={{ color: "#f5c451", marginLeft: "10px" }}>
            {zeroPriceLabel}
          </span>
        </Text>
        <Text
          style={{
            color: "#e7e3f0",
            fontSize: "14px",
            lineHeight: "21px",
            margin: "8px 0 0",
          }}
        >
          {quarterlyPriceLabel && quarterlyPerMonthLabel
            ? pl
              ? `Potem wybór należy do Ciebie: ${quarterlyPriceLabel} co 3 miesiące (czyli ${quarterlyPerMonthLabel} miesięcznie) albo ${monthlyPriceLabel} co miesiąc. Do końca okresu próbnego: ${zeroPriceLabel}.`
              : en
                ? `After that, you choose: ${quarterlyPriceLabel} every 3 months (that is ${quarterlyPerMonthLabel} a month) or ${monthlyPriceLabel} monthly. Until the trial ends: ${zeroPriceLabel}.`
                : `ამის მერე არჩევანი შენზეა: ${quarterlyPriceLabel} ყოველ 3 თვეში (ანუ ${quarterlyPerMonthLabel} თვეში) ან ${monthlyPriceLabel} ყოველთვიურად. საცდელი პერიოდის ბოლომდე კი — ${zeroPriceLabel}.`
            : pl
              ? `Potem ${monthlyPriceLabel} co miesiąc. Do końca okresu próbnego: ${zeroPriceLabel}.`
              : en
                ? `After that, ${monthlyPriceLabel} a month. Until the trial ends: ${zeroPriceLabel}.`
                : `ამის მერე — ${monthlyPriceLabel} ყოველთვიურად. საცდელი პერიოდის ბოლომდე კი — ${zeroPriceLabel}.`}
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
          ? "Co otwiera się od razu:"
          : en
            ? "What opens immediately:"
            : "რა იხსნება პირველივე წუთიდან:"}
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
          ✦&nbsp;&nbsp;{perk}
        </Text>
      ))}

      <Text
        style={{
          ...paragraphStyle,
          color: "#ffffff",
          margin: "18px 0 10px",
          fontWeight: 600,
        }}
      >
        {pl ? "Jak to działa:" : en ? "How it works:" : "როგორ მუშაობს:"}
      </Text>
      {steps.map((step, i) => (
        <Text
          key={step}
          style={{
            color: "#e7e3f0",
            fontSize: "15px",
            lineHeight: "23px",
            margin: "0 0 8px",
          }}
        >
          <span style={{ color: "#f5c451", fontWeight: 700 }}>{i + 1}.</span>
          &nbsp;&nbsp;{step}
        </Text>
      ))}

      <div style={{ marginTop: 26, marginBottom: 8 }}>
        <Button
          href={trialUrl}
          style={{
            ...buttonStyle,
            background: "linear-gradient(135deg, #f5c451 0%, #f59e0b 100%)",
            color: "#1a1207",
            fontWeight: 700,
            padding: "14px 28px",
          }}
        >
          {pl
            ? `Zacznij darmowe ${trialDays} dni →`
            : en
              ? `Start my free ${trialDays} days →`
              : `დაიწყე უფასო ${trialDays} დღე →`}
        </Button>
      </div>
      <Text style={{ ...mutedStyle, margin: "4px 0 0" }}>
        {pl
          ? `Dziś: ${zeroPriceLabel}. Bez karty nie da się rozpocząć okresu próbnego — anulowanie zajmuje dwa kliknięcia w ustawieniach subskrypcji.`
          : en
            ? `Today: ${zeroPriceLabel}. A card is required to start the trial — cancelling takes two clicks in your subscription settings.`
            : `დღეს: ${zeroPriceLabel}. ბარათის გარეშე ტრიალი ვერ დაიწყება — გაუქმებას კი გამოწერის გვერდიდან ორი კლიკი სჭირდება.`}
      </Text>

      <Hr
        style={{ borderColor: "rgba(245, 197, 81, 0.2)", margin: "24px 0 0" }}
      />

      <Text style={mutedStyle}>
        {pl
          ? `Okres próbny jest dostępny raz na konto i tylko dla kont, które nigdy nie miały PRO. Po ${trialDays} dniach subskrypcja przechodzi na wybrany plan, chyba że wcześniej anulujesz — wtedy nie płacisz nic.`
          : en
            ? `The trial is available once per account, only if you have never had PRO. After ${trialDays} days it moves to the plan you picked, unless you cancel first — then you pay nothing.`
            : `ტრიალი ერთ ანგარიშზე ერთხელ მოქმედებს და მხოლოდ მათთვის, ვისაც PRO არასდროს ჰქონია. ${trialDays} დღის მერე გამოწერა შენ მიერ არჩეულ გეგმაზე გადადის — თუ მანამდე გააუქმებ, არაფერს იხდი.`}
      </Text>
    </EmailLayout>
  );
}
