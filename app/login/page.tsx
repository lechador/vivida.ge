import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppleButton } from "@/components/auth/apple-button";
import { AuthDivider, AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { localizedAlternates } from "@/lib/seo/locales";
import { normalizeReturnPath } from "@/lib/safe-return-path";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale !== "ka" ? "Sign in" : "შესვლა",
    // Auth utility page — keep it crawlable for link equity but out of the
    // index (it was ranking in site: queries on both hosts with thin copy).
    robots: { index: false, follow: true },
    // Both hosts serve this path in their own language, and both were
    // indexable while self-canonicalizing — without hreflang that reads as
    // two duplicates rather than one page in two languages.
    alternates: localizedAlternates(
      "/login",
      "/login",
      locale !== "ka" ? "en" : "ka",
    ),
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = next ? normalizeReturnPath(next, "") || null : null;
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const session = await auth();
  if (session?.user?.id)
    redirect(
      dest ? `/post-login?next=${encodeURIComponent(dest)}` : "/post-login",
    );

  return (
    <AuthLayout
      locale={locale}
      title={en ? "Welcome back" : "კეთილი იყოს შენი დაბრუნება"}
      subtitle={
        en ? "Step back into your cosmic map." : "შემოდი შენს კოსმიურ რუკაში."
      }
      footer={
        <>
          {en ? "New to Vivida?" : "ჯერ არ გაქვს ანგარიში?"}{" "}
          <Link
            href={dest ? `/signup?next=${encodeURIComponent(dest)}` : "/signup"}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {en ? "Create an account" : "დარეგისტრირდი"}
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        <GoogleButton
          locale={locale}
          callbackUrl={
            dest
              ? `/post-login?next=${encodeURIComponent(dest)}`
              : "/post-login"
          }
        />
        <AppleButton
          locale={locale}
          callbackUrl={
            dest
              ? `/post-login?next=${encodeURIComponent(dest)}`
              : "/post-login"
          }
        />
      </div>
      <AuthDivider locale={locale} />
      {/* useSearchParams in LoginForm requires a Suspense boundary. */}
      <Suspense fallback={null}>
        <LoginForm locale={locale} />
      </Suspense>
    </AuthLayout>
  );
}
