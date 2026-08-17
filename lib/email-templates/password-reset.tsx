import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

import type { UserLocale } from "@/lib/i18n/user-locale";

export function PasswordResetEmail({
  name,
  resetUrl,
  locale = "ka",
}: {
  name: string | null;
  resetUrl: string;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const greeting = name
    ? en
      ? `Hi, ${name}!`
      : `სალამი, ${name}!`
    : en
      ? "Hi!"
      : "სალამი!";
  return (
    <EmailLayout
      locale={locale}
      preview={en ? "Reset your Vivida password" : "აღადგინე შენი პაროლი Vivida-ზე"}
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
        {en ? "Reset your password" : "აღადგინე შენი პაროლი"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        {en
          ? "We received a request to reset your password. Use the button below to choose a new one."
          : "მივიღეთ მოთხოვნა შენი პაროლის აღდგენაზე. დააჭირე ღილაკს და დააყენე ახალი პაროლი."}
      </Text>

      <Button href={resetUrl} style={buttonStyle}>
        {en ? "Set a new password" : "ახალი პაროლის დაყენება"}
      </Button>

      <Text style={mutedStyle}>
        {en ? "Or paste this into your browser:" : "ან ჩასვი ბრაუზერში:"} <br />
        <span style={{ color: "#c4b5fd", wordBreak: "break-all" }}>
          {resetUrl}
        </span>
      </Text>

      <Text style={mutedStyle}>
        {en
          ? "This link is valid for one hour. If you did not request a reset, ignore this email—your password has not changed."
          : "ლინკი მოქმედია 1 საათი. თუ შენ არ გითხოვია აღდგენა, უგულებელყავი ეს წერილი — შენი პაროლი იგივე დარჩა."}
      </Text>
    </EmailLayout>
  );
}
