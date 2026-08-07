import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

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
