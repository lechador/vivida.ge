import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthDivider, AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "შესვლა" };

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
  const session = await auth();
  if (session?.user?.id) redirect(dest ?? "/feed");

  return (
    <AuthLayout
      title="კეთილი იყოს შენი დაბრუნება"
      subtitle="შემოდი შენს კოსმიურ რუკაში."
      footer={
        <>
          ჯერ არ გაქვს ანგარიში?{" "}
          <Link
            href={dest ? `/signup?next=${encodeURIComponent(dest)}` : "/signup"}
            className="text-foreground underline-offset-2 hover:underline"
          >
            დარეგისტრირდი
          </Link>
        </>
      }
    >
      <GoogleButton callbackUrl={dest ?? "/feed"} />
      <AuthDivider />
      {/* useSearchParams in LoginForm requires a Suspense boundary. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
