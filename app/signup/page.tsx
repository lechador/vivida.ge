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
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale !== "ka" ? "Create an account" : "რეგისტრაცია",
    // Same-path language pair — see the note in app/login/page.tsx.
    alternates: localizedAlternates(
      "/signup",
      "/signup",
      locale !== "ka" ? "en" : "ka",
    ),
  };
}

/** Same-origin relative path only (no open redirect). */
function safeNext(v: string | undefined): string | null {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : null;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = safeNext(next);
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const session = await auth();
  if (session?.user?.id) redirect(dest ?? "/dashboard");

  const loginHref = dest ? `/login?next=${encodeURIComponent(dest)}` : "/login";

  return (
    <AuthLayout
      locale={locale}
      title={en ? "Create your account" : "შექმენი შენი ანგარიში"}
      subtitle={
        en
          ? "It takes a minute—your cosmos is waiting."
          : "ერთ წუთში — შენი კოსმოსი გელოდება."
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
      <div className="space-y-3">
        <GoogleButton
          locale={locale}
          label={en ? "Sign up with Google" : "რეგისტრაცია Google-ით"}
          callbackUrl={dest ?? "/dashboard"}
        />
        <AppleButton
          locale={locale}
          label={en ? "Sign up with Apple" : "რეგისტრაცია Apple-ით"}
          callbackUrl={dest ?? "/dashboard"}
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
