import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

export function PasswordResetEmail({
  name,
  resetUrl,
}: {
  name: string | null;
  resetUrl: string;
}) {
  const greeting = name ? `სალამი, ${name}!` : "სალამი!";
  return (
    <EmailLayout preview="აღადგინე შენი პაროლი Vivida-ზე">
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
        აღადგინე შენი პაროლი
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        მივიღეთ მოთხოვნა შენი პაროლის აღდგენაზე. დააჭირე ღილაკს და დააყენე
        ახალი პაროლი.
      </Text>

      <Button href={resetUrl} style={buttonStyle}>
        ახალი პაროლის დაყენება
      </Button>

      <Text style={mutedStyle}>
        ან ჩასვი ბრაუზერში: <br />
        <span style={{ color: "#c4b5fd", wordBreak: "break-all" }}>
          {resetUrl}
        </span>
      </Text>

      <Text style={mutedStyle}>
        ლინკი მოქმედია 1 საათი. თუ შენ არ გითხოვია აღდგენა, უგულებელყავი ეს
        წერილი — შენი პაროლი იგივე დარჩა.
      </Text>
    </EmailLayout>
  );
}
