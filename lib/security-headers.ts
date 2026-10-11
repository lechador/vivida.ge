/**
 * Security headers for the English host (vividaastro.com) — the Privy
 * production surface.
 *
 * Privy's production checklist requires a strict Content Security Policy
 * plus framing protections. Their own deployment guide says to ship the
 * policy in Report-Only mode first, validate, then enforce — so this module
 * builds the full Privy-recommended policy (plus this app's own sources:
 * GA4, Meta Pixel, Solana RPC, Turnstile, Sentry, R2/owned imagery) as
 * `Content-Security-Policy-Report-Only`, while `X-Frame-Options: DENY`
 * enforces the no-framing rule immediately (nothing in the app expects to
 * be framed — verified: zero first-party `<iframe>` usages).
 *
 * Scoped to the English hosts on purpose: the Georgian host keeps Stripe,
 * whose `js.stripe.com` frames/scripts are deliberately NOT in this policy.
 * When the report-only policy is validated, flip
 * `ENGLISH_CSP_REPORT_ONLY` to the enforcing header name below.
 *
 * Pure module (no `@/db` import) so the policy string is unit-testable.
 */

export const ENGLISH_CSP_REPORT_ONLY = true;

/** Inbound framing is never legitimate for either site surface. */
export const X_FRAME_OPTIONS = "DENY";

/**
 * Privy's recommended base directives for `@privy-io/react-auth`:
 * the auth iframe, WalletConnect relay/verify endpoints, and the Privy
 * RPC provider. See `docs.privy.io/security/implementation-guide/
 * content-security-policy`.
 */
const PRIVY_CHILD_SRC = [
  "https://auth.privy.io",
  "https://verify.walletconnect.com",
  "https://verify.walletconnect.org",
];

const PRIVY_FRAME_SRC = [
  ...PRIVY_CHILD_SRC,
  // Cloudflare Turnstile widget (login/signup hardening).
  "https://challenges.cloudflare.com",
];

const PRIVY_CONNECT_SRC = [
  "https://auth.privy.io",
  "wss://relay.walletconnect.com",
  "wss://relay.walletconnect.org",
  "wss://www.walletlink.org",
  "https://*.rpc.privy.systems",
  "https://explorer-api.walletconnect.com",
];

/**
 * This app's own client-side sources on the English host.
 *
 * NOTE: `NEXT_PUBLIC_SOLANA_RPC_URL` is operator-configurable. The default
 * public cluster endpoint is allowlisted here; if a custom RPC host is set
 * (e.g. Helius), its https:// origin (and wss:// for subscriptions) must be
 * appended to `connect-src` before enforcing, or wallet balance reads and
 * transaction polling will be blocked.
 */
const APP_SCRIPT_SRC = [
  // GA4 via @next/third-parties/google (consent-gated).
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  // Meta Pixel bootstrap (consent-gated).
  "https://connect.facebook.net",
];

const APP_CONNECT_SRC = [
  // Solana cluster reads/writes from the payment dialog (default endpoint;
  // see NOTE above for custom RPC hosts).
  "https://api.mainnet-beta.solana.com",
  "wss://api.mainnet-beta.solana.com",
  // GA4 + Meta Pixel event transport (consent-gated).
  "https://www.google-analytics.com",
  "https://www.facebook.com",
  // Browser error reporting (only loads when NEXT_PUBLIC_SENTRY_DSN is set).
  "https://*.ingest.sentry.io",
];

const APP_IMG_SRC = [
  // next/image remotePatterns: R2 art, Wikimedia fallback, Google avatars,
  // own-domain absolute URLs.
  "https://*.r2.dev",
  "https://*.r2.cloudflarestorage.com",
  "https://upload.wikimedia.org",
  "https://lh3.googleusercontent.com",
  "https://lh4.googleusercontent.com",
  "https://lh5.googleusercontent.com",
  "https://lh6.googleusercontent.com",
  "https://www.vivida.ge",
  "https://www.vividaastro.com",
  // Meta Pixel image fallback transport.
  "https://www.facebook.com",
];

/**
 * The full policy, single-line (multi-line header values are legal but
 * brittle across proxies — join to one line at the boundary).
 */
export function englishCspPolicy(): string {
  return [
    "default-src 'self'",
    [
      "script-src",
      "'self'",
      "https://challenges.cloudflare.com",
      ...APP_SCRIPT_SRC,
    ].join(" "),
    "style-src 'self' 'unsafe-inline'",
    ["img-src", "'self'", "data:", "blob:", ...APP_IMG_SRC].join(" "),
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ["child-src", ...PRIVY_CHILD_SRC].join(" "),
    ["frame-src", ...PRIVY_FRAME_SRC].join(" "),
    ["connect-src", "'self'", ...PRIVY_CONNECT_SRC, ...APP_CONNECT_SRC].join(
      " ",
    ),
    "worker-src 'self'",
    "manifest-src 'self'",
  ].join("; ");
}

/** Header name while validating, enforcing name once validated. */
export function englishCspHeaderName(): string {
  return ENGLISH_CSP_REPORT_ONLY
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";
}

/** The `{ key, value }` pairs next.config's `headers()` spreads in. */
export function englishSecurityHeaders(): Array<{
  key: string;
  value: string;
}> {
  return [
    { key: "X-Frame-Options", value: X_FRAME_OPTIONS },
    { key: englishCspHeaderName(), value: englishCspPolicy() },
  ];
}
