import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/**
 * Shared layout for transactional emails. Plain inline styles only —
 * email clients (Gmail / iOS Mail / Outlook) ignore most CSS files,
 * so React Email guidance is to keep things explicit.
 */
export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="ka">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#0b0814",
          color: "#e7e3f0",
          fontFamily:
            "'Noto Sans Georgian', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "32px 12px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#15101f",
            border: "1px solid rgba(167, 139, 250, 0.18)",
            borderRadius: "16px",
            margin: "0 auto",
            maxWidth: "560px",
            overflow: "hidden",
          }}
        >
          {/* Brand band */}
          <Section
            style={{
              background:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
              padding: "20px 32px",
            }}
          >
            <Text
              style={{
                color: "#0b0814",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              ✦ vivida
            </Text>
          </Section>

          <Section style={{ padding: "32px" }}>{children}</Section>

          <Hr
            style={{
              borderColor: "rgba(167, 139, 250, 0.12)",
              margin: 0,
            }}
          />
          <Section style={{ padding: "20px 32px" }}>
            <Text
              style={{
                color: "#9b94ad",
                fontSize: "12px",
                lineHeight: "18px",
                margin: 0,
              }}
            >
              ეს წერილი ავტომატურად გამოიგზავნა vivida.ge-დან. თუ არ
              დარეგისტრირებულხარ, უგულებელყავი ეს შეტყობინება.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const buttonStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
  borderRadius: "9999px",
  color: "#0b0814",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
};

export const paragraphStyle: React.CSSProperties = {
  color: "#e7e3f0",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

export const mutedStyle: React.CSSProperties = {
  color: "#9b94ad",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "16px 0 0",
};
