import { Button, Heading, Text } from "@react-email/components";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Last-day-of-trial notice.
 *
 * The whole point is that the first charge is never a surprise: it names
 * the exact amount, the cadence the reader picked at trial start, the card
 * it will come from, and the two-click way out — while there is still a
 * full day left to use it. Cancelled trials never receive this (the sender
 * filters them out); this copy assumes continuation is still scheduled.
 */
export function TrialEndingEmail({
  name,
  amountLabel,
  cadenceLabel,
  endDateLabel,
  manageUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  /** Pre-formatted first-charge amount, e.g. "₾29.00". */
  amountLabel: string;
  /** Pre-formatted cadence, e.g. "ყოველ 3 თვეში ერთხელ" / "every 3 months". */
  cadenceLabel: string;
  /** Pre-formatted trial end date, e.g. "11 ნოემბერი". */
  endDateLabel: string;
  manageUrl: string;
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

  return (
    <EmailLayout
      preview={
        pl
          ? `Jutro kończy się darmowy okres próbny — potem ${amountLabel} ${cadenceLabel}, chyba że anulujesz`
          : en
            ? `Your free trial ends tomorrow — then ${amountLabel} ${cadenceLabel}, unless you cancel`
            : `ხვალ უფასო პერიოდი გისრულდება — მერე ${amountLabel} ${cadenceLabel}, თუ არ გააუქმებ`
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
          ? "Jutro kończy się Twój darmowy tydzień"
          : en
            ? "Your free week ends tomorrow"
            : "ხვალ შენი უფასო კვირა სრულდება"}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#f3e8ff", fontSize: "16px" }}>
        {greeting}
      </Text>

      <Text style={paragraphStyle}>
        {pl
          ? `Krótka, uczciwa zapowiedź: ${endDateLabel} Twój darmowy okres próbny Vivida PRO dobiega końca i automatycznie przejdzie na wybrany przez Ciebie plan — ${amountLabel} ${cadenceLabel}. Opłata zostanie pobrana z karty, którą podałeś na początku okresu próbnego. Bez niespodzianek: dokładnie to zapowiadaliśmy na starcie.`
          : en
            ? `A short, honest heads-up: on ${endDateLabel} your free Vivida PRO trial ends and it automatically continues on the plan you picked — ${amountLabel} ${cadenceLabel}. The charge will come from the card you added when the trial started. No surprises: this is exactly what the first email said would happen.`
            : `მოკლედ და გულწრფელად: ${endDateLabel} შენი უფასო საცდელი პერიოდი სრულდება და Vivida PRO ავტომატურად გაგრძელდება შენ მიერ არჩეული გეგმით — ${amountLabel} ${cadenceLabel}. თანხა იმ ბარათიდან ჩამოიჭრება, რომელიც ტრიალის დაწყებისას მიუთითე. ყველაფერი ისეა, როგორც თავიდანვე ეწერა.`}
      </Text>

      <div
        style={{
          background:
            "linear-gradient(145deg, rgba(245, 197, 81, 0.12) 0%, rgba(245, 197, 81, 0.04) 100%)",
          border: "1px solid rgba(245, 197, 81, 0.45)",
          borderRadius: "16px",
          margin: "20px 0 22px",
          padding: "18px 22px",
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: "15px",
            lineHeight: "23px",
            margin: 0,
          }}
        >
          {pl
            ? "Pierwsza opłata: "
            : en
              ? "First charge: "
              : "პირველი ჩამოჭრა: "}
          <span style={{ color: "#f5c451", fontWeight: 700 }}>
            {amountLabel}
          </span>{" "}
          · {endDateLabel} · {cadenceLabel}
        </Text>
      </div>

      <Text style={paragraphStyle}>
        {pl
          ? "Jeśli PRO Ci się sprawdziło, nie musisz nic robić — dostęp zostaje bez przerwy. Jeśli nie chcesz kontynuować, anuluj dziś: zajmie to dwa kliknięcia na stronie subskrypcji, dostęp zachowasz do końca okresu próbnego i nie zapłacisz nic."
          : en
            ? "If PRO earned its place, you do not need to do anything — your access continues without a gap. If you do not want to continue, cancel today: it takes two clicks on the subscription page, you keep access until the trial ends, and you pay nothing."
            : "თუ PRO მოგეწონა, არაფრის გაკეთება არ გჭირდება — წვდომა შეუფერხებლად გაგრძელდება. თუ გაგრძელება არ გინდა, გააუქმე დღესვე: გამოწერის გვერდიდან ორი კლიკი დაგჭირდება, წვდომა საცდელი პერიოდის ბოლომდე შეგინარჩუნდება და არაფერს გადაიხდი."}
      </Text>

      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <Button
          href={manageUrl}
          style={{
            ...buttonStyle,
            background: "linear-gradient(135deg, #f5c451 0%, #f59e0b 100%)",
            color: "#1a1207",
            fontWeight: 700,
            padding: "14px 28px",
          }}
        >
          {pl
            ? "Zobacz swoją subskrypcję →"
            : en
              ? "Review my subscription →"
              : "გადახედე გამოწერას →"}
        </Button>
      </div>
      <Text style={{ ...mutedStyle, margin: "4px 0 0" }}>
        {pl
          ? "Na tej stronie zobaczysz datę pierwszej opłaty i możesz anulować w dowolnym momencie."
          : en
            ? "That page shows your first-charge date and lets you cancel anytime."
            : "იმ გვერდზე ნახავ პირველი ჩამოჭრის თარიღსაც და გაუქმებასაც ნებისმიერ დროს შეძლებ."}
      </Text>
    </EmailLayout>
  );
}
