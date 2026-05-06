import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";

export type SubscriptionEmailKind = "granted" | "extended" | "revoked";

const COPY: Record<
  SubscriptionEmailKind,
  {
    subject: string;
    preview: string;
    heading: string;
    intro: (days: number | null) => string;
    body: (days: number | null, until: string | null) => string[];
    cta: string | null;
  }
> = {
  granted: {
    subject: "🎁 საჩუქარი vivida-სგან · Pro აქტივირებულია",
    preview: "გაჩუქე ფარული რუკა — Pro წვდომა შენთვის",
    heading: "შენთვის Pro საჩუქრად",
    intro: (days) =>
      days
        ? `vivida-მ შენთვის Pro წვდომა ${days} დღით გააქტიურა — სრულიად უფასოდ.`
        : "vivida-მ შენთვის Pro წვდომა გააქტიურა — სრულიად უფასოდ.",
    body: (_days, until) => [
      "ახლა შენ გაქვს წვდომა ყოველდღიურ პროგნოზებზე, კვირეულ ფორექასტზე, სრულ ნატალურ რუკაზე და სინასტრიის ანალიზზე.",
      until
        ? `Pro წვდომა აქტიურია ${until}-მდე.`
        : "Pro წვდომა აქტიურია დღეიდან.",
    ],
    cta: "გადახედე შენს რუკას",
  },
  extended: {
    subject: "vivida Pro · გახანგრძლივდა",
    preview: "შენი Pro პერიოდი გახანგრძლივდა",
    heading: "Pro პერიოდი გახანგრძლივდა",
    intro: (days) =>
      days
        ? `vivida-მ შენი Pro წვდომა ${days} დღით გახანგრძლივა.`
        : "vivida-მ შენი Pro წვდომა გახანგრძლივა.",
    body: (_days, until) => [
      "მადლობა, რომ vivida-სთან ერთად ხარ. სრული წვდომა — ყოველდღიური ჰოროსკოპი, კვირეული ფორექასტი, სინასტრია — ისევ გაქვს.",
      until ? `ახალი ვადა: ${until}.` : "",
    ].filter(Boolean),
    cta: "გადახედე შენს რუკას",
  },
  revoked: {
    subject: "vivida · Pro წვდომა დასრულდა",
    preview: "შენი Pro წვდომა დასრულდა",
    heading: "Pro წვდომა დასრულდა",
    intro: () =>
      "შენი Pro გამოწერა დასრულდა და ანგარიში უფასო გეგმაზე გადავიდა.",
    body: () => [
      "ბაზისური ფუნქციები შენთან რჩება — ნატარული რუკის შენი დიდი სამეული, ნაწილობრივი დღიური ჰოროსკოპი და პროფილი.",
      "თუ გინდა Pro-ს დაბრუნება, შეგიძლია ნებისმიერ დროს გადახდა გააფორმო.",
    ],
    cta: "ნახე გეგმები",
  },
};

export function subjectFor(kind: SubscriptionEmailKind): string {
  return COPY[kind].subject;
}

export function SubscriptionEmail({
  kind,
  name,
  days,
  periodEndLabel,
  ctaUrl,
}: {
  kind: SubscriptionEmailKind;
  name: string | null;
  /** Whole-day count we want to mention in copy — null hides the number. */
  days: number | null;
  /** Pre-formatted Georgian date string for the period end, or null. */
  periodEndLabel: string | null;
  ctaUrl: string;
}) {
  const c = COPY[kind];
  const greeting = name ? `სალამი, ${name}!` : "სალამი!";
  const paragraphs = c.body(days, periodEndLabel);

  return (
    <EmailLayout preview={c.preview}>
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
        {c.heading}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>{c.intro(days)}</Text>
      {paragraphs.map((p, i) => (
        <Text key={i} style={paragraphStyle}>
          {p}
        </Text>
      ))}

      {c.cta ? (
        <div style={{ marginTop: 16 }}>
          <Button href={ctaUrl} style={buttonStyle}>
            {c.cta}
          </Button>
        </div>
      ) : null}

      <Text style={mutedStyle}>
        კითხვები? უპასუხე ამ წერილს — vivida-ს გუნდი დაგეხმარება.
      </Text>
    </EmailLayout>
  );
}
