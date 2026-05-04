import Link from "next/link";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "პაროლის აღდგენა" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="პაროლის აღდგენა"
      footer={
        <>
          გახსოვს?{" "}
          <Link
            href="/login"
            className="text-foreground underline-offset-2 hover:underline"
          >
            შესვლა
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
