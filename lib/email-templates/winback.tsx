import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout, buttonStyle, paragraphStyle } from "./_layout";

/**
 * Winback email — sent once when a previously-active user has been quiet for
 * a week. Personal, not promotional: leads with what the sky is doing for
 * THEIR sign today (real horoscope headline when available), reminds them of
 * their credit balance, one CTA. Nudge category → unsubscribable.
 */
export function WinbackEmail({
  name,
  signLineKa,
  horoscopeHeadline,
  balance,
  dashboardUrl,
  unsubscribeUrl,
}: {
  name: string | null;
  /** e.g. "ლომი" — the user's sun sign, null when birth data is missing. */
  signLineKa: string | null;
  /** Today's headline for their sign, when the cache had one. */
  horoscopeHeadline: string | null;
  balance: number;
  dashboardUrl: string;
  unsubscribeUrl: string;
}) {
  return (
    <EmailLayout
      preview="ვარსკვლავები ისევ შენზე საუბრობენ ✨"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <Text style={{ fontSize: "40px", lineHeight: "48px", margin: "0 0 8px" }}>
          🌙✨
        </Text>
        <Heading
          as="h1"
          style={{
            color: "#ffffff",
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: "34px",
            margin: "0 0 10px",
          }}
        >
          {name ? `${name}, ` : ""}ცა შენს გარეშე არ ჩერდება
        </Heading>
      </Section>

      <Text style={{ ...paragraphStyle, fontSize: "16px", lineHeight: "26px" }}>
        ერთი კვირაა არ გვინახიხარ — ამასობაში კი პლანეტები ადგილს იცვლიდნენ და
        შენი ჰოროსკოპი ყოველ დილით ახლდებოდა.
      </Text>

      {horoscopeHeadline && (
        <Section
          style={{
            background: "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.35)",
            borderRadius: "12px",
            margin: "16px 0",
            padding: "14px 18px",
          }}
        >
          <Text
            style={{
              color: "#c4b5fd",
              fontSize: "12px",
              letterSpacing: "0.12em",
              margin: "0 0 4px",
              textTransform: "uppercase",
            }}
          >
            დღეს {signLineKa ? `${signLineKa}სთვის` : "შენთვის"}
          </Text>
          <Text
            style={{
              color: "#f1eef8",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "24px",
              margin: 0,
            }}
          >
            {horoscopeHeadline}
          </Text>
        </Section>
      )}

      {balance > 0 && (
        <Text style={{ ...paragraphStyle, fontSize: "15px", lineHeight: "25px" }}>
          შენს ბალანსზე{" "}
          <span style={{ color: "#eac358", fontWeight: 700 }}>
            {balance} კრედიტი
          </span>{" "}
          გელოდება — შეგიძლია გახსნა აუდიო-ჰოროსკოპი, ღრმა თავსებადობა ან
          7-დღიანი პროგნოზი.
        </Text>
      )}

      <Section style={{ textAlign: "center", padding: "10px 0 8px" }}>
        <Button href={dashboardUrl} style={buttonStyle}>
          ნახე დღევანდელი ჰოროსკოპი
        </Button>
      </Section>
    </EmailLayout>
  );
}
