import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FaqList, GuideBreadcrumbs, GuideShell, NatalCta } from "@/components/seo/astrology-guide-shell";
import { AstrologyHousePageEn } from "@/components/seo/astrology-guides-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { HOUSE_GUIDES, HOUSE_NUMBERS, houseByNumber } from "@/lib/seo/astrology-guides";
import { houseByNumberEn } from "@/lib/seo/astrology-guides-en";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { localizedAlternates } from "@/lib/seo/locales";

const BASE = "https://www.vivida.ge";
type Props = { params: Promise<{ number: string }> };
export function generateStaticParams() { return HOUSE_NUMBERS.map((number) => ({ number })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const number = (await params).number;
  const locale = await getRequestLocale();
  if (locale === "en") {
    const house = houseByNumberEn(number); if (!house) return {};
    const title = `${house.number}${house.number === 1 ? "st" : house.number === 2 ? "nd" : house.number === 3 ? "rd" : "th"} House in Astrology: Meaning in Your Birth Chart`;
    const description = `Learn what the ${house.number}${house.number === 1 ? "st" : house.number === 2 ? "nd" : house.number === 3 ? "rd" : "th"} house means in astrology: ${house.area.toLowerCase()}, its natural sign and ruler, and how to interpret it.`;
    const path = `/astrologiuri-saxlebi/${house.number}`;
    return { title: { absolute: title }, description, keywords: [`${house.number} house astrology`, `${house.name} birth chart`, ...house.keywords], alternates: localizedAlternates(path, path, "en"), openGraph: { title, description, url: `https://www.vividaastro.com${path}`, type: "article", locale: "en_US", siteName: "Vivida" }, twitter: { card: "summary_large_image", title, description } };
  }
  const house = houseByNumber(number); if (!house) return {};
  const title = `${house.number}-ე სახლი ასტროლოგიაში — ${house.name}`;
  const description = `რას ნიშნავს ${house.number}-ე სახლი ნატალურ რუკაში: ${house.area}. მმართველი, საკვანძო თემები და ინტერპრეტაცია ქართულად.`;
  const url = `${BASE}/astrologiuri-saxlebi/${house.number}`;
  return { title: { absolute: title }, description, keywords: [`${house.number}-ე სახლი ასტროლოგიაში`, `${house.number} სახლი ნატალურ რუკაში`, house.name, ...house.keywords], alternates: localizedAlternates(`/astrologiuri-saxlebi/${house.number}`, `/astrologiuri-saxlebi/${house.number}`, "ka"), openGraph: { title, description, url, type: "article", locale: "ka_GE", siteName: "Vivida" } };
}
export default async function HousePage({ params }: Props) {
  const number = (await params).number;
  if ((await getRequestLocale()) === "en") { const house = houseByNumberEn(number); if (!house) notFound(); return <AstrologyHousePageEn house={house} />; }
  const house = houseByNumber(number); if (!house) notFound();
  const url = `${BASE}/astrologiuri-saxlebi/${house.number}`; const title = `${house.number}-ე სახლი ასტროლოგიაში — ${house.name}`; const description = `რას ნიშნავს ${house.number}-ე სახლი ნატალურ რუკაში: ${house.area}.`;
  const faq = [{ q: `რას ნიშნავს ${house.number}-ე სახლი ნატალურ რუკაში?`, a: house.meaning }, { q: `რომელი ნიშანი და პლანეტა უკავშირდება ${house.number}-ე სახლს?`, a: `ბუნებრივ ზოდიაქოს ანალოგიაში ${house.number}-ე სახლს უკავშირდება ${house.sign}, ხოლო მმართველ სიმბოლოდ — ${house.planet}. პირად რუკაში კი სახლის რეალური ნიშანი დაბადების დროსა და ადგილზეა დამოკიდებული.` }, { q: `რას ნიშნავს ბევრი პლანეტა ${house.number}-ე სახლში?`, a: house.strong }, { q: `როგორ წავიკითხო ჩემი ${house.number}-ე სახლი?`, a: house.reading }];
  const current = HOUSE_GUIDES.findIndex((item) => item.number === house.number); const prev = HOUSE_GUIDES[(current + 11) % 12]; const next = HOUSE_GUIDES[(current + 1) % 12];
  const ld = [articleLd({ url, headline: title, description, datePublished: "2026-07-27T00:00:00+04:00" }), breadcrumbLd([{ name: "მთავარი", url: BASE }, { name: "ასტროლოგიური სახლები", url: `${BASE}/astrologiuri-saxlebi` }, { name: `${house.number}-ე სახლი`, url }]), faqLd(faq)];
  return <GuideShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} /><article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-7 sm:px-6 sm:pt-12"><GuideBreadcrumbs items={[{ href: "/astrologiuri-saxlebi", label: "ასტროლოგიური სახლები" }, { href: `/astrologiuri-saxlebi/${house.number}`, label: `${house.number}-ე სახლი` }]} /><header><div className="flex size-16 items-center justify-center rounded-2xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/12 text-3xl font-semibold text-[var(--vivida-violet)]">{house.number}</div><h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{house.number}-ე სახლი ასტროლოგიაში: {house.name}</h1><p className="mt-5 text-lg leading-8 text-foreground/80">{house.area}. მთავარი კითხვა: <strong className="text-foreground">„{house.question}“</strong></p><ul className="mt-5 flex flex-wrap gap-2">{house.keywords.map((word) => <li key={word} className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/75">{word}</li>)}</ul></header><section className="mt-10 space-y-5"><div className="rounded-2xl border border-border bg-card/55 p-6"><h2 className="text-2xl font-semibold">რას ნიშნავს {house.number}-ე სახლი</h2><p className="mt-4 leading-8 text-foreground/82">{house.meaning}</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-border bg-card/50 p-5"><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">ბუნებრივი ანალოგი</p><p className="mt-2 text-lg font-semibold">{house.sign}</p></div><div className="rounded-2xl border border-border bg-card/50 p-5"><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">სიმბოლური მმართველი</p><p className="mt-2 text-lg font-semibold">{house.planet}</p></div></div><div className="rounded-2xl border border-border bg-card/55 p-6"><h2 className="text-2xl font-semibold">თუ ეს სახლი ძლიერია</h2><p className="mt-4 leading-8 text-foreground/82">{house.strong}</p></div><div className="rounded-2xl border border-border bg-card/55 p-6"><h2 className="text-2xl font-semibold">როგორ წავიკითხოთ სწორად</h2><p className="mt-4 leading-8 text-foreground/82">{house.reading}</p></div></section><FaqList items={faq} /><nav aria-label="სხვა სახლები" className="mt-10 grid grid-cols-2 gap-3"><Link href={`/astrologiuri-saxlebi/${prev.number}`} className="rounded-xl border border-border bg-card/40 p-4 text-sm hover:border-foreground/25">← {prev.number}-ე სახლი</Link><Link href={`/astrologiuri-saxlebi/${next.number}`} className="rounded-xl border border-border bg-card/40 p-4 text-right text-sm hover:border-foreground/25">{next.number}-ე სახლი →</Link></nav><NatalCta title={`ნახე შენი ${house.number}-ე სახლი`} /></article></GuideShell>;
}
