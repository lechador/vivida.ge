import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout, buttonStyle, mutedStyle, paragraphStyle } from "./_layout";

/**
 * Sent when a user's Astro-MBTI result is generated. Shows the type +
 * archetype and a short excerpt, then links to the full result on the site.
 */
export function MbtiResultEmail({
  name,
  mbtiType,
  archetypeNameGe,
  resultUrl,
  excerpt,
  locale = "ka",
}: {
  name: string | null;
  mbtiType: string;
  archetypeNameGe: string;
  resultUrl: string;
  /** First ~2 sentences of the analysis, for a teaser in the inbox. */
  excerpt: string;
  locale?: "ka" | "en";
}) {
  const en = locale === "en";
  const greeting = en
    ? (name ? `${name}, your result is ready!` : "Your result is ready!")
    : (name ? `${name}, შენი შედეგი მზადაა!` : "შენი შედეგი მზადაა!");
  return (
    <EmailLayout preview={en ? `Your type is ${mbtiType} — ${archetypeNameGe}` : `შენი ტიპია ${mbtiType} — ${archetypeNameGe}`}>
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
        {en ? "Your Astro-MBTI result" : "Astro-MBTI შედეგი"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>

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
            letterSpacing: "0.12em",
          }}
        >
          {mbtiType}
        </span>
        <br />
        <span style={{ color: "#c4b5fd", fontSize: "16px" }}>
          {archetypeNameGe}
        </span>
      </div>

      <Text style={paragraphStyle}>{excerpt}</Text>

      <Button href={resultUrl} style={buttonStyle}>
        {en ? "View your full profile" : "ნახე სრული ანალიზი"}
      </Button>

      <Text style={mutedStyle}>
        {en
          ? "This result is also saved to your profile. If you have a question, reply to this email."
          : "შედეგი ხელმისაწვდომია შენს პროფილზეც. თუ შეკითხვა გაქვს, უპასუხე ამ წერილს."}
      </Text>
    </EmailLayout>
  );
}
