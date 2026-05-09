import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

/**
 * Sent once when a user finishes signup. Pitches the auto-issued 30-day
 * Pro trial that everyone gets at registration time, then funnels them
 * into the dashboard. No unsubscribe — transactional.
 */
export function WelcomeEmail({
  name,
  dashboardUrl,
  trialDays,
  pricingUrl,
}: {
  name: string | null;
  dashboardUrl: string;
  trialDays: number;
  pricingUrl: string;
}) {
  const greeting = name ? `კეთილი იყოს მობრძანება, ${name}!` : "კეთილი იყოს მობრძანება!";
  return (
    <EmailLayout preview={`${trialDays} დღე Pro საჩუქრად — შენი კოსმიური მოგზაურობა იწყება`}>
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
        {trialDays} დღე Pro — საჩუქრად
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        გამოწერისთანავე გაჩუქე Pro წვდომა — სულ {trialDays} დღე უფასოდ, ბარათის
        გარეშე. ეს არის შენი კოსმიური მოგზაურობის დასაწყისი.
      </Text>

      <Text style={{ ...paragraphStyle, fontWeight: 600, color: "#ffffff" }}>
        Pro-თი ხელმისაწვდომია:
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
        <li>
          <strong>ნატალური რუკა</strong> — სრული ინტერპრეტაცია, პლანეტები,
          სახლები და ასპექტები
        </li>
        <li>
          <strong>ყოველდღიური ჰოროსკოპი</strong> — შენს რუკაზე მორგებული, AI-ით
          გენერირებული
        </li>
        <li>
          <strong>თავსებადობა</strong> — შეადარე თავი მეგობრებს, პარტნიორებს,
          ცნობილ ადამიანებს
        </li>
        <li>
          <strong>კოსმიური მოვლენები</strong> — ახალმთვარეები, რეტროგრადები,
          ტრანზიტები
        </li>
      </ul>

      <Button href={dashboardUrl} style={buttonStyle}>
        ნახე შენი რუკა
      </Button>

      <Text style={mutedStyle}>
        Pro ავტომატურად დასრულდება {trialDays} დღის შემდეგ. გაგრძელება ნებაყოფლობითია —
        <a
          href={pricingUrl}
          style={{ color: "#c4b5fd", textDecoration: "underline" }}
        >
          {" "}
          ფასები
        </a>
        .
      </Text>
    </EmailLayout>
  );
}
