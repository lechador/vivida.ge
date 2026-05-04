import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

export function VerificationEmail({
  name,
  verifyUrl,
}: {
  name: string | null;
  verifyUrl: string;
}) {
  const greeting = name ? `სალამი, ${name}!` : "სალამი!";
  return (
    <EmailLayout preview="დაადასტურე შენი ელფოსტა Vivida-ზე">
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
        დაადასტურე შენი ელფოსტა
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        მადლობა, რომ Vivida-ს შეუერთდი. დაადასტურე შენი ელფოსტა ქვემოთა
        ღილაკით — ერთ ნაბიჯში შენი კოსმიური რუკა გელოდება.
      </Text>

      <Button href={verifyUrl} style={buttonStyle}>
        ელფოსტის დადასტურება
      </Button>

      <Text style={mutedStyle}>
        ან ჩასვი ბრაუზერში: <br />
        <span style={{ color: "#c4b5fd", wordBreak: "break-all" }}>
          {verifyUrl}
        </span>
      </Text>

      <Text style={mutedStyle}>
        ლინკი მოქმედია 24 საათი. ვადის გასვლის შემდეგ შეგიძლია ხელახლა
        მოითხოვო ანგარიშის გვერდიდან.
      </Text>
    </EmailLayout>
  );
}
