"use client";

import { useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Thin wrapper around @marsidev/react-turnstile that:
 *  - uses the site key from NEXT_PUBLIC_TURNSTILE_SITE_KEY
 *  - matches the brand dark theme
 *  - reports the token via onChange (null on expire/error so callers can
 *    re-disable their submit button)
 *  - exposes a reset() handle the caller can invoke after a failed submit
 *    so the user gets a fresh challenge automatically
 *
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset we render nothing — keeps
 * local dev usable without a Cloudflare account.
 */
export function TurnstileWidget({
  onChange,
  className,
  locale = "ka",
}: {
  onChange: (token: string | null) => void;
  className?: string;
  locale?: UserLocale;
}) {
  const ref = useRef<TurnstileInstance | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) return null;

  return (
    <div className={className}>
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        options={{
          theme: "dark",
          size: "flexible",
          language: locale,
        }}
        onSuccess={(token) => onChange(token)}
        onExpire={() => {
          onChange(null);
          ref.current?.reset();
        }}
        onError={() => onChange(null)}
      />
    </div>
  );
}
