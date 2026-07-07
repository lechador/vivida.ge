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
  code,
}: {
  name: string | null;
  verifyUrl: string;
  /** 6-digit OTP alternative to the link; omitted (null) → link-only email. */
  code?: string | null;
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

      {code ? (
        <>
          <Text style={paragraphStyle}>
            მადლობა, რომ Vivida-ს შეუერთდი. შეიყვანე ეს კოდი გვერდზე, სადაც
            რეგისტრაცია დაიწყე:
          </Text>
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
                letterSpacing: "0.3em",
                fontFamily: "monospace",
              }}
            >
              {code}
            </span>
          </div>
          <Text style={paragraphStyle}>ან უბრალოდ დააჭირე ღილაკს:</Text>
        </>
      ) : (
        <Text style={paragraphStyle}>
          მადლობა, რომ Vivida-ს შეუერთდი. დაადასტურე შენი ელფოსტა ქვემოთა
          ღილაკით — ერთ ნაბიჯში შენი კოსმიური რუკა გელოდება.
        </Text>
      )}

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
        {code ? "კოდიც და ლინკიც მოქმედია" : "ლინკი მოქმედია"} 24 საათი. ვადის
        გასვლის შემდეგ შეგიძლია ხელახლა მოითხოვო შესვლის გვერდიდან.
      </Text>
    </EmailLayout>
  );
}
