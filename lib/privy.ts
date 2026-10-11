/**
 * Server-side Privy configuration.
 *
 * The browser SDK (`NEXT_PUBLIC_PRIVY_APP_ID`) drives the wallet UI — login,
 * embedded wallet creation, and one-tap USDC transfers. `PRIVY_APP_SECRET` is
 * the server credential for Privy's REST API (treasury / wallet operations).
 *
 * The crypto rail stays dark unless both are configured; nothing here ever
 * reaches the client bundle.
 */

export function isPrivyConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim() &&
    process.env.PRIVY_APP_SECRET?.trim(),
  );
}

export function privyAppId(): string | null {
  return process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim() || null;
}
