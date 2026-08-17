import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale !== "ka" ? "New password" : "ახალი პაროლი" };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const am = locale === "am";
  return (
    <AuthLayout
      locale={locale}
      title={am ? "Ընտրեք նոր գաղտնաբառ" : en ? "Choose a new password" : "ახალი პაროლი"}
      subtitle={am ? "Սահմանեք նոր գաղտնաբառ Ձեր հաշվի համար։" : en ? "Set a new password for your account." : "დააყენე ახალი პაროლი ანგარიშისთვის."}
    >
      <ResetPasswordForm token={token ?? ""} locale={locale} />
    </AuthLayout>
  );
}
