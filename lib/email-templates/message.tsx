import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

/**
 * Notification email — fired only when the recipient has been absent
 * from the site for >1h, throttled to one per hour. We include a short
 * snippet of the message body for context but keep it brief; the full
 * conversation is one click away.
 */
export function MessageEmail({
  recipientName,
  fromName,
  fromUsername,
  snippet,
  conversationUrl,
  unsubscribeUrl,
}: {
  recipientName: string | null;
  fromName: string;
  fromUsername: string | null;
  /** Short preview of the message body — already truncated by the caller. */
  snippet: string;
  conversationUrl: string;
  unsubscribeUrl: string;
}) {
  const greeting = recipientName ? `სალამი, ${recipientName}!` : "სალამი!";
  const fromHandle = fromUsername ? `@${fromUsername}` : null;
  return (
    <EmailLayout
      preview={`${fromName}-მ წერილი მოგწერა`}
      unsubscribeUrl={unsubscribeUrl}
    >
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
        ახალი წერილი
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        <strong>{fromName}</strong>
        {fromHandle ? (
          <span style={{ color: "#9b94ad" }}> ({fromHandle})</span>
        ) : null}{" "}
        წერილი მოგწერა Vivida-ზე:
      </Text>

      {/* Message snippet block */}
      <div
        style={{
          backgroundColor: "#0b0814",
          border: "1px solid rgba(167, 139, 250, 0.18)",
          borderRadius: "12px",
          color: "#e7e3f0",
          fontSize: "15px",
          fontStyle: "italic",
          lineHeight: "22px",
          margin: "0 0 24px",
          padding: "16px 20px",
        }}
      >
        “{snippet}”
      </div>

      <Button href={conversationUrl} style={buttonStyle}>
        წაიკითხე და უპასუხე
      </Button>

      <Text style={mutedStyle}>
        ეს შეტყობინება მიიღე, რადგან გარკვეული ხნის წინ არ ეწვიე vivida.ge-ს.
      </Text>
    </EmailLayout>
  );
}
