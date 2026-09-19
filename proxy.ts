import NextAuth from "next-auth";
import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from "next/server";

import { authConfig } from "@/auth.config";
import { signedInLandingTarget } from "@/lib/landing-redirect";
import { isEnglishHost } from "@/lib/seo/locales";
import {
  internationalInternalPath,
  internationalPublicPath,
} from "@/lib/seo/public-paths";

const { auth } = NextAuth(authConfig);

/**
 * Retired Armenian (`/am`) URLs permanently redirect onto the same path
 * without the prefix, so indexed links and bookmarks keep resolving instead
 * of 404ing. Same-host: the Georgian host renders Georgian, the
 * international host renders English.
 *
 * Returns undefined for every non-Armenian URL, which `auth()` treats as
 * "carry on".
 */
function retiredArmenianRedirect(
  request: NextRequest,
): NextResponse | undefined {
  const { pathname } = request.nextUrl;
  const stripped =
    pathname === "/am"
      ? "/"
      : pathname.startsWith("/am/")
        ? pathname.slice(3)
        : null;
  if (stripped === null) return undefined;
  const target = request.nextUrl.clone();
  target.pathname = stripped;
  return NextResponse.redirect(target, 308);
}

/**
 * Expose English-readable URLs on vividaastro.com while preserving the shared
 * Georgian App Router tree. Legacy public URLs permanently redirect to their
 * clean equivalents; clean URLs are internally rewritten with no extra hop.
 */
function internationalEnglishRouting(
  request: NextRequest,
): NextResponse | undefined {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isEnglishHost(host)) return undefined;

  const { pathname } = request.nextUrl;
  if (pathname === "/am" || pathname.startsWith("/am/")) return undefined;

  const cleanPath = internationalPublicPath(pathname);
  if (cleanPath !== pathname) {
    const target = request.nextUrl.clone();
    target.pathname = cleanPath;
    return NextResponse.redirect(target, 308);
  }

  const internalPath = internationalInternalPath(pathname);
  if (internalPath === pathname) return undefined;
  const destination = request.nextUrl.clone();
  destination.pathname = internalPath;
  return NextResponse.rewrite(destination);
}

/**
 * Send a signed-in visitor from the marketing landing into the app.
 *
 * Runs ahead of the locale rules because language routing is irrelevant once
 * someone is signed in — the interface language of /dashboard is decided by
 * host, which a same-host redirect preserves. The query string is carried
 * over so ref/utm capture in the root layout still sees it.
 */
function signedInLandingRedirect(
  request: NextRequest,
): NextResponse | undefined {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const target = signedInLandingTarget({
    method: request.method,
    pathname: request.nextUrl.pathname,
    searchParams: request.nextUrl.searchParams,
    cookieNames: request.cookies.getAll().map((cookie) => cookie.name),
    englishHost: isEnglishHost(host),
  });
  if (!target) return undefined;

  const destination = request.nextUrl.clone();
  destination.pathname = target;
  // 307, never 308: whether this visitor is signed in is a property of the
  // request, not of the URL, and a cached permanent redirect would follow the
  // browser into signed-out sessions.
  return NextResponse.redirect(destination, 307);
}

const protectedProxy = auth((request) => {
  const req = request as NextRequest;
  return retiredArmenianRedirect(req);
}) as unknown as NextMiddleware;

/**
 * JWT decoding used to run for every SEO page and API request even though the
 * Auth.js authorization callback protects only these two route families.
 * Public traffic now pays only the inexpensive locale routing checks.
 */
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/onboarding") || pathname.startsWith("/dashboard")) {
    return protectedProxy(request, event);
  }
  return (
    signedInLandingRedirect(request) ??
    retiredArmenianRedirect(request) ??
    internationalEnglishRouting(request)
  );
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     *  - api/auth (Auth.js handlers — they manage their own auth)
     *  - api/v1 (mobile API — bearer-token auth + its own CORS, no cookie session)
     *  - _next (static / image)
     *  - public files (favicon, svg, png, etc.)
     */
    "/((?!api/auth|api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
