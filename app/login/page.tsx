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
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale !== "ka" ? "Sign in" : "შესვლა",
    // Both hosts serve this path in their own language, and both were
    // indexable while self-canonicalizing — without hreflang that reads as
    // two duplicates rather than one page in two languages.
    alternates: localizedAlternates("/login", "/login", locale !== "ka" ? "en" : "ka"),
  };
}

/** Same-origin relative path only (no open redirect). */
function safeNext(v: string | undefined): string | null {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = safeNext(next);
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const am = locale === "am";
  const session = await auth();
  if (session?.user?.id) redirect(dest ?? "/dashboard");

  return (
    <AuthLayout
      locale={locale}
      title={am ? "Բարի վերադարձ" : en ? "Welcome back" : "კეთილი იყოს შენი დაბრუნება"}
      subtitle={am ? "Վերադարձեք ձեր տիեզերական քարտեզին։" : en ? "Step back into your cosmic map." : "შემოდი შენს კოსმიურ რუკაში."}
      footer={
        <>
          {am ? "Նոր եք Vivida-ում։" : en ? "New to Vivida?" : "ჯერ არ გაქვს ანგარიში?"}{" "}
          <Link
            href={dest ? `/signup?next=${encodeURIComponent(dest)}` : "/signup"}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {am ? "Ստեղծել հաշիվ" : en ? "Create an account" : "დარეგისტრირდი"}
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        <GoogleButton locale={locale} callbackUrl={dest ?? "/dashboard"} />
        <AppleButton locale={locale} callbackUrl={dest ?? "/dashboard"} />
      </div>
      <AuthDivider locale={locale} />
      {/* useSearchParams in LoginForm requires a Suspense boundary. */}
      <Suspense fallback={null}>
        <LoginForm locale={locale} />
      </Suspense>
    </AuthLayout>
  );
}
