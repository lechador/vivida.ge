import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FaqList, GuideBreadcrumbs, GuideShell, NatalCta } from "@/components/seo/astrology-guide-shell";
import { AstrologyHousesHubEn, HOUSES_EN } from "@/components/seo/astrology-guides-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { HOUSE_GUIDES } from "@/lib/seo/astrology-guides";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const URL = "https://www.vivida.ge/astrologiuri-saxlebi";
const TITLE = "ასტროლოგიური სახლები — ნატალური რუკის 12 სახლის მნიშვნელობა";
const DESCRIPTION = "გაიგე, რას ნიშნავს ნატალური რუკის 12 ასტროლოგიური სახლი: პიროვნება, ფული, სიყვარული, კარიერა, ურთიერთობები და სხვა ცხოვრების სფეროები ქართულად.";
const FAQ = [
  { q: "რა არის ასტროლოგიური სახლები?", a: "ასტროლოგიური სახლები ნატალურ რუკას 12 ცხოვრებისეულ სფეროდ ყოფს. პლანეტა გვიჩვენებს რა ენერგია მოქმედებს, ნიშანი — როგორ, სახლი კი — ცხოვრების რომელ სფეროში ვლინდება ის." },
  { q: "რატომ არის დაბადების ზუსტი დრო საჭირო?", a: "სახლების საზღვრები და ასცენდენტი დაახლოებით ყოველ ორ საათში იცვლება. რამდენიმე წუთმაც კი შეიძლება სახლის მწვერვალი შეცვალოს, ამიტომ სასურველია დაბადების მოწმობაში ჩაწერილი დრო." },
  { q: "რას ნიშნავს ცარიელი სახლი?", a: "ცარიელი სახლი არ ნიშნავს, რომ ეს სფერო შენს ცხოვრებაში არ არსებობს. მას მაინც აქვს ნიშანი და მმართველი პლანეტა; ინტერპრეტაცია სწორედ მათით იწყება." },
  { q: "რომელია ყველაზე მნიშვნელოვანი სახლი?", a: "ყველა სახლი მნიშვნელოვანია. პირველი, მეოთხე, მეშვიდე და მეათე კუთხური სახლები ხშირად განსაკუთრებით თვალსაჩინოა, მაგრამ რუკის აქცენტი ინდივიდუალურია." },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "en") return { title: { absolute: HOUSES_EN.title }, description: HOUSES_EN.description, keywords: ["houses in astrology", "12 astrological houses", "birth chart houses", "astrology house meanings"], alternates: localizedAlternates("/astrologiuri-saxlebi", "/astrologiuri-saxlebi", "en"), openGraph: { images: [DEFAULT_OG_IMAGE], title: HOUSES_EN.title, description: HOUSES_EN.description, url: "https://www.vividaastro.com/astrologiuri-saxlebi", type: "article", locale: "en_US", siteName: "Vivida" }, twitter: { card: "summary_large_image", title: HOUSES_EN.title, description: HOUSES_EN.description } };
  return { title: { absolute: TITLE }, description: DESCRIPTION, keywords: ["ასტროლოგიური სახლები", "ნატალური რუკის სახლები", "12 სახლი ასტროლოგიაში", "სახლები ჰოროსკოპში"], alternates: localizedAlternates("/astrologiuri-saxlebi", "/astrologiuri-saxlebi", "ka"), openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: URL, type: "article", locale: "ka_GE", siteName: "Vivida" } };
}

export default async function AstrologyHousesPage() {
  if ((await getRequestLocale()) === "en") return <AstrologyHousesHubEn />;
  const ld = [articleLd({ url: URL, headline: TITLE, description: DESCRIPTION, datePublished: "2026-07-27T00:00:00+04:00" }), breadcrumbLd([{ name: "მთავარი", url: "https://www.vivida.ge" }, { name: "ასტროლოგიური სახლები", url: URL }]), faqLd(FAQ)];
  return <GuideShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} /><article className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-7 sm:px-6 sm:pt-12"><GuideBreadcrumbs items={[{ href: "/astrologiuri-saxlebi", label: "ასტროლოგიური სახლები" }]} /><header className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vivida-violet)]">ნატალური რუკის გზამკვლევი</p><h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">ასტროლოგიური სახლები — <span className="bg-gradient-to-r from-[var(--vivida-violet)] via-[var(--vivida-pink)] to-[var(--vivida-cyan)] bg-clip-text text-transparent">12 ცხოვრების სფერო</span></h1><p className="mt-5 text-pretty text-lg leading-8 text-foreground/80">ნატალური რუკის 12 სახლი პასუხობს კითხვას „სად?“ — ცხოვრების რომელ სფეროში ვლინდება პლანეტის ენერგია. ეს გზამკვლევი თითოეულ სახლს მარტივად და პრაქტიკულად აგიხსნის.</p></header><section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{HOUSE_GUIDES.map((house) => <Link key={house.number} href={`/astrologiuri-saxlebi/${house.number}`} className="group rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/40"><div className="flex items-start justify-between"><span className="text-3xl font-semibold text-[var(--vivida-violet)]">{house.number}</span><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" /></div><h2 className="mt-4 text-lg font-semibold">{house.name}</h2><p className="mt-2 text-sm leading-6 text-foreground/70">{house.area}</p><ul className="mt-4 flex flex-wrap gap-1.5">{house.keywords.slice(0, 3).map((keyword) => <li key={keyword} className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground">{keyword}</li>)}</ul></Link>)}</section><section className="mt-12 grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-border bg-card/50 p-6"><h2 className="text-xl font-semibold">როგორ წავიკითხოთ სახლი</h2><p className="mt-3 leading-7 text-foreground/78">შეხედე ოთხ ნაწილს: სახლის ნომერსა და თემას, მის მწვერვალზე მდებარე ნიშანს, ამ ნიშნის მმართველ პლანეტას და თავად სახლში მყოფ პლანეტებს. შემდეგ დაამატე ასპექტები. ერთი პოზიცია მთლიან ისტორიას არასდროს ცვლის.</p></div><div className="rounded-2xl border border-border bg-card/50 p-6"><h2 className="text-xl font-semibold">თუ სახლში პლანეტა არ არის</h2><p className="mt-3 leading-7 text-foreground/78">ეს ნორმალურია — ათი ძირითადი პლანეტა თორმეტივე სახლს ვერ შეავსებს. ცარიელი სახლის წასაკითხად ნახე მისი დასაწყისის ნიშანი და ამ ნიშნის მმართველი პლანეტის მდებარეობა.</p></div></section><FaqList items={FAQ} /><NatalCta title="რომელ სახლებში არიან შენი პლანეტები?" /></article></GuideShell>;
}
