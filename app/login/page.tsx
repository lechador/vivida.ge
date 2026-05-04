import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthDivider, AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "შესვლა" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <AuthLayout
      title="კეთილი იყოს შენი დაბრუნება"
      subtitle="შემოდი შენს კოსმიურ რუკაში."
      footer={
        <>
          ჯერ არ გაქვს ანგარიში?{" "}
          <Link
            href="/signup"
            className="text-foreground underline-offset-2 hover:underline"
          >
            დარეგისტრირდი
          </Link>
        </>
      }
    >
      <GoogleButton />
      <AuthDivider />
      {/* useSearchParams in LoginForm requires a Suspense boundary. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
