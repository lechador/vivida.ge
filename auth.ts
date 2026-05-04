import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { authConfig } from "@/auth.config";
import { provisionTrialIfMissing } from "@/lib/plan";

/**
 * Credentials provider for the email/password login flow. Lives in
 * auth.ts (not auth.config.ts) because the authorize callback hits the
 * database — the Edge runtime that imports auth.config for middleware
 * never needs to instantiate this provider.
 *
 * Sign-up itself (creating the user + sending the verification email) is
 * handled by `actions/auth.ts signUpWithEmail`. This provider only
 * verifies an existing email/password pair.
 */
const credentialsProvider = Credentials({
  name: "Email",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(raw) {
    const email =
      typeof raw?.email === "string" ? raw.email.trim().toLowerCase() : null;
    const password = typeof raw?.password === "string" ? raw.password : null;
    if (!email || !password) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Don't leak which side failed (email vs. password) — uniform null.
    if (!user || !user.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    // Require email verification before allowing login. Throwing a CredentialsSignin
    // with a known message lets the /login page render an actionable error.
    if (!user.emailVerified) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [...authConfig.providers, credentialsProvider],
  events: {
    /**
     * Fired exactly once when the Drizzle adapter inserts a new user row
     * (i.e. the very first Google sign-in). We use it to grant the new
     * account a 60-day Pro trial up-front — no card capture, no friction.
     * Errors are swallowed inside provisionTrialIfMissing so a transient
     * Neon hiccup can't block sign-in.
     *
     * Note: this event does NOT fire for the email/password flow because
     * Credentials provider bypasses the adapter. `signUpWithEmail` calls
     * provisionTrialIfMissing directly after inserting the user.
     */
    async createUser({ user }) {
      if (user.id) await provisionTrialIfMissing(user.id);
    },
  },
});
