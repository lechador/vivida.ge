import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "ახალი პაროლი" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthLayout title="ახალი პაროლი" subtitle="დააყენე ახალი პაროლი ანგარიშისთვის.">
      <ResetPasswordForm token={token ?? ""} />
    </AuthLayout>
  );
}
