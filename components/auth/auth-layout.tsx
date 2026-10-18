import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";
import { Starfield } from "@/components/landing/starfield";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Editorial Celestial chrome for /login, /signup, /forgot-password,
 * /reset-password, /verify-email.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  locale = "ka",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  locale?: UserLocale;
}) {
  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="border-b border-border/70">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <VividaMark size={30} id="auth-header" />
              <span className="font-display text-2xl font-medium tracking-tight text-foreground">
                Vivida
              </span>
            </Link>
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-md">
            <div className="text-center">
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mx-auto mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="mt-8 rounded-md border border-border bg-card p-6 sm:p-8">
              {children}
            </div>

            {footer && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/** Editorial "or" divider used between OAuth and email forms. */
export function AuthDivider({ locale = "ka" }: { locale?: UserLocale }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {locale !== "ka" ? "or" : "ან"}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
