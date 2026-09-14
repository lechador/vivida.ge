import { Button, Heading, Text } from "@react-email/components";

import { EmailLayout, buttonStyle, mutedStyle, paragraphStyle } from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Delivers a finished natal PDF report to the reader's inbox, sent on demand
 * from the "email me the PDF" button on /report and /reports/[id].
 *
 * The PDF normally rides along as an attachment; `attached` says whether it
 * actually did, because the copy has to match — an email that promises an
 * attachment that isn't there reads as broken. Either way the download link
 * is present, so the mail is useful on its own.
 */
export function ReportReadyEmail({
  name,
  reportUrl,
  attached,
  locale = "ka",
  reportTitle,
}: {
  name: string | null;
  /** Link back to the in-app report page (download works there while signed in). */
  reportUrl: string;
  attached: boolean;
  locale?: UserLocale;
  reportTitle?: string;
}) {
  const en = locale !== "ka";
  const am = locale === "am";

  const preview = reportTitle ?? (am ? "Ձեր ամբողջական զեկույցը" : en ? "Your complete personal report" : "შენი სრული პერსონალური რეპორტი");

  const greeting = name
    ? am
      ? `Բարև, ${name}։`
      : en
        ? `Hello, ${name}!`
        : `სალამი, ${name}!`
    : am
      ? "Բարև։"
      : en
        ? "Hello!"
        : "სალამი!";

  return (
    <EmailLayout preview={preview} locale={locale}>
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
        {reportTitle ?? (am ? "Ձեր զեկույցը" : en ? "Your report" : "შენი რეპორტი")}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>

      <Text style={paragraphStyle}>
        {attached
          ? am
            ? "Ձեր անձնական զեկույցը կցված է այս նամակին PDF ֆայլով։ Պահեք այն ձեզ մոտ՝ ցանկացած պահի կարդալու համար։"
            : en
              ? "Your personal report is attached to this email as a PDF. Save it — it's yours to keep and read whenever you like."
              : "შენი პერსონალური რეპორტი ამ წერილს PDF-ად ახლავს. შეინახე — ის სამუდამოდ შენთან რჩება."
          : am
            ? "Ձեր անձնական զեկույցը պատրաստ է։ Ներբեռնեք այն ստորև նշված հղումով։"
            : en
              ? "Your personal report is ready. Download it from the link below."
              : "შენი პერსონალური რეპორტი მზადაა. ჩამოტვირთე ქვემოთ მოცემული ბმულით."}
      </Text>

      <Button href={reportUrl} style={buttonStyle}>
        {am
          ? "Բացել զեկույցը"
          : en
            ? "Open your report"
            : "გახსენი ანგარიში"}
      </Button>

      <Text style={mutedStyle}>
        {am
          ? "Զեկույցը միշտ հասանելի է ձեր հաշվում ևս։ Հարցի դեպքում պատասխանեք այս նամակին։"
          : en
            ? "The report also stays in your account, ready to download any time. If you have a question, just reply to this email."
            : "ანგარიში შენს პროფილზეც რჩება — ჩამოტვირთვა ნებისმიერ დროს შეგიძლია. თუ შეკითხვა გაქვს, უპასუხე ამ წერილს."}
      </Text>
    </EmailLayout>
  );
}
