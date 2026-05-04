"use client";

import { useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

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
}: {
  onChange: (token: string | null) => void;
  className?: string;
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
          language: "ka",
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
