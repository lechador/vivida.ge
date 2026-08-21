import NextAuth from "next-auth";
import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from "next/server";

import { authConfig } from "@/auth.config";
import {
  LOCALE_CHOICE_COOKIE,
  LOCALE_HEADER,
  countryFromGeoHeaders,
  hasArmenianVersion,
  isArmenianCoreRoute,
  isCrawler,
  stripArmenianPrefix,
  withArmenianPrefix,
} from "@/lib/i18n/armenian-routes";
import { ENGLISH_SITE_URL, isEnglishHost } from "@/lib/seo/locales";
import {
  internationalInternalPath,
  internationalPublicPath,
} from "@/lib/seo/public-paths";

const { auth } = NextAuth(authConfig);

/**
 * Resolve the Armenian `/am` prefix into a locale the app can read.
 *
 * Georgian and English are told apart by Host, which reaches server components
 * untouched. Armenian is told apart by a path prefix, and the pathname is gone
 * by the time a server component runs — so the prefix is converted here into a
 * request header, and (for the long tail) the request is rewritten onto the
 * shared route tree so one page file serves all three languages.
 *
 * Returns undefined for every non-Armenian URL, which `auth()` treats as
 * "carry on" — the protected-route redirect in `authConfig.authorized` has
 * already run by this point and wins outright if it fired.
 */
function armenianRouting(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;
  const strippedPublic = stripArmenianPrefix(pathname);
  if (strippedPublic === null) return undefined;

  // The Armenian site belongs to the international domain. Serving it from
  // vivida.ge too would publish every Armenian page at a second URL competing
  // with the first — the same duplication ENGLISH_LEGACY_CONTENT_REDIRECTS
  // exists to prevent, in the other direction.
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isEnglishHost(host)) {
    const target = new URL(
      `${pathname}${request.nextUrl.search}`,
      ENGLISH_SITE_URL,
    );
    return NextResponse.redirect(target, 308);
  }

  const cleanPath = internationalPublicPath(strippedPublic);
  if (cleanPath !== strippedPublic) {
    const target = request.nextUrl.clone();
    target.pathname = withArmenianPrefix(cleanPath);
    const response = NextResponse.redirect(target, 308);
    rememberLanguageChoice(response, "am");
    return response;
  }

  const stripped = internationalInternalPath(strippedPublic);

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, "am");

  // Core routes have real files under app/am/** (mirroring app/en/**) and keep
  // English slugs, so there is nothing to rewrite them onto — /am/natal-chart
  // would strip to /natal-chart, which exists only under app/en.
  const response = isArmenianCoreRoute(stripped)
    ? NextResponse.next({ request: { headers } })
    : (() => {
        const destination = request.nextUrl.clone();
        destination.pathname = stripped;
        return NextResponse.rewrite(destination, { request: { headers } });
      })();

  // Reaching Armenian counts as being placed in a language space, so the geo
  // redirect below never fires afterwards. This is what lets the language
  // switcher escape to English and stay there.
  rememberLanguageChoice(response, "am");
  return response;
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
  if (stripArmenianPrefix(pathname) !== null) return undefined;

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
 * Send visitors browsing from Armenia to the Armenian version.
 *
 * Deliberately conservative, because an over-eager geo redirect damages the
 * index far more than it helps a reader:
 *  - never for crawlers, and never a 301 — the correct URL for a given reader
 *    is a preference, not a permanent move;
 *  - only for real HTML navigations, so RSC and asset requests are untouched;
 *  - only where an Armenian page actually exists, so it can never redirect
 *    into a 404 (this also excludes the authed app and API, which are not in
 *    the Armenian route registry);
 *  - at most once per browser, so anyone who switches back to English stays
 *    there.
 */
function armenianGeoRedirect(request: NextRequest): NextResponse | undefined {
  if (request.method !== "GET") return undefined;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isEnglishHost(host)) return undefined;

  const { pathname } = request.nextUrl;
  if (stripArmenianPrefix(pathname) !== null) return undefined;
  if (request.cookies.get(LOCALE_CHOICE_COOKIE)) return undefined;
  if (!(request.headers.get("accept") ?? "").includes("text/html")) {
    return undefined;
  }
  if (isCrawler(request.headers.get("user-agent"))) return undefined;
  if (countryFromGeoHeaders(request.headers) !== "AM") return undefined;
  if (!hasArmenianVersion(pathname)) return undefined;

  const target = request.nextUrl.clone();
  target.pathname = withArmenianPrefix(pathname);
  const response = NextResponse.redirect(target, 307);
  rememberLanguageChoice(response, "am");
  return response;
}

function rememberLanguageChoice(response: NextResponse, value: string): void {
  response.cookies.set(LOCALE_CHOICE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
}

const protectedProxy = auth((request) => {
  const req = request as NextRequest;
  return armenianRouting(req) ?? armenianGeoRedirect(req);
}) as unknown as NextMiddleware;

/**
 * JWT decoding used to run for every SEO page and API request even though the
 * Auth.js authorization callback protects only these two route families.
 * Public traffic now pays only the inexpensive locale routing checks.
 */
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/dashboard")
  ) {
    return protectedProxy(request, event);
  }
  return (
    armenianRouting(request) ??
    internationalEnglishRouting(request) ??
    armenianGeoRedirect(request)
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
