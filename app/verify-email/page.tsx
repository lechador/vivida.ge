import { cookies } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { VerifyEmailLinkForm } from "@/components/auth/verify-email-link-form";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale !== "ka" ? "Verify email" : "ელფოსტის დადასტურება",
    robots: { index: false, follow: false },
  };
}

export default async function VerifyEmailPage() {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const hasToken = Boolean((await cookies()).get("vivida_email_verify")?.value);

  return (
    <AuthLayout
      locale={locale}
      title={en ? "Verify your email" : "დაადასტურე ელფოსტა"}
      subtitle={
        en
          ? "Set your password to finish creating your account."
          : "ანგარიშის შექმნის დასასრულებლად დააყენე პაროლი."
      }
      footer={
        <Link
          href="/login"
          className="text-foreground underline-offset-2 hover:underline"
        >
          {en ? "Back to sign in" : "შესვლის გვერდზე დაბრუნება"}
        </Link>
      }
    >
      <VerifyEmailLinkForm hasToken={hasToken} locale={locale} />
    </AuthLayout>
  );
}
