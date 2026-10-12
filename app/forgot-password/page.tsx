import Link from "next/link";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale !== "ka" ? "Reset password" : "პაროლის აღდგენა",
    // Auth utility page, out of the index, links still followed.
    robots: { index: false, follow: true },
  };
}

export default async function ForgotPasswordPage() {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return (
    <AuthLayout
      locale={locale}
      title={en ? "Reset your password" : "პაროლის აღდგენა"}
      footer={
        <>
          {en ? "Remember it?" : "გახსოვს?"}{" "}
          <Link
            href="/login"
            className="text-foreground underline-offset-2 hover:underline"
          >
            {en ? "Sign in" : "შესვლა"}
          </Link>
        </>
      }
    >
      <ForgotPasswordForm locale={locale} />
    </AuthLayout>
  );
}
