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
  upgradeEnglishDetailSlug,
  upgradePolishDetailSlug,
} from "@/lib/seo/en-slugs";
import {
  internationalInternalPath,
  internationalPublicPath,
  polishInternalPath,
  polishPublicPath,
} from "@/lib/seo/public-paths";

const { auth } = NextAuth(authConfig);

/**
 * Shared application, auth, and API route prefixes on vividaastro.com that do
 * not carry a `/pl` URL prefix. On these non-indexable/app routes, a visitor
 * whose `vivida_lang` cookie is `"pl"` receives `x-vivida-locale: pl` so they
 * stay in Polish through login, signup, onboarding, dashboard, and API calls.
 */
const SHARED_APP_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/post-login",
  "/unsubscribe",
  "/onboarding",
  "/dashboard",
  "/account",
  "/report",
  "/reports",
  "/synastry",
  "/ask",
  "/credits",
  "/subscription",
  "/feed",
  "/messages",
  "/friends",
  "/people",
  "/discover",
  "/sky",
  "/library",
  "/timing",
  "/test-results",
  "/relationship",
  "/u/",
  "/api/",
  "/mbti",
  "/pirovnebis-testi/claim",
  "/personality-test/claim",
  "/iq-testi/shedegi",
  "/iq-test/shedegi",
  "/eq-testi/shedegi",
  "/eq-test/shedegi",
  "/big-five/shedegi",
] as const;

function isSharedAppPath(pathname: string): boolean {
  return SHARED_APP_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      (prefix.endsWith("/")
        ? pathname.startsWith(prefix)
        : pathname.startsWith(`${prefix}/`)),
  );
}

function forwardSharedPolishLocale(
  request: NextRequest,
): NextResponse | undefined {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isEnglishHost(host)) return undefined;
  if (!isSharedAppPath(request.nextUrl.pathname)) return undefined;
  if (request.cookies.get("vivida_lang")?.value !== "pl") return undefined;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vivida-locale", "pl");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

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

  // Legacy Georgian path → clean English URL, with transliterated detail
  // slugs upgraded to keyword slugs in the same hop
  // (/sizmris-akhsna/gveli → /dream-meanings/snake, not /dream-meanings/gveli).
  const cleanPath = upgradeEnglishDetailSlug(internationalPublicPath(pathname));
  if (cleanPath !== pathname) {
    const target = request.nextUrl.clone();
    target.pathname = cleanPath;
    return NextResponse.redirect(target, 308);
  }

  const internalPath = internationalInternalPath(pathname);
  const hadPolishCookie = request.cookies.get("vivida_lang")?.value === "pl";
  if (internalPath === pathname) {
    if (hadPolishCookie && !isSharedAppPath(pathname)) {
      const response = NextResponse.next();
      response.cookies.set("vivida_lang", "en", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      return response;
    }
    return undefined;
  }
  const destination = request.nextUrl.clone();
  destination.pathname = internalPath;
  const response = NextResponse.rewrite(destination);
  if (hadPolishCookie) {
    response.cookies.set("vivida_lang", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

/**
 * Route Polish URLs under `/pl` on vividaastro.com via internal rewrite to the
 * shared tree, setting `x-vivida-locale: pl` on the rewritten request and
 * `vivida_lang=pl` cookie on the response.
 */
function internationalPolishRouting(
  request: NextRequest,
): NextResponse | undefined {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isEnglishHost(host)) return undefined;

  const { pathname } = request.nextUrl;
  if (pathname !== "/pl" && !pathname.startsWith("/pl/")) return undefined;

  const stripped = pathname === "/pl" ? "/" : pathname.slice(3);
  const cleanPlPath = upgradePolishDetailSlug(polishPublicPath(stripped));
  if (cleanPlPath !== pathname && cleanPlPath.startsWith("/pl")) {
    const target = request.nextUrl.clone();
    target.pathname = cleanPlPath;
    return NextResponse.redirect(target, 308);
  }

  const internalPath = polishInternalPath(pathname);
  const destination = request.nextUrl.clone();
  destination.pathname = internalPath;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vivida-locale", "pl");

  const response = NextResponse.rewrite(destination, {
    request: { headers: requestHeaders },
  });
  response.cookies.set("vivida_lang", "pl", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

/**
 * Send a signed-in visitor from the marketing landing into the app.
 *
 * Runs ahead of the locale rules because language routing is irrelevant once
 * someone is signed in, the interface language of /dashboard is decided by
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
  const response = NextResponse.redirect(destination, 307);
  if (
    request.nextUrl.pathname === "/pl" ||
    request.nextUrl.pathname === "/pl/"
  ) {
    response.cookies.set("vivida_lang", "pl", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

const protectedProxy = auth((request) => {
  const req = request as NextRequest;
  return retiredArmenianRedirect(req) ?? forwardSharedPolishLocale(req);
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
    internationalPolishRouting(request) ??
    forwardSharedPolishLocale(request) ??
    internationalEnglishRouting(request)
  );
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     *  - api/auth (Auth.js handlers, they manage their own auth)
     *  - _next (static / image)
     *  - public files (favicon, svg, png, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
