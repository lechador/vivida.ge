import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppleButton } from "@/components/auth/apple-button";
import { AuthDivider, AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { localizedAlternates } from "@/lib/seo/locales";
import { normalizeReturnPath } from "@/lib/safe-return-path";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale !== "ka" ? "Create an account" : "რეგისტრაცია",
    // Auth utility page, keep it crawlable for link equity but out of the
    // index (thin copy was indexable on both hosts).
    robots: { index: false, follow: true },
    // Same-path language pair, see the note in app/login/page.tsx.
    alternates: localizedAlternates(
      "/signup",
      "/signup",
      locale !== "ka" ? "en" : "ka",
    ),
  };
}

function safeNext(v: string | undefined): string | null {
  return v ? normalizeReturnPath(v, "") || null : null;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const dest = safeNext(next);
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const session = await auth();
  if (session?.user?.id)
    redirect(
      dest ? `/post-login?next=${encodeURIComponent(dest)}` : "/post-login",
    );

  const loginHref = dest ? `/login?next=${encodeURIComponent(dest)}` : "/login";

  return (
    <AuthLayout
      locale={locale}
      title={en ? "Create your account" : "შექმენი შენი ანგარიში"}
      subtitle={
        en
          ? "It takes a minute, your cosmos is waiting."
          : "ერთ წუთში, შენი კოსმოსი გელოდება."
      }
      footer={
        <>
          {en ? "Already have an account?" : "უკვე გაქვს ანგარიში?"}{" "}
          <Link
            href={loginHref}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {en ? "Sign in" : "შესვლა"}
          </Link>
        </>
      }
    >
      {(error === "duplicate_registration" ||
        error === "signup_rate_limited" ||
        error === "oauth_email_unverified") && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error === "oauth_email_unverified"
            ? en
              ? "Your Google or Apple account has no verified email address. Verify it with the provider, then try again."
              : "Google-ის ან Apple-ის ანგარიშს დადასტურებული ელფოსტა არ აქვს. დაადასტურე ის პროვაიდერთან და სცადე ხელახლა."
            : error === "duplicate_registration"
              ? en
                ? "This registration needs review. Try signing in to your existing account or contact support."
                : "ამ მონაცემებით რეგისტრაცია დამატებით შემოწმებას საჭიროებს. სცადე არსებულ ანგარიშში შესვლა ან მოგვწერე მხარდაჭერას."
              : en
                ? "Too many new accounts from this connection. Please try again later."
                : "ამ კავშირიდან ძალიან ბევრი ახალი ანგარიში შეიქმნა. სცადე მოგვიანებით."}
        </p>
      )}
      <div className="space-y-3">
        <GoogleButton
          locale={locale}
          label={en ? "Sign up with Google" : "რეგისტრაცია Google-ით"}
          callbackUrl={
            dest
              ? `/post-login?next=${encodeURIComponent(dest)}`
              : "/post-login"
          }
        />
        <AppleButton
          locale={locale}
          label={en ? "Sign up with Apple" : "რეგისტრაცია Apple-ით"}
          callbackUrl={
            dest
              ? `/post-login?next=${encodeURIComponent(dest)}`
              : "/post-login"
          }
        />
      </div>
      <AuthDivider locale={locale} />
      {/* useSearchParams in SignupForm requires a Suspense boundary. */}
      <Suspense fallback={null}>
        <SignupForm locale={locale} />
      </Suspense>
    </AuthLayout>
  );
}
