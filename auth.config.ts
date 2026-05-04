import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe NextAuth config.
 *
 * Used by middleware (Edge runtime) where the Drizzle adapter cannot run.
 * The full config in `auth.ts` extends this with the adapter for the
 * Node runtime route handler.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isProtected =
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/dashboard");

      if (isProtected && !isLoggedIn) {
        const url = new URL("/", request.nextUrl);
        url.searchParams.set("from", pathname);
        return Response.redirect(url);
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
