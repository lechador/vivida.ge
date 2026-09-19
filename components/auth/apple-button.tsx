"use client";

import { useTransition } from "react";

import { signInWithApple } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

/** Sign in with Apple for the shared web login and signup surfaces. */
export function AppleButton({
  callbackUrl = "/post-login",
  label,
  locale = "ka",
}: {
  callbackUrl?: string;
  label?: string;
  locale?: UserLocale;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          trackEvent(ANALYTICS_EVENT.signUpAppleClick, { method: "apple" });
          await signInWithApple(callbackUrl);
        })
      }
      className="w-full bg-black text-white hover:bg-black/85"
    >
      <AppleGlyph />
      {isPending
        ? locale !== "ka"
          ? "Connecting…"
          : "ვაკავშირდებით…"
        : (label ??
          (locale !== "ka" ? "Continue with Apple" : "შემოდი Apple-ით"))}
    </Button>
  );
}

function AppleGlyph() {
  return (
    <svg
      width="18"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.38-.07 2.34.76 3.15.82 1.21-.24 2.37-.93 3.67-.84 1.56.12 2.73.74 3.51 1.86-3.22 1.93-2.45 6.18.5 7.37-.59 1.55-1.36 3.09-2.83 3.76ZM12.03 7.25C11.88 4.95 13.74 3.05 15.88 3c.3 2.66-2.42 4.65-3.85 4.25Z" />
    </svg>
  );
}
