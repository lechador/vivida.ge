import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";

type GuideLocale = "ka" | "en";

export function GuideShell({ children, locale = "ka", georgianPath }: { children: React.ReactNode; locale?: GuideLocale; georgianPath?: string }) {
  return (
    <main lang={locale} className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_38%_at_50%_-5%,oklch(0.31_0.17_300/0.5),transparent_75%),radial-gradient(38%_28%_at_90%_24%,oklch(0.27_0.13_220/0.38),transparent_75%)]" />
      <Starfield count={90} shooting={1} />
      <SmartHeader locale={locale} georgianPath={georgianPath} />
      {children}
      <SiteFooter locale={locale} />
    </main>
  );
}

export function GuideBreadcrumbs({ items, locale = "ka" }: { items: { href: string; label: string }[]; locale?: GuideLocale }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Link href="/" className="hover:text-foreground">{locale === "en" ? "Home" : "მთავარი"}</Link>
      {items.map((item) => <span className="contents" key={item.href}><span aria-hidden>/</span><Link href={item.href} className="hover:text-foreground last:text-foreground/85">{item.label}</Link></span>)}
    </nav>
  );
}

export function NatalCta({ title, locale = "ka" }: { title?: string; locale?: GuideLocale }) {
  const heading = title ?? (locale === "en" ? "See it all in your birth chart" : "ნახე ეს ყველაფერი შენს რუკაში");
  return (
    <section className="mt-12 rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/70 to-[var(--vivida-cyan)]/10 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
      <Sparkles className="mx-auto size-6 text-[var(--vivida-violet)]" />
      <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight">{heading}</h2>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-foreground/75">{locale === "en" ? "Enter your birth date, exact time, and city. Vivida will calculate your planets, rising sign, and 12 houses for free." : "შეიყვანე დაბადების თარიღი, ზუსტი დრო და ქალაქი — Vivida უფასოდ გამოთვლის შენს პლანეტებს, ასცენდენტსა და 12 სახლს."}</p>
      <Button asChild variant="mystic" size="lg" className="mt-6"><Link href={locale === "en" ? "/natal-chart" : "/nataluri-ruka"}>{locale === "en" ? "Calculate your birth chart" : "ნატალური რუკის გამოთვლა"} <ArrowRight className="size-4" /></Link></Button>
    </section>
  );
}

export function FaqList({ items, locale = "ka" }: { items: { q: string; a: string }[]; locale?: GuideLocale }) {
  return (
    <section className="mt-12"><h2 className="text-2xl font-semibold tracking-tight">{locale === "en" ? "Frequently asked questions" : "ხშირად დასმული კითხვები"}</h2><div className="mt-5 space-y-3">{items.map((item) => <details key={item.q} className="group rounded-2xl border border-border bg-card/55 ring-1 ring-foreground/5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium [&::-webkit-details-marker]:hidden">{item.q}<span className="text-muted-foreground transition-transform group-open:rotate-45">+</span></summary><p className="px-5 pb-5 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>
  );
}
