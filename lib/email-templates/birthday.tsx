import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout, buttonStyle, paragraphStyle } from "./_layout";

/**
 * Birthday email — warm AI-written body (2 short paragraphs, Georgian) plus
 * a gold gift box announcing the +1 free month of Pro (already applied, no
 * action needed). Transactional (once a year, tied to an account benefit),
 * so no unsubscribe link — mirrors the welcome email.
 */
export function BirthdayEmail({
  name,
  paragraphs,
  dashboardUrl,
}: {
  name: string | null;
  paragraphs: string[];
  dashboardUrl: string;
}) {
  return (
    <EmailLayout preview="გილოცავ დაბადების დღეს! 🎂 საჩუქარი შიგნით გელოდება">
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
        გილოცავ დაბადების დღეს{name ? `, ${name}` : ""}! 🎂
      </Heading>

      {paragraphs.map((p, i) => (
        <Text key={i} style={paragraphStyle}>
          {p}
        </Text>
      ))}

      {/* Gift box — gold accent, same treatment as the launch announcement */}
      <Section
        style={{
          backgroundColor: "rgba(234, 195, 88, 0.07)",
          border: "1px solid rgba(234, 195, 88, 0.35)",
          borderRadius: "12px",
          margin: "20px 0",
          padding: "18px",
        }}
      >
        <Text
          style={{
            color: "#eac358",
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: "24px",
            margin: "0 0 8px",
          }}
        >
          🎁 საჩუქარი: 1 თვე Vivida Pro — უფასოდ
        </Text>
        <Text
          style={{
            color: "#d8d2ee",
            fontSize: "14px",
            lineHeight: "22px",
            margin: 0,
          }}
        >
          დაბადების დღის საჩუქრად შენს ანგარიშს 1 თვე Vivida Pro დაემატა —
          უკვე გააქტიურებულია, არაფრის გაკეთება არ გჭირდება. უბრალოდ შედი და
          ისიამოვნე ✨
        </Text>
      </Section>

      <Button href={dashboardUrl} style={buttonStyle}>
        ნახე დღევანდელი ცა
      </Button>
    </EmailLayout>
  );
}
