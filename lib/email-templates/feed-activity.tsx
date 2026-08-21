import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailLayout,
  buttonStyle,
  mutedStyle,
  paragraphStyle,
} from "./_layout";
import { usesEnglishCopy, type UserLocale } from "@/lib/i18n/locale";

const REACTION_KA: Record<string, string> = {
  like: "მოეწონა შენი პოსტი",
  funny: "გაეცინა შენი პოსტი",
  sad: "დაამწუხრე",
  dislike: "არ მოეწონა შენი პოსტი",
};

const REACTION_EN: Record<string, string> = {
  like: "liked your post",
  funny: "found your post funny",
  sad: "reacted sadly to your post",
  dislike: "disliked your post",
};

/**
 * Feed activity email — comment or reaction on a published post.
 * Fired only when the recipient has been absent from the site for >1h,
 * throttled to one per hour per kind (same gate as friend-request / message).
 */
export function FeedActivityEmail({
  recipientName,
  fromName,
  fromUsername,
  kind,
  preview,
  reaction,
  postUrl,
  unsubscribeUrl,
  locale = "ka",
}: {
  recipientName: string | null;
  fromName: string;
  fromUsername: string | null;
  kind: "post_comment" | "post_reaction";
  /** Comment body preview — already truncated by the caller. */
  preview?: string | null;
  reaction?: string | null;
  postUrl: string;
  unsubscribeUrl: string;
  locale?: UserLocale;
}) {
  const en = usesEnglishCopy(locale);
  const greeting = recipientName
    ? en
      ? `Hello, ${recipientName}!`
      : `სალამი, ${recipientName}!`
    : en
      ? "Hello!"
      : "სალამი!";
  const fromHandle = fromUsername ? `@${fromUsername}` : null;
  const isComment = kind === "post_comment";
  const reactionLine = en
    ? (REACTION_EN[reaction ?? ""] ?? "reacted to your post")
    : (REACTION_KA[reaction ?? ""] ?? "გამოეხმაურა შენს პოსტს");
  const heading = isComment
    ? en
      ? "New comment on your post"
      : "ახალი კომენტარი შენს პოსტზე"
    : en
      ? "New reaction to your post"
      : "ახალი რეაქცია შენს პოსტზე";
  const previewText = isComment
    ? en
      ? `${fromName} commented on your post`
      : `${fromName}-მ შენს პოსტს დააკომენტარა`
    : en
      ? `${fromName} ${reactionLine}`
      : `${fromName} — ${reactionLine}`;

  return (
    <EmailLayout
      preview={previewText}
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
        {heading}
      </Heading>

      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        <strong>{fromName}</strong>
        {fromHandle ? (
          <span style={{ color: "#9b94ad" }}> ({fromHandle})</span>
        ) : null}{" "}
        {isComment
          ? en
            ? " commented on your post on Vivida:"
            : " შენს პოსტს დააკომენტარა Vivida-ზე:"
          : en
            ? ` ${reactionLine} on Vivida.`
            : ` ${reactionLine} Vivida-ზე.`}
      </Text>

      {isComment && preview ? (
        <div
          style={{
            backgroundColor: "#0b0814",
            border: "1px solid rgba(167, 139, 250, 0.18)",
            borderRadius: "12px",
            color: "#e7e3f0",
            fontSize: "15px",
            fontStyle: "italic",
            lineHeight: "22px",
            margin: "0 0 24px",
            padding: "16px 20px",
          }}
        >
          “{preview}”
        </div>
      ) : null}

      <Button href={postUrl} style={buttonStyle}>
        {en ? "View post" : "ნახე პოსტი"}
      </Button>

      <Text style={mutedStyle}>
        {en
          ? "You received this notification because you have not visited Vivida recently."
          : "ეს შეტყობინება მიიღე, რადგან გარკვეული ხნის წინ არ ეწვიე vivida.ge-ს."}
      </Text>
    </EmailLayout>
  );
}
