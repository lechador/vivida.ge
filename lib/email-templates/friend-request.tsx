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
 * from the site for >1h, throttled to one per hour. The "from" name is
 * the requester; we send to the *recipient* of the friend request.
 */
export function FriendRequestEmail({
  recipientName,
  fromName,
  fromUsername,
  friendsUrl,
  unsubscribeUrl,
}: {
  recipientName: string | null;
  fromName: string;
  fromUsername: string | null;
  friendsUrl: string;
  unsubscribeUrl: string;
}) {
  const greeting = recipientName ? `სალამი, ${recipientName}!` : "სალამი!";
  const fromHandle = fromUsername ? `@${fromUsername}` : null;
  return (
    <EmailLayout
      preview={`${fromName}-მ მეგობრობის მოთხოვნა გამოგიგზავნა`}
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
        ახალი მეგობრობის მოთხოვნა
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        <strong>{fromName}</strong>
        {fromHandle ? (
          <span style={{ color: "#9b94ad" }}> ({fromHandle})</span>
        ) : null}{" "}
        გსურს დაგიმეგობრდეს Vivida-ზე. დაამატე და გაიგე, რამდენად თავსებადი
        ხართ ერთმანეთთან.
      </Text>

      <Button href={friendsUrl} style={buttonStyle}>
        ნახე მოთხოვნა
      </Button>

      <Text style={mutedStyle}>
        ეს შეტყობინება მიიღე, რადგან გარკვეული ხნის წინ არ ეწვიე vivida.ge-ს.
      </Text>
    </EmailLayout>
  );
}
