import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { authConfig } from "@/auth.config";
import { onUserSignedUp } from "@/lib/referral";
import { ensureUsername } from "@/lib/username";
import { headers } from "next/headers";
import {
  countryCodeFromHeaders,
  setResidenceCountryIfMissing,
} from "@/lib/residence";
import { getSignupLocale } from "@/lib/i18n/request-locale";
import { clientIpFromHeaders } from "@/lib/api/security";
import { checkNewSignup, hashSignupIp } from "@/lib/signup-abuse";

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
  callbacks: {
    ...authConfig.callbacks,
    // Auth.js calls signIn before the adapter inserts a new OAuth user. Keep
    // existing provider accounts and email-linked accounts free to sign in;
    // only a genuinely new identity consumes the signup abuse allowance.
    async signIn({ user, account }) {
      if (account?.type !== "oauth" && account?.type !== "oidc") return true;

      const [linked] = await db
        .select({ userId: accounts.userId })
        .from(accounts)
        .where(
          and(
            eq(accounts.provider, account.provider),
            eq(accounts.providerAccountId, account.providerAccountId),
          ),
        )
        .limit(1);
      if (linked) return true;

      const email = user.email?.trim() ?? null;
      if (!email) return "/signup?error=duplicate_registration";
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existing) return true;

      const signupCheck = await checkNewSignup({
        ip: clientIpFromHeaders(await headers()),
        name: user.name,
        email,
      });
      if (!signupCheck.allowed) {
        return `/signup?error=${
          signupCheck.reason === "duplicate"
            ? "duplicate_registration"
            : "signup_rate_limited"
        }`;
      }
      return true;
    },
  },
  events: {
    // Stamp users.lastLoginAt on every successful sign-in. Wrapped so a
    // transient DB blip can never break the auth flow itself — losing one
    // last-login update is much better than refusing the login.
    async signIn({ user }) {
      if (!user?.id) return;
      try {
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));
      } catch (err) {
        console.warn(
          "[auth.signIn] failed to update lastLoginAt:",
          (err as Error).message,
        );
      }
    },
    // Web Google/Apple sign-ups are created by the DrizzleAdapter (not our
    // registerUser/findOrCreateOAuthUser paths), so this is the ONLY hook that
    // fires for them. Without it, adapter-created users never received the
    // signup bonus or referral attribution. onUserSignedUp is idempotent
    // (earnOnce) + best-effort, so it can't double-grant or break the callback.
    async createUser({ user }) {
      if (!user?.id) return;
      // The adapter inserts OAuth users; attach a keyed IP hash before the
      // signup bonus so the next new-account check can see this signup.
      try {
        const signupIpHash = hashSignupIp(clientIpFromHeaders(await headers()));
        if (signupIpHash) {
          await db
            .update(users)
            .set({ signupIpHash })
            .where(eq(users.id, user.id));
        }
      } catch (err) {
        console.warn(
          "[auth.createUser] signup IP stamp failed:",
          (err as Error).message,
        );
      }
      // Adapter-created users are OAuth sign-ups (our credentials flow
      // creates users itself, gated on email verification). Google asserts
      // email_verified, but NextAuth's default profile mapping doesn't stamp
      // emailVerified — do it here so these accounts count as verified and any
      // verification-keyed logic (metrics, future gates) is correct.
      try {
        await db
          .update(users)
          .set({ emailVerified: new Date() })
          .where(and(eq(users.id, user.id), isNull(users.emailVerified)));
      } catch (err) {
        console.warn(
          "[auth.createUser] emailVerified stamp failed:",
          (err as Error).message,
        );
      }
      try {
        const requestHeaders = await headers();
        await setResidenceCountryIfMissing(
          user.id,
          countryCodeFromHeaders(requestHeaders),
        );
      } catch (err) {
        console.warn(
          "[auth.createUser] residence country stamp failed:",
          (err as Error).message,
        );
      }
      // Only the credentials flow passes a locale (actions/auth.ts), so a Google
      // sign-up on the English domain would keep the 'ka' schema default — and
      // every email/push reads that column, not the host. Guarded on the default
      // so a later /account choice is never overwritten.
      try {
        // getSignupLocale, not the host: Armenian is a path prefix and OAuth
        // returns to a shared callback, so the host reports "English" for an
        // Armenian sign-up. The vivida_lang cookie is what survives the round
        // trip through Google.
        const signupLocale = await getSignupLocale();
        if (signupLocale !== "ka") {
          await db
            .update(users)
            .set({ interfaceLanguage: signupLocale })
            .where(
              and(eq(users.id, user.id), eq(users.interfaceLanguage, "ka")),
            );
        }
      } catch (err) {
        console.warn(
          "[auth.createUser] interface language stamp failed:",
          (err as Error).message,
        );
      }
      try {
        await onUserSignedUp(user.id);
      } catch (err) {
        console.warn(
          "[auth.createUser] signup bonus failed:",
          (err as Error).message,
        );
      }
      // Assign the username here too — the adapter creates these users, so
      // registerUser/findOrCreateOAuthUser never run for them. Without it a
      // web Google sign-up who skips onboarding has no profile row at all and
      // is invisible in /people, site search and @mentions. See lib/username.ts.
      try {
        await ensureUsername(user.id, user.name ?? null);
      } catch (err) {
        console.warn(
          "[auth.createUser] username assignment failed:",
          (err as Error).message,
        );
      }
    },
  },
});
