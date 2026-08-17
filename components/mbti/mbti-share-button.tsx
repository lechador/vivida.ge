"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Share the result. Uses the native share sheet where available (mobile),
 * otherwise copies the public share link to the clipboard. The link points at
 * the public /r/[id] page, which unfurls with a generated social card.
 */
import type { UserLocale } from "@/lib/i18n/user-locale";

export function MbtiShareButton({
  path,
  type,
  archetype,
  locale = "ka",
}: {
  path: string; // e.g. "/r/<id>"
  type: string;
  archetype: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin + path : path;
    const text = en
      ? `My personality type is ${type} — ${archetype}. Take the test on Vivida:`
      : `ჩემი ფსიქოლოგიური ტიპია ${type} — ${archetype}. გაიარე ტესტი Vivida-ზე:`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Vivida · Astro-MBTI", text, url });
        return;
      } catch {
        /* user cancelled or unsupported — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <Button type="button" variant="mystic" onClick={share} className="gap-2">
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? (am ? "Հղումը պատճենված է" : en ? "Link copied" : "ბმული დაკოპირდა") : (am ? "Կիսվել" : en ? "Share" : "გააზიარე")}
    </Button>
  );
}
