import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  paragraphStyle,
} from "./_layout";

/**
 * Daily horoscope teaser. Intentionally short — date, evocative AI
 * headline, greeting, 1-2-sentence summary, CTA. The full reading (body
 * paragraphs, themes, moon phase, weekly stripe) lives on /dashboard.
 * Keeps inbox real-estate small and gives the button a real reason to
 * exist.
 */
export function DailyHoroscopeEmail({
  name,
  headline,
  summary,
  dashboardUrl,
  unsubscribeUrl,
  localizedDate,
  locale = "ka",
}: {
  name: string | null;
  /** Short, evocative title for today (from the AI generation). */
  headline: string;
  /** 1-2 sentence executive summary — the hook. */
  summary: string;
  /** Deep link back to the in-app daily card. */
  dashboardUrl: string;
  /** One-click unsubscribe (specifically for daily digest opt-out). */
  unsubscribeUrl: string;
  /** Localised date string the dashboard would show, e.g. "ორშაბათი, 6 მაისი". */
  localizedDate: string;
  locale?: "ka" | "en";
}) {
  const en = locale === "en";
  const greeting = name
    ? en ? `Hello, ${name}!` : `სალამი, ${name}!`
    : en ? "Hello!" : "სალამი!";

  return (
    <EmailLayout
      preview={summary.slice(0, 110)}
      unsubscribeUrl={unsubscribeUrl}
      locale={locale}
    >
      <Text
        style={{
          color: "#9b94ad",
          fontSize: "12px",
          letterSpacing: "0.18em",
          margin: "0 0 6px",
          textTransform: "uppercase",
        }}
      >
        {localizedDate}
      </Text>

      <Heading
        as="h1"
        style={{
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          lineHeight: "30px",
          margin: "0 0 14px",
        }}
      >
        {headline}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#cfc7df", fontSize: "16px" }}>
        {greeting}
      </Text>
      <Text style={{ ...paragraphStyle, fontStyle: "italic" }}>{summary}</Text>

      <div style={{ marginTop: 22 }}>
        <Button href={dashboardUrl} style={buttonStyle}>
          {en ? "Read your full horoscope" : "ნახე სრული ჰოროსკოპი"}
        </Button>
      </div>
    </EmailLayout>
  );
}
