import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

export function ProfileIncompleteEmail({
  name,
  onboardingUrl,
  unsubscribeUrl,
}: {
  name: string | null;
  onboardingUrl: string;
  unsubscribeUrl: string;
}) {
  const greeting = name ? `სალამი, ${name}!` : "სალამი!";
  return (
    <EmailLayout
      preview="დაასრულე რეგისტრაცია — შენი ნატალური რუკა გელოდება"
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
        შენი რუკა ჯერ კიდევ გელოდება
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        შენ vivida.ge-ზე დარეგისტრირდი, მაგრამ ჯერ არ შეგიყვანია დაბადების
        თარიღი, დრო და ადგილი — ამიტომ ვერ ვუშვით შენი ნატალური რუკა.
      </Text>
      <Text style={paragraphStyle}>
        დასჭირდება სულ რაღაც 60 წამი. შემდეგ შენთვის ხელმისაწვდომი იქნება:
      </Text>

      <ul
        style={{
          color: "#e7e3f0",
          fontSize: "15px",
          lineHeight: "24px",
          margin: "0 0 16px",
          paddingLeft: 22,
        }}
      >
        <li>შენი დიდი სამეული — მზე, მთვარე და ასცენდენტი</li>
        <li>სრული ნატალური რუკა და ინტერპრეტაცია</li>
        <li>ყოველდღიური ჰოროსკოპი, შენს რუკაზე მორგებული</li>
        <li>თავსებადობა მეგობრებთან და პარტნიორებთან</li>
      </ul>

      <Button href={onboardingUrl} style={buttonStyle}>
        შეავსე მონაცემები
      </Button>

      <Text style={mutedStyle}>
        ბარათის გარეშე. პირველი თვე უფასოდ.
      </Text>
    </EmailLayout>
  );
}
