import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthDivider, AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "რეგისტრაცია" };

/** Same-origin relative path only (no open redirect). */
function safeNext(v: string | undefined): string | null {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : null;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = safeNext(next);
  const session = await auth();
  if (session?.user?.id) redirect(dest ?? "/feed");

  const loginHref = dest ? `/login?next=${encodeURIComponent(dest)}` : "/login";

  return (
    <AuthLayout
      title="შექმენი შენი ანგარიში"
      subtitle="ერთ წუთში — შენი კოსმოსი გელოდება."
      footer={
        <>
          უკვე გაქვს ანგარიში?{" "}
          <Link
            href={loginHref}
            className="text-foreground underline-offset-2 hover:underline"
          >
            შესვლა
          </Link>
        </>
      }
    >
      <GoogleButton label="რეგისტრაცია Google-ით" callbackUrl={dest ?? "/feed"} />
      <AuthDivider />
      {/* useSearchParams in SignupForm requires a Suspense boundary. */}
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
