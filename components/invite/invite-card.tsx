"use client";

import { useState } from "react";
import { Check, Copy, Share2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { REFERRAL_REWARD } from "@/lib/credits-config";

import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Invite panel — the credit-earning growth loop's UI. Shows the user's personal
 * link, a copy/share affordance, and their referral progress.
 */
export function InviteCard({
  link,
  invited,
  qualified,
  locale,
}: {
  link: string;
  invited: number;
  qualified: number;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    const text = en
      ? "Join me on Vivida for your birth chart, compatibility readings, and personality tests 🔮"
      : "შემომიერთდი Vivida-ზე — შენი კოსმიური რუკა, თავსებადობა და ტესტები 🔮";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Vivida", text, url: link });
      } else {
        await copy();
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="rounded-3xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/12 to-[var(--vivida-cyan)]/12 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Users className="size-4 text-[var(--vivida-violet)]" />
        {en ? "Invite friends" : "მოიწვიე მეგობრები"}
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        {en ? "Earn for every friend " : "თითო მეგობარზე "}
        <span className="text-[var(--vivida-cyan)]">
          +{REFERRAL_REWARD} {en ? "credits" : "კრედიტი"}
        </span>
      </h2>
      <p className="mt-1 max-w-md text-sm text-foreground/80">
        {en
          ? `Share your link. When your friend signs up and adds their birth details, you receive ${REFERRAL_REWARD} credits.`
          : `გაუზიარე ლინკი. როცა მოწვეული დარეგისტრირდება და შეავსებს დაბადების მონაცემებს, შენ იღებ ${REFERRAL_REWARD} კრედიტს.`}
      </p>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background/50 p-1.5 pl-4">
        <span className="min-w-0 flex-1 truncate text-sm text-foreground/85">
          {link}
        </span>
        <Button
          type="button"
          variant={copied ? "outline" : "mystic"}
          onClick={copy}
          className="gap-1.5"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? (en ? "Copied" : "დაკოპირდა") : en ? "Copy" : "კოპირება"}
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={share}
          className="gap-1.5"
        >
          <Share2 className="size-4" />
          {en ? "Share" : "გაზიარება"}
        </Button>
        <div className="ml-auto flex gap-5 text-sm">
          <div>
            <div className="font-semibold tabular-nums">{invited}</div>
            <div className="text-xs text-muted-foreground">
              {en ? "Invited" : "მოწვეული"}
            </div>
          </div>
          <div>
            <div className="font-semibold tabular-nums text-[var(--vivida-cyan)]">
              {qualified}
            </div>
            <div className="text-xs text-muted-foreground">
              {en ? "Activated" : "გააქტიურდა"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
