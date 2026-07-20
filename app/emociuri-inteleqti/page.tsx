import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Heart } from "lucide-react";

import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { EQ_ARTICLES } from "@/lib/seo/eq-articles";
import { breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";

const URL = "https://www.vivida.ge/emociuri-inteleqti";

export const metadata: Metadata = {
  title: "ემოციური ინტელექტი — სტატიები, სავარჯიშოები და EQ გზამკვლევი",
  description: "ემოციური ინტელექტის ქართული ბიბლიოთეკა: ემპათია, ემოციების მართვა, თვითშემეცნება, მოტივაცია, კომუნიკაცია და ურთიერთობები.",
  keywords: ["ემოციური ინტელექტი", "EQ", "ემპათია", "ემოციების მართვა", "თვითშემეცნება", "სოციალური უნარები"],
  alternates: { canonical: URL },
  openGraph: { title: "ემოციური ინტელექტის გზამკვლევი", description: "პრაქტიკული, კვლევაზე დაფუძნებული სტატიები EQ-ის გასავითარებლად.", url: URL, type: "website", locale: "ka_GE" },
};

export default async function EqArticlesPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";
  const categories = [...new Set(EQ_ARTICLES.map((item) => item.category))];

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <Starfield count={90} shooting={1} />
      {authed ? <AppHeader authed plan={plan} active="tests" /> : <SmartHeader />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(breadcrumbLd([{ name: "მთავარი", url: "https://www.vivida.ge" }, { name: "ემოციური ინტელექტი", url: URL }])) }} />
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--vivida-pink)]/12 text-[var(--vivida-pink)]"><Heart /></div>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-6xl">ემოციური ინტელექტის გზამკვლევი</h1>
          <p className="mt-5 text-pretty text-base leading-7 text-foreground/75 sm:text-lg">პრაქტიკული ქართული სტატიები, რომლებიც დაგეხმარება საკუთარი ემოციების გაგებაში, ემპათიის გაძლიერებასა და უკეთეს კომუნიკაციაში.</p>
          <Link href="/eq-testi" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white">გაიგე შენი EQ <ArrowRight className="size-4" /></Link>
        </header>

        <div className="mt-14 space-y-12">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="mb-4 text-2xl font-semibold">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {EQ_ARTICLES.filter((item) => item.category === category).map((item) => (
                  <article key={item.slug} className="group relative rounded-2xl border border-border bg-card/55 p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/45">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="size-3.5" /> {item.readingMinutes} წუთი</div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug"><Link href={`/emociuri-inteleqti/${item.slug}`} className="after:absolute after:inset-0">{item.title}</Link></h3>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">{item.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--vivida-cyan)]">წაიკითხე <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" /></span>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
