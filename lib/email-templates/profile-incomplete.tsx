import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function ProfileIncompleteEmail({
  name,
  onboardingUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  name: string | null;
  onboardingUrl: string;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const greeting = name
    ? en ? `Hello, ${name}!` : `სალამი, ${name}!`
    : en ? "Hello!" : "სალამი!";
  return (
    <EmailLayout
      preview={en ? "Complete your profile — your birth chart is waiting" : "დაასრულე რეგისტრაცია — შენი ნატალური რუკა გელოდება"}
      unsubscribeUrl={unsubscribeUrl}
      locale={locale}
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
        {en ? "Your chart is still waiting" : "შენი რუკა ჯერ კიდევ გელოდება"}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        {en
          ? "You created a Vivida account but have not added your birth date, time, and place yet, so we cannot calculate your natal chart."
          : "შენ vivida.ge-ზე დარეგისტრირდი, მაგრამ ჯერ არ შეგიყვანია დაბადების თარიღი, დრო და ადგილი — ამიტომ ვერ ვუშვით შენი ნატალური რუკა."}
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
          {en ? "✦ 50 bonus credits" : "✦ 50 კრედიტი საჩუქრად"}
        </Text>
        <Text
          style={{
            color: "#cfc7df",
            fontSize: "14px",
            lineHeight: "21px",
            margin: 0,
          }}
        >
          {en
            ? "Complete your birth details and the bonus will be added automatically."
            : "შეავსე დაბადების დეტალები და ბონუსი ავტომატურად დაგერიცხება."}
        </Text>
      </Section>

      <Text style={{ ...paragraphStyle, fontWeight: 600, color: "#ffffff" }}>
        {en ? "In about 60 seconds, you will unlock:" : "სულ 60 წამში მიიღებ:"}
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
        <li>{en ? "Your big three — Sun, Moon, and rising sign" : "შენი დიდი სამეული — მზე, მთვარე და ასცენდენტი"}</li>
        <li>{en ? "A complete natal chart and interpretation" : "სრული ნატალური რუკა და ინტერპრეტაცია"}</li>
        <li>{en ? "A daily horoscope personalized to your chart" : "ყოველდღიური ჰოროსკოპი, შენს რუკაზე მორგებული"}</li>
        <li>{en ? "Compatibility with friends and partners" : "თავსებადობა მეგობრებთან და პარტნიორებთან"}</li>
      </ul>

      <div style={{ marginTop: 22 }}>
        <Button href={onboardingUrl} style={buttonStyle}>
          {en ? "Complete my profile and get 50 credits" : "შეავსე მონაცემები და მიიღე 50 კრედიტი"}
        </Button>
      </div>

      <Text style={mutedStyle}>{en ? "If you have a question, simply reply to this email." : "თუ შეკითხვა გაქვს, უბრალოდ უპასუხე ამ წერილს."}</Text>
    </EmailLayout>
  );
}
