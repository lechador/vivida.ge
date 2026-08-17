import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Heart } from "lucide-react";

import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { auth } from "@/auth";
import { EQ_HUB_EN, EqArticlesHubEn } from "@/components/seo/eq-articles-en";
import { EqArticlesHubAm } from "@/components/seo/eq-articles-am";
import { EQ_HUB_AM } from "@/lib/seo/eq-articles-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { EQ_ARTICLES } from "@/lib/seo/eq-articles";
import { breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const URL = "https://www.vivida.ge/emociuri-inteleqti";

const KA_METADATA: Metadata = {
  title: "ემოციური ინტელექტი — სტატიები, სავარჯიშოები და EQ გზამკვლევი",
  description: "ემოციური ინტელექტის ქართული ბიბლიოთეკა: ემპათია, ემოციების მართვა, თვითშემეცნება, მოტივაცია, კომუნიკაცია და ურთიერთობები.",
  keywords: ["ემოციური ინტელექტი", "EQ", "ემპათია", "ემოციების მართვა", "თვითშემეცნება", "სოციალური უნარები"],
  alternates: localizedAlternates("/emociuri-inteleqti", "/emociuri-inteleqti", "ka"),
  openGraph: { images: [DEFAULT_OG_IMAGE], title: "ემოციური ინტელექტის გზამკვლევი", description: "პრაქტიკული, კვლევაზე დაფუძნებული სტატიები EQ-ის გასავითარებლად.", url: URL, type: "website", locale: "ka_GE" },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "ka") return KA_METADATA;
  if (locale === "am") {
    const path = "/emociuri-inteleqti";
    return {
      title: { absolute: `${EQ_HUB_AM.title} — Vivida` },
      description: EQ_HUB_AM.description,
      keywords: ["էմոցիոնալ ինտելեկտ", "EQ", "էմպաթիա", "ինքնաճանաչում", "սոցիալական հմտություններ"],
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${ARMENIAN_SITE_URL}${path}`,
        title: EQ_HUB_AM.title,
        description: EQ_HUB_AM.description,
        siteName: "Vivida",
        locale: "hy_AM",
      },
      twitter: { card: "summary_large_image", title: EQ_HUB_AM.title, description: EQ_HUB_AM.description },
    };
  }
  if (locale === "en") {
    const path = "/emociuri-inteleqti";
    return {
      title: { absolute: EQ_HUB_EN.title }, description: EQ_HUB_EN.description,
      keywords: ["emotional intelligence", "EQ skills", "empathy", "emotion regulation", "self-awareness"],
      alternates: localizedAlternates(path, path, "en"),
      openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: `https://www.vividaastro.com${path}`, title: EQ_HUB_EN.title, description: EQ_HUB_EN.description, siteName: "Vivida", locale: "en_US" },
      twitter: { card: "summary_large_image", title: EQ_HUB_EN.title, description: EQ_HUB_EN.description },
    };
  }
  return KA_METADATA;
}

export default async function EqArticlesPage() {
  const locale = await getRequestLocale();
  if (locale === "am") return <EqArticlesHubAm />;
  if (locale === "en") return <EqArticlesHubEn />;
  const session = await auth();
  const authed = !!session?.user?.id;
  const categories = [...new Set(EQ_ARTICLES.map((item) => item.category))];

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <Starfield count={90} shooting={1} />
      {authed ? <AppHeader authed active="tests" /> : <SmartHeader />}
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
