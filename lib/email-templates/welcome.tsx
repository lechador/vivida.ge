import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

/**
 * Sent once when a user finishes signup. Pitches what they get from Vivida
 * and funnels them into the dashboard. No unsubscribe — transactional.
 *
 * The site is currently 100% free; copy reflects that. When paid plans
 * return, swap the body for the upsell version.
 */
export function WelcomeEmail({
  name,
  dashboardUrl,
}: {
  name: string | null;
  dashboardUrl: string;
}) {
  const greeting = name ? `კეთილი იყოს მობრძანება, ${name}!` : "კეთილი იყოს მობრძანება!";
  return (
    <EmailLayout preview="შენი კოსმიური მოგზაურობა იწყება — Vivida">
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
        შენი კოსმიური მოგზაურობა იწყება
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        Vivida-ში ყველა ფუნქცია სრულად ხელმისაწვდომია — ბარათის გარეშე, ლიმიტის
        გარეშე. შენი კოსმიური მოგზაურობა ერთ დაკლიკვაზე იწყება.
      </Text>

      <Text style={{ ...paragraphStyle, fontWeight: 600, color: "#ffffff" }}>
        ხელმისაწვდომია:
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
        თუ შეკითხვა გაქვს, უბრალოდ უპასუხე ამ წერილს.
      </Text>
    </EmailLayout>
  );
}
