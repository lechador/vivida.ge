import { Button, Heading, Hr, Section, Text } from "@react-email/components";

import { EmailLayout, buttonStyle, paragraphStyle } from "./_layout";

/**
 * Birthday email, a celebration, not a promo. The person is the centerpiece:
 * festive centered opening, warm AI-written body, a heartfelt sign-off from
 * the team… and the +1 month gift demoted to a quiet P.S. at the very bottom.
 * Transactional (once a year), so no unsubscribe link, like welcome.
 */
export function BirthdayEmail({
  name,
  paragraphs,
  dashboardUrl,
  showGift = true,
}: {
  name: string | null;
  paragraphs: string[];
  dashboardUrl: string;
  showGift?: boolean;
}) {
  return (
    <EmailLayout preview="დღეს შენი დღეა, და მთელი ცა ამას აღნიშნავს ✨">
      {/* Festive opening, centered, big, personal */}
      <Section style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <Text
          style={{
            fontSize: "44px",
            lineHeight: "52px",
            margin: "0 0 8px",
          }}
        >
          🎂✨🎉
        </Text>
        <Heading
          as="h1"
          style={{
            color: "#ffffff",
            fontSize: "30px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: "38px",
            margin: "0 0 10px",
          }}
        >
          გილოცავ{name ? `, ${name}` : ""}!
        </Heading>
        <Text
          style={{
            color: "#c4b5fd",
            fontSize: "16px",
            lineHeight: "24px",
            margin: "0 0 4px",
          }}
        >
          დღეს შენი დღეა, და მთელი ცა ამას აღნიშნავს
        </Text>
      </Section>

      {/* Star divider */}
      <Text
        style={{
          color: "#a78bfa",
          fontSize: "14px",
          letterSpacing: "12px",
          margin: "18px 0",
          textAlign: "center",
        }}
      >
        ✦&nbsp;✦&nbsp;✦
      </Text>

      {/* Warm AI-written body */}
      {paragraphs.map((p, i) => (
        <Text
          key={i}
          style={{
            ...paragraphStyle,
            fontSize: "16px",
            lineHeight: "26px",
          }}
        >
          {p}
        </Text>
      ))}

      {/* Heartfelt sign-off, the team, by name, celebrating them */}
      <Text
        style={{
          ...paragraphStyle,
          fontSize: "16px",
          lineHeight: "26px",
          margin: "20px 0 6px",
        }}
      >
        გმადლობთ, რომ ვივიდას ვარსკვლავებქვეშ ხარ, შენნაირი ადამიანების გამო
        ვაკეთებთ ამ საქმეს.
      </Text>
      <Text
        style={{
          color: "#f0abfc",
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "24px",
          margin: "0 0 22px",
        }}
      >
        სითბოთი და აღფრთოვანებით, Vivida-ს გუნდი ❤️
      </Text>

      <Section style={{ textAlign: "center", padding: "4px 0 8px" }}>
        <Button href={dashboardUrl} style={buttonStyle}>
          ნახე, რას გპირდება დღეს შენი ცა
        </Button>
      </Section>

      {/* The gift, a quiet P.S., deliberately not the headline (omitted for PRO users) */}
      {showGift ? (
        <>
          <Hr
            style={{
              borderColor: "rgba(167, 139, 250, 0.18)",
              margin: "22px 0 14px",
            }}
          />
          <Text
            style={{
              color: "#8d82a6",
              fontSize: "13px",
              lineHeight: "21px",
              margin: 0,
            }}
          >
            P.S. პატარა საჩუქარი ჩვენგან: შენს ბალანსს დაბადების დღის
            საპატივცემულოდ{" "}
            <span style={{ color: "#eac358", fontWeight: 600 }}>
              10 კრედიტი
            </span>{" "}
            დაემატა, უკვე შენია, არაფერი გჭირდება. 🎁
          </Text>
        </>
      ) : null}
    </EmailLayout>
  );
}
