import { Button, Heading, Section, Text } from "@react-email/components";
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
      <Section
        style={{
          backgroundColor: "#1a1533",
          border: "1px solid #3b2f66",
          borderRadius: "12px",
          margin: "4px 0 20px",
          padding: "18px 20px",
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: 700,
            lineHeight: "26px",
            margin: "0 0 6px",
          }}
        >
          ✦ 50 კრედიტი საჩუქრად
        </Text>
        <Text
          style={{
            color: "#cfc7df",
            fontSize: "14px",
            lineHeight: "21px",
            margin: 0,
          }}
        >
          შეავსე დაბადების დეტალები და ბონუსი ავტომატურად დაგერიცხება.
        </Text>
      </Section>

      <Text style={{ ...paragraphStyle, fontWeight: 600, color: "#ffffff" }}>
        სულ 60 წამში მიიღებ:
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

      <div style={{ marginTop: 22 }}>
        <Button href={onboardingUrl} style={buttonStyle}>
          შეავსე მონაცემები და მიიღე 50 კრედიტი
        </Button>
      </div>

      <Text style={mutedStyle}>თუ შეკითხვა გაქვს, უბრალოდ უპასუხე ამ წერილს.</Text>
    </EmailLayout>
  );
}
