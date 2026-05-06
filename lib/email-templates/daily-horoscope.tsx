import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

export function DailyHoroscopeEmail({
  name,
  headline,
  summary,
  body,
  themes,
  dashboardUrl,
  unsubscribeUrl,
  localizedDate,
}: {
  name: string | null;
  /** Short, evocative title for today (from the AI generation). */
  headline: string;
  /** 1-2 sentence executive summary. */
  summary: string;
  /** Full reading — paragraphs separated by \n\n. */
  body: string;
  /** Optional theme keywords surfaced as inline pills in-app. */
  themes: string[];
  /** Deep link back to the in-app daily card. */
  dashboardUrl: string;
  /** One-click unsubscribe (specifically for daily digest opt-out). */
  unsubscribeUrl: string;
  /** Localised date string the dashboard would show, e.g. "ორშაბათი, 6 მაისი". */
  localizedDate: string;
}) {
  const greeting = name ? `სალამი, ${name}!` : "სალამი!";
  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return (
    <EmailLayout
      preview={`${headline} — ${summary.slice(0, 80)}`}
      unsubscribeUrl={unsubscribeUrl}
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
          fontSize: "26px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          lineHeight: "32px",
          margin: "0 0 16px",
        }}
      >
        {headline}
      </Heading>

      <Text style={{ ...paragraphStyle, color: "#cfc7df", fontSize: "17px" }}>
        {greeting}
      </Text>
      <Text style={{ ...paragraphStyle, fontStyle: "italic" }}>{summary}</Text>

      {paragraphs.map((p, i) => (
        <Text key={i} style={paragraphStyle}>
          {p}
        </Text>
      ))}

      {themes.length > 0 ? (
        <Text style={mutedStyle}>
          თემები: {themes.map((t) => `· ${t}`).join(" ")}
        </Text>
      ) : null}

      <div style={{ marginTop: 24 }}>
        <Button href={dashboardUrl} style={buttonStyle}>
          გახსენი დღევანდელი რუკა
        </Button>
      </div>
    </EmailLayout>
  );
}
