import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";

import { authConfig } from "@/auth.config";
import {
  LOCALE_HEADER,
  isArmenianCoreRoute,
  stripArmenianPrefix,
} from "@/lib/i18n/armenian-routes";
import { ENGLISH_SITE_URL, isEnglishHost } from "@/lib/seo/locales";

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
  const stripped = stripArmenianPrefix(pathname);
  if (stripped === null) return undefined;

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

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, "am");

  // Core routes have real files under app/am/** (mirroring app/en/**) and keep
  // English slugs, so there is nothing to rewrite them onto — /am/natal-chart
  // would strip to /natal-chart, which exists only under app/en.
  if (isArmenianCoreRoute(stripped)) {
    return NextResponse.next({ request: { headers } });
  }

  const destination = request.nextUrl.clone();
  destination.pathname = stripped;
  return NextResponse.rewrite(destination, { request: { headers } });
}

export default auth((request) => armenianRouting(request as NextRequest));

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
