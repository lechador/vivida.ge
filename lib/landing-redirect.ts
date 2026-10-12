/**
 * Signed-in visitors belong in the app, not on the marketing landing.
 *
 * Typing "vivida.ge" is how most returning users open the product, and the
 * bare domain used to serve them the cold-traffic landing page, brand copy,
 * a signup CTA and a "შესვლა" button, for someone who is already signed in.
 *
 * The decision lives here as a pure function for two reasons: it runs in the
 * proxy (Edge) where the Auth.js adapter cannot, and it is the kind of rule
 * that is far easier to unit-test than to reproduce in a browser.
 */

/** Where a signed-in visitor is sent instead of the landing page. */
export const APP_HOME = "/dashboard";

/**
 * The landing page is the one route that exists per language: Georgian at `/`
 * on vivida.ge, English at `/` on vividaastro.com, Armenian at `/am` on the
 * same international host. `/en` is never a landing, the Georgian host 301s
 * it to the international domain and the international host only reaches it
 * through an internal rewrite, which happens after the proxy has run.
 */
function isLandingPath(pathname: string, englishHost: boolean): boolean {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  if (path === "/") return true;
  // On vivida.ge the Armenian prefix is 308'd to the international domain
  // first; that redirect lands on the English host, where this check fires.
  // Short-circuiting it here would drop an Armenian reader into the Georgian
  // app, since the interface language is decided by host.
  return englishHost && path === "/am";
}

/**
 * True when a session cookie is present, deliberately *not* a proof of a
 * valid session.
 *
 * Decoding the JWT here would put crypto back on the site's highest-traffic
 * public page, which is exactly what the proxy's route split removed. A stale
 * or expired cookie therefore sends one wasted hop to /dashboard, whose own
 * auth check bounces back to `/?from=/dashboard`, and the `from` guard below
 * stops that from becoming a loop.
 */
function hasSessionCookie(cookieNames: readonly string[]): boolean {
  return cookieNames.some((name) => name.includes("authjs.session-token"));
}

/**
 * Returns the path a signed-in visitor should be sent to, or null to render
 * the landing page as usual.
 */
export function signedInLandingTarget(request: {
  method: string;
  pathname: string;
  searchParams: URLSearchParams;
  cookieNames: readonly string[];
  englishHost: boolean;
}): string | null {
  if (request.method !== "GET") return null;
  if (!isLandingPath(request.pathname, request.englishHost)) return null;
  // `authConfig.authorized` bounces an unauthenticated visitor from a
  // protected route to `/?from=<route>`. With a cookie that no longer decodes,
  // redirecting that request back to /dashboard would ping-pong forever.
  if (request.searchParams.has("from")) return null;
  if (!hasSessionCookie(request.cookieNames)) return null;
  return APP_HOME;
}
