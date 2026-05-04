import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    /*
     * Match all routes except:
     *  - api/auth (Auth.js handlers — they manage their own auth)
     *  - api/flitt (payment webhooks — no session, signature-verified instead)
     *  - _next (static / image)
     *  - public files (favicon, svg, png, etc.)
     */
    "/((?!api/auth|api/flitt|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
