import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { localizedHref } from "@/lib/seo/public-paths";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import type { UserLocale } from "@/lib/i18n/user-locale";

type GuideLocale = UserLocale;

export function GuideShell({
  children,
  locale = "ka",
  georgianPath,
}: {
  children: React.ReactNode;
  locale?: GuideLocale;
  georgianPath?: string;
}) {
  const en = locale === "en";
  return (
    <main
      lang={locale}
      className="relative isolate min-h-screen overflow-hidden"
    >
      <div
        aria-hidden
        className={
          en
            ? "absolute inset-0 -z-10 bg-[radial-gradient(50%_30%_at_50%_-5%,oklch(0.26_0.12_305/0.30),transparent_70%)]"
            : "absolute inset-0 -z-10 bg-[radial-gradient(55%_38%_at_50%_-5%,oklch(0.31_0.17_300/0.5),transparent_75%),radial-gradient(38%_28%_at_90%_24%,oklch(0.27_0.13_220/0.38),transparent_75%)]"
        }
      />
      <Starfield count={en ? 70 : 90} shooting={1} />
      <SmartHeader locale={locale} georgianPath={georgianPath} />
      {children}
      <SiteFooter locale={locale} />
    </main>
  );
}

export function GuideBreadcrumbs({
  items,
  locale = "ka",
}: {
  items: { href: string; label: string }[];
  locale?: GuideLocale;
}) {
  const homeLabel = locale === "en" ? "Home" : "მთავარი";
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-7 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
    >
      <Link href={localizedHref("/", locale)} className="hover:text-foreground">
        {homeLabel}
      </Link>
      {items.map((item) => (
        <span className="contents" key={item.href}>
          <span aria-hidden>/</span>
          <Link
            href={localizedHref(item.href, locale)}
            className="hover:text-foreground last:text-foreground/85"
          >
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export function NatalCta({
  title,
  locale = "ka",
}: {
  title?: string;
  locale?: GuideLocale;
}) {
  const heading =
    title ??
    (locale === "en"
      ? "See it all in your birth chart"
      : "ნახე ეს ყველაფერი შენს რუკაში");
  const desc =
    locale === "en"
      ? "Enter your birth date, exact time, and city. Vivida will calculate your planets, rising sign, and 12 houses for free."
      : "შეიყვანე დაბადების თარიღი, ზუსტი დრო და ქალაქი, Vivida უფასოდ გამოთვლის შენს პლანეტებს, ასცენდენტსა და 12 სახლს.";
  const ctaHref = locale === "en" ? "/natal-chart" : "/nataluri-ruka";
  const ctaLabel =
    locale === "en" ? "Calculate your birth chart" : "ნატალური რუკის გამოთვლა";
  const en = locale === "en";

  return (
    <section
      className={
        en
          ? "mt-12 rounded-3xl border border-border bg-card/40 p-7 sm:p-10"
          : "mt-12 rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/70 to-[var(--vivida-cyan)]/10 p-7 text-center ring-1 ring-foreground/5 sm:p-10"
      }
    >
      {en ? (
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vivida-cyan)]">
          <span
            aria-hidden
            className="inline-block h-px w-8 bg-[var(--vivida-cyan)]/60"
          />
          Free calculator
        </p>
      ) : (
        <Sparkles className="mx-auto size-6 text-[var(--vivida-violet)]" />
      )}
      <h2
        className={
          en
            ? "font-display mt-3 max-w-xl text-balance text-3xl font-medium tracking-[-0.01em] sm:text-4xl"
            : "mt-3 text-balance text-2xl font-semibold tracking-tight"
        }
      >
        {heading}
      </h2>
      <p
        className={
          en
            ? "mt-3 max-w-xl leading-7 text-foreground/75"
            : "mx-auto mt-3 max-w-xl leading-7 text-foreground/75"
        }
      >
        {desc}
      </p>
      <Button asChild variant="mystic" size="lg" className="mt-6">
        <Link href={ctaHref}>
          {ctaLabel} <ArrowRight className="size-4" />
        </Link>
      </Button>
    </section>
  );
}

export function FaqList({
  items,
  locale = "ka",
}: {
  items: { q: string; a: string }[];
  locale?: GuideLocale;
}) {
  const heading =
    locale === "en" ? "Frequently asked questions" : "ხშირად დასმული კითხვები";
  const en = locale === "en";
  return (
    <section className="mt-12">
      <h2
        className={
          en
            ? "font-display text-3xl font-medium tracking-[-0.01em]"
            : "text-2xl font-semibold tracking-tight"
        }
      >
        {heading}
      </h2>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-card/55 ring-1 ring-foreground/5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="px-5 pb-5 leading-7 text-foreground/78">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
