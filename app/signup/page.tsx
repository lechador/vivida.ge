import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthDivider, AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "რეგისტრაცია" };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <AuthLayout
      title="შექმენი შენი ანგარიში"
      subtitle="ერთ წუთში — შენი კოსმოსი გელოდება."
      footer={
        <>
          უკვე გაქვს ანგარიში?{" "}
          <Link
            href="/login"
            className="text-foreground underline-offset-2 hover:underline"
          >
            შესვლა
          </Link>
        </>
      }
    >
      <GoogleButton label="რეგისტრაცია Google-ით" />
      <AuthDivider />
      <SignupForm />
    </AuthLayout>
  );
}
