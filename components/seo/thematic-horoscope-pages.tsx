import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PopularSearches } from "@/components/seo/popular-searches";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { genitiveKa } from "@/lib/georgian";
import { SIGNS_CONTENT, paragraphs } from "@/lib/seo/zodiac-content";
import { ALL_SLUGS, ZODIAC_DATES, signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { ALL_HOROSCOPE_THEMES, THEME_CONFIG, themeContent, themeUrl, type HoroscopeTheme } from "@/lib/seo/thematic-horoscope";
import { SIGN_LATIN_NAMES } from "@/lib/seo/transliteration";
import { signColor } from "@/lib/zodiac";

const SITE_URL = "https://www.vivida.ge";

function themeFaq(theme: HoroscopeTheme) {
  const cfg = THEME_CONFIG[theme];
  const subject = theme === "love" ? "სიყვარულს და ურთიერთობებს" : theme === "finance" ? "ფულთან დამოკიდებულებას" : "კარიერასა და სამუშაო სტილს";
  return [
    { q: `რას აჩვენებს ${cfg.label}?`, a: `${cfg.label} აღწერს, როგორ უკავშირდება ზოდიაქოს თითოეული ნიშნის ბუნება ${subject}. ეს არის მზის ნიშნის ზოგადი გზამკვლევი; სრული პერსონალური სურათი მთელ ნატალურ რუკას მოითხოვს.` },
    { q: `რომელი ნიშნის ${cfg.label.toLowerCase()} უნდა წავიკითხო?`, a: "თუ მხოლოდ ზოდიაქოს ნიშანი იცი, დაიწყე მზის ნიშნით. უფრო პირადი ანალიზისთვის გაითვალისწინე ასცენდენტი, მთვარე, ვენერა, მარსი და შესაბამისი ასტროლოგიური სახლები." },
    { q: "ეს პერსონალური პროგნოზია?", a: "არა — ეს ნიშნების მიხედვით შედგენილი ზოგადი გზამკვლევია. პერსონალური ჰოროსკოპი დაბადების ზუსტ დროსა და ადგილს, ნატალურ რუკასა და მიმდინარე ტრანზიტებს ითვალისწინებს." },
  ];
}

export function thematicHubMetadata(theme: HoroscopeTheme) {
  const cfg = THEME_CONFIG[theme];
  const url = `${SITE_URL}/${cfg.slug}`;
  return {
    title: { absolute: cfg.title },
    description: cfg.description,
    keywords: cfg.keywords,
    alternates: { canonical: url },
    openGraph: { type: "website" as const, url, title: cfg.title, description: cfg.description, siteName: "Vivida", locale: "ka_GE" },
    twitter: { card: "summary_large_image" as const, title: cfg.title, description: cfg.description },
  };
}

export function thematicDetailMetadata(theme: HoroscopeTheme, sign: ZodiacSlug) {
  const cfg = THEME_CONFIG[theme];
  const sc = SIGNS_CONTENT[sign];
  const url = `${SITE_URL}${themeUrl(theme, sign)}`;
  const title = `${genitiveKa(sc.labelKa)} ${cfg.label} — ${cfg.shortLabel} და რჩევები`;
  const description = `${genitiveKa(sc.labelKa)} ${cfg.label}: გაიგე ${sc.labelKa}-ის ${cfg.genitive} სტილი, ძლიერი მხარეები, გამოწვევები და პრაქტიკული რჩევები ქართულად.`;
  const latin = SIGN_LATIN_NAMES[sign][0];
  return {
    title: { absolute: title },
    description,
    keywords: [`${genitiveKa(sc.labelKa)} ${cfg.label}`, `${sc.labelKa} ${cfg.shortLabel}`, `${latin} ${cfg.slug.replaceAll("-", " ")}`, ...cfg.keywords],
    alternates: { canonical: url },
    openGraph: { type: "article" as const, url, title, description, siteName: "Vivida", locale: "ka_GE" },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

export function ThematicHoroscopeHub({ theme }: { theme: HoroscopeTheme }) {
  const cfg = THEME_CONFIG[theme];
  const url = `${SITE_URL}/${cfg.slug}`;
  const faq = themeFaq(theme);
  const ld = [
    articleLd({ url, headline: cfg.title, description: cfg.description, datePublished: "2026-07-21T00:00:00+04:00", dateModified: "2026-07-21T00:00:00+04:00" }),
    breadcrumbLd([{ name: "მთავარი", url: SITE_URL }, { name: "ჰოროსკოპი", url: `${SITE_URL}/horoskopi` }, { name: cfg.label, url }]),
    faqLd(faq),
    { "@context": "https://schema.org", "@type": "ItemList", itemListElement: ALL_SLUGS.map((sign, index) => ({ "@type": "ListItem", position: index + 1, name: `${genitiveKa(SIGNS_CONTENT[sign].labelKa)} ${cfg.label}`, url: `${SITE_URL}${themeUrl(theme, sign)}` })) },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={110} shooting={2} />
      <SmartHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <nav className="mb-6 flex gap-2 text-xs text-muted-foreground"><Link href="/horoskopi" className="hover:text-foreground">ჰოროსკოპი</Link><span>/</span><span className="text-foreground/80">{cfg.label}</span></nav>
        <header className="max-w-3xl">
          <div className="text-4xl" aria-hidden>{cfg.glyph}</div>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{cfg.label}</h1>
          <p className="mt-4 text-pretty text-lg leading-8 text-foreground/80">{cfg.intro}</p>
        </header>

        <div className="mt-8 flex flex-wrap gap-2">
          {ALL_HOROSCOPE_THEMES.map((item) => <Link key={item} href={themeUrl(item)} className={`rounded-full border px-4 py-1.5 text-sm ${item === theme ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15" : "border-border bg-card/55 text-muted-foreground hover:text-foreground"}`}>{THEME_CONFIG[item].label}</Link>)}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SLUGS.map((sign) => {
            const sc = SIGNS_CONTENT[sign];
            const meta = signMetaBySlug(sign);
            const accent = meta ? signColor(meta) : "var(--vivida-violet)";
            const content = themeContent(theme, sign);
            return <Link key={sign} href={themeUrl(theme, sign)} className="group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-foreground/20">
              <div className="flex items-start gap-3"><div className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ color: accent, background: `color-mix(in oklch, ${accent} 16%, transparent)` }}>{sc.symbol}</div><div><h2 className="font-semibold">{genitiveKa(sc.labelKa)} {cfg.label}</h2><p className="text-xs text-muted-foreground">{ZODIAC_DATES[sign].rangeKa}</p></div></div>
              <p className="mt-4 line-clamp-4 text-sm leading-6 text-foreground/78">{paragraphs(content.main)[0]}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--vivida-cyan)]">სრული ჰოროსკოპი <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" /></span>
            </Link>;
          })}
        </div>

        <section className="mt-14"><h2 className="text-2xl font-semibold">როგორ გამოვიყენოთ ეს ჰოროსკოპი?</h2><p className="mt-4 max-w-3xl text-base leading-8 text-foreground/80">მზის ნიშანი გვაძლევს საწყის სურათს, მაგრამ {cfg.shortLabel.toLowerCase()} მხოლოდ ერთი ნიშნით არ განისაზღვრება. პერსონალურ ანალიზში მნიშვნელოვანია მთვარე, ასცენდენტი, ვენერა, მარსი და ნატალური რუკის სახლები. გამოიყენე ეს გვერდები თვითდაკვირვების საწყისად და შემდეგ შექმენი სრული პირადი რუკა.</p></section>

        <section className="mt-12"><h2 className="text-2xl font-semibold">ხშირად დასმული კითხვები</h2><div className="mt-5 space-y-3">{faq.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>

        <div className="mt-14 rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-7 text-center"><Sparkles className="mx-auto size-6 text-[var(--vivida-cyan)]" /><h2 className="mt-3 text-2xl font-semibold">გაიგე შენი სრული ასტროლოგიური პროფილი</h2><p className="mx-auto mt-2 max-w-lg text-sm text-foreground/75">მზის ნიშანი მხოლოდ დასაწყისია — პირადი რუკა ითვალისწინებს დაბადების დროს, ადგილს და ყველა პლანეტას.</p><Button asChild variant="mystic" className="mt-5"><Link href="/piradi-ruka">პირადი რუკის შედგენა</Link></Button></div>
        <PopularSearches queries={cfg.keywords} />
      </section>
      <SiteFooter />
    </main>
  );
}

export function ThematicHoroscopeDetail({ theme, sign }: { theme: HoroscopeTheme; sign: ZodiacSlug }) {
  const cfg = THEME_CONFIG[theme];
  const sc = SIGNS_CONTENT[sign];
  const content = themeContent(theme, sign);
  const meta = signMetaBySlug(sign);
  const accent = meta ? signColor(meta) : "var(--vivida-violet)";
  const url = `${SITE_URL}${themeUrl(theme, sign)}`;
  const faq = [
    { q: `როგორია ${sc.labelKa} ${cfg.inForm}?`, a: paragraphs(content.main)[0] },
    { q: `რა არის ${sc.labelKa}-ის მთავარი ძლიერი მხარე?`, a: content.focus },
    { q: `რას უნდა მიაქციოს ყურადღება ${sc.labelKa}-მა?`, a: content.watch },
  ];
  const ld = [articleLd({ url, headline: `${genitiveKa(sc.labelKa)} ${cfg.label}`, description: content.focus, datePublished: "2026-07-21T00:00:00+04:00", dateModified: "2026-07-21T00:00:00+04:00", about: { "@type": "Thing", name: sc.labelKa } }), breadcrumbLd([{ name: "მთავარი", url: SITE_URL }, { name: cfg.label, url: `${SITE_URL}${themeUrl(theme)}` }, { name: sc.labelKa, url }]), faqLd(faq)];
  const latinQueries = [`${SIGN_LATIN_NAMES[sign][0]} ${cfg.slug.replaceAll("-", " ")}`, `${SIGN_LATIN_NAMES[sign][0]} ${theme === "love" ? "siyvaruli" : theme === "finance" ? "finansebi" : "kariera"}`, ...cfg.keywords];

  return <main className="relative isolate flex min-h-screen flex-col overflow-hidden"><Starfield count={90} shooting={1} /><SmartHeader /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
    <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <nav className="text-xs text-muted-foreground"><Link href={themeUrl(theme)} className="hover:text-foreground">{cfg.label}</Link> / {sc.labelKa}</nav>
      <header className="mt-6 rounded-3xl border border-border bg-card/60 p-6 sm:p-9"><div className="flex items-start gap-4"><div className="grid size-16 shrink-0 place-items-center rounded-2xl text-4xl" style={{ color: accent, background: `color-mix(in oklch, ${accent} 16%, transparent)` }}>{sc.symbol}</div><div><p className="text-xs text-muted-foreground">{ZODIAC_DATES[sign].rangeKa}</p><h1 className="mt-1 text-balance text-3xl font-semibold sm:text-4xl">{genitiveKa(sc.labelKa)} {cfg.label}</h1></div></div><p className="mt-5 text-lg leading-8 text-foreground/82">{content.focus}</p></header>
      <section className="mt-10 space-y-4 text-base leading-8 text-foreground/82">{paragraphs(content.main).map((p) => <p key={p}>{p}</p>)}</section>
      <div className="mt-10 grid gap-4 sm:grid-cols-2"><section className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 p-5"><h2 className="font-semibold">რას მიაქციო ყურადღება</h2><p className="mt-2 text-sm leading-7 text-foreground/78">{content.watch}</p></section><section className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-5"><h2 className="font-semibold">პრაქტიკული რჩევა</h2><p className="mt-2 text-sm leading-7 text-foreground/78">{content.advice}</p></section></div>
      <section className="mt-12"><h2 className="text-2xl font-semibold">{sc.labelKa}-ის სხვა ჰოროსკოპები</h2><div className="mt-4 flex flex-wrap gap-2">{ALL_HOROSCOPE_THEMES.filter((item) => item !== theme).map((item) => <Link key={item} href={themeUrl(item, sign)} className="rounded-full border border-border bg-card/55 px-4 py-2 text-sm hover:bg-card/80">{THEME_CONFIG[item].label}</Link>)}<Link href={`/zodiac/${sign}/dghes`} className="rounded-full border border-border bg-card/55 px-4 py-2 text-sm hover:bg-card/80">დღის ჰოროსკოპი</Link><Link href={`/zodiac/${sign}`} className="rounded-full border border-border bg-card/55 px-4 py-2 text-sm hover:bg-card/80">{sc.labelKa} — სრული დახასიათება</Link></div></section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">სხვა ნიშნების {cfg.label.toLowerCase()}</h2><div className="mt-4 flex flex-wrap gap-2">{ALL_SLUGS.filter((item) => item !== sign).map((item) => <Link key={item} href={themeUrl(theme, item)} className="rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80">{SIGNS_CONTENT[item].symbol} {SIGNS_CONTENT[item].labelKa}</Link>)}</div></section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">ხშირად დასმული კითხვები</h2><div className="mt-5 space-y-3">{faq.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>
      <div className="mt-12 rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-7 text-center"><h2 className="text-2xl font-semibold">ეს მზის ნიშნის ზოგადი სურათია</h2><p className="mt-2 text-sm text-foreground/75">შენი პირადი რუკა უფრო ზუსტად აჩვენებს {cfg.genitive} თემას.</p><Button asChild variant="mystic" className="mt-5"><Link href="/piradi-ruka">ჩემი პირადი რუკა</Link></Button></div>
      <PopularSearches queries={latinQueries} />
    </article><SiteFooter /></main>;
}
