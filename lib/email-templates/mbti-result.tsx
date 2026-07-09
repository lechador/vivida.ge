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
}: {
  name: string | null;
  mbtiType: string;
  archetypeNameGe: string;
  resultUrl: string;
  /** First ~2 sentences of the analysis, for a teaser in the inbox. */
  excerpt: string;
}) {
  const greeting = name ? `${name}, შენი შედეგი მზადაა!` : "შენი შედეგი მზადაა!";
  return (
    <EmailLayout preview={`შენი ტიპია ${mbtiType} — ${archetypeNameGe}`}>
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
        Astro-MBTI შედეგი
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
        ნახე სრული ანალიზი
      </Button>

      <Text style={mutedStyle}>
        შედეგი ხელმისაწვდომია შენს პროფილზეც. თუ შეკითხვა გაქვს, უპასუხე ამ
        წერილს.
      </Text>
    </EmailLayout>
  );
}
