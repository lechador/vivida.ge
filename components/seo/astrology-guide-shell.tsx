import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";

export function GuideShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_38%_at_50%_-5%,oklch(0.31_0.17_300/0.5),transparent_75%),radial-gradient(38%_28%_at_90%_24%,oklch(0.27_0.13_220/0.38),transparent_75%)]" />
      <Starfield count={90} shooting={1} />
      <SmartHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function GuideBreadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Link href="/" className="hover:text-foreground">მთავარი</Link>
      {items.map((item) => <span className="contents" key={item.href}><span aria-hidden>/</span><Link href={item.href} className="hover:text-foreground last:text-foreground/85">{item.label}</Link></span>)}
    </nav>
  );
}

export function NatalCta({ title = "ნახე ეს ყველაფერი შენს რუკაში" }: { title?: string }) {
  return (
    <section className="mt-12 rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/70 to-[var(--vivida-cyan)]/10 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
      <Sparkles className="mx-auto size-6 text-[var(--vivida-violet)]" />
      <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-foreground/75">შეიყვანე დაბადების თარიღი, ზუსტი დრო და ქალაქი — Vivida უფასოდ გამოთვლის შენს პლანეტებს, ასცენდენტსა და 12 სახლს.</p>
      <Button asChild variant="mystic" size="lg" className="mt-6"><Link href="/nataluri-ruka">ნატალური რუკის გამოთვლა <ArrowRight className="size-4" /></Link></Button>
    </section>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="mt-12"><h2 className="text-2xl font-semibold tracking-tight">ხშირად დასმული კითხვები</h2><div className="mt-5 space-y-3">{items.map((item) => <details key={item.q} className="group rounded-2xl border border-border bg-card/55 ring-1 ring-foreground/5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium [&::-webkit-details-marker]:hidden">{item.q}<span className="text-muted-foreground transition-transform group-open:rotate-45">+</span></summary><p className="px-5 pb-5 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>
  );
}
