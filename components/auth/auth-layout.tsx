import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";
import { Starfield } from "@/components/landing/starfield";

/**
 * Shared chrome for /login, /signup, /forgot-password, /reset-password,
 * /verify-email. Centered card on the cosmic backdrop, brand mark above.
 * Pages provide the form/content as `children`.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="dawn relative isolate flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(65%_50%_at_50%_-5%,oklch(0.90_0.06_290/0.7),transparent_70%),radial-gradient(45%_35%_at_85%_30%,oklch(0.90_0.08_45/0.6),transparent_70%),radial-gradient(40%_30%_at_15%_75%,oklch(0.91_0.07_350/0.55),transparent_70%)]"
      />
      <Starfield count={100} shooting={2} tone="dawn" />

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <VividaMark size={36} id="auth-header" />
            <span
              className="bg-clip-text text-transparent text-lg font-semibold tracking-tight"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--vivida-violet) 0%, var(--vivida-pink) 55%, var(--vivida-cyan) 100%)",
              }}
            >
              vivida
            </span>
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center px-4 pb-16 pt-2 sm:px-6">
          <div className="w-full max-w-md">
            <div className="text-center">
              <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mx-auto mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-border/60 bg-card/65 p-6 shadow-[0_30px_120px_-40px_oklch(0.65_0.24_305/0.45)] ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
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

/** Branded "or continue with" divider used between Google and email forms. */
export function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
      <span className="h-px flex-1 bg-border/60" />
      ან
      <span className="h-px flex-1 bg-border/60" />
    </div>
  );
}
