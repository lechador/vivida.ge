import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldAlert, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { astrologyDay, calendarWindow, dayAdvice, WEEKDAYS_KA, type AstrologyCalendarDay, type CalendarTone } from "@/lib/seo/astrology-calendar";

const SITE = "https://www.vivida.ge";
const TONE: Record<CalendarTone, { label: string; color: string; icon: string }> = {
  lucky: { label: "ხელსაყრელი", color: "var(--vivida-cyan)", icon: "✦" },
  balanced: { label: "დაბალანსებული", color: "var(--vivida-violet)", icon: "◐" },
  careful: { label: "ფრთხილი", color: "var(--vivida-pink)", icon: "△" },
};

function DayCard({ day }: { day: AstrologyCalendarDay }) {
  const tone = TONE[day.tone];
  return <Link href={`/astrologiuri-kalendari/${day.iso}`} className="group rounded-2xl border border-border bg-card/55 p-4 transition hover:-translate-y-0.5 hover:border-foreground/20">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">{WEEKDAYS_KA[day.date.getUTCDay()]}</p><h3 className="font-semibold">{day.shortLabel}</h3></div><span className="text-xl" style={{ color: tone.color }}>{tone.icon}</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/8"><div className="h-full rounded-full" style={{ width: `${day.score}%`, background: tone.color }} /></div>
    <div className="mt-2 flex items-center justify-between text-xs"><span style={{ color: tone.color }}>{tone.label}</span><span className="text-muted-foreground">ინდექსი {day.score}/100</span></div>
  </Link>;
}

export function AstrologyCalendarHub({ filter = "all" }: { filter?: "all" | "lucky" | "careful" }) {
  const all = calendarWindow();
  const days = filter === "all" ? all.slice(0, 30) : all.filter((day) => day.tone === filter).slice(0, 24);
  const lucky = all.filter((day) => day.tone === "lucky").slice(0, 5);
  const careful = all.filter((day) => day.tone === "careful").slice(0, 5);
  const config = filter === "lucky"
    ? { title: "იღბლიანი დღეები", intro: "მომდევნო 30 დღეში ჰარმონიული ასპექტებით გამორჩეული თარიღები, დაგეგმვისთვის, ახალი ნაბიჯებისა და მნიშვნელოვანი საუბრებისთვის.", icon: Sparkles, url: "/ighbliani-dgheebi" }
    : filter === "careful"
      ? { title: "ფრთხილი დღეები", intro: "მომდევნო 30 დღეში დაძაბული ასპექტებით გამორჩეული თარიღები, მეტი დაკვირვების, გადამოწმებისა და მშვიდი რეაგირებისთვის.", icon: ShieldAlert, url: "/frtxili-dgheebi" }
      : { title: "ასტროლოგიური კალენდარი", intro: "ყოველი დღის პლანეტარული ასპექტები, ხელსაყრელი და ფრთხილი თარიღები. დაგეგმე მომდევნო 30 დღე რეალურ ტრანზიტებზე დაფუძნებული საერთო ცის სურათით.", icon: CalendarDays, url: "/astrologiuri-kalendari" };
  const faq = [
    { q: "როგორ ითვლება დღის ასტროლოგიური ინდექსი?", a: "ინდექსი ითვალისწინებს იმ დღის პლანეტათაშორის ჰარმონიულ და დაძაბულ ასპექტებს, მათ სიზუსტესა და მონაწილე პლანეტებს. ეს საერთო ცის შეფასებაა და არა პირადი პროგნოზი." },
    { q: "ნიშნავს თუ არა იღბლიანი დღე გარანტირებულ წარმატებას?", a: "არა. ხელსაყრელი დღე მხოლოდ უფრო მხარდამჭერ ასტროლოგიურ ფონს აღნიშნავს; შედეგზე გავლენას ახდენს შენი გადაწყვეტილებები, გარემოებები და მომზადება." },
    { q: "ფრთხილ დღეს მნიშვნელოვანი საქმე უნდა გადავდო?", a: "აუცილებლად არა. ასეთ დღეს სასარგებლოა მეტი დრო, ფაქტების გადამოწმება და ემოციური რეაქციის მართვა. პერსონალური დროისთვის საჭიროა ნატალური რუკის ტრანზიტებიც." },
  ];
  const ld = [articleLd({ url: `${SITE}${config.url}`, headline: config.title, description: config.intro, datePublished: "2026-07-21T00:00:00+04:00", dateModified: new Date().toISOString() }), breadcrumbLd([{ name: "მთავარი", url: SITE }, { name: config.title, url: `${SITE}${config.url}` }]), faqLd(faq), { "@context": "https://schema.org", "@type": "ItemList", itemListElement: days.map((day, index) => ({ "@type": "ListItem", position: index + 1, name: `${day.label}, ${TONE[day.tone].label}`, url: `${SITE}/astrologiuri-kalendari/${day.iso}` })) }];
  const Icon = config.icon;
  return <main className="relative isolate flex min-h-screen flex-col overflow-hidden"><Starfield count={100} shooting={2} /><SmartHeader /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
    <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <header className="max-w-3xl"><Icon className="size-9 text-[var(--vivida-cyan)]" /><h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{config.title}</h1><p className="mt-4 text-lg leading-8 text-foreground/80">{config.intro}</p></header>
      <nav className="mt-7 flex flex-wrap gap-2">{[["/astrologiuri-kalendari", "სრული კალენდარი"], ["/ighbliani-dgheebi", "იღბლიანი დღეები"], ["/frtxili-dgheebi", "ფრთხილი დღეები"], ["/mtvaris-kalendari", "მთვარის კალენდარი"]].map(([href, label]) => <Link key={href} href={href} className={`rounded-full border px-4 py-2 text-sm ${href === config.url ? "border-[var(--vivida-cyan)]/50 bg-[var(--vivida-cyan)]/10" : "border-border bg-card/55 text-muted-foreground hover:text-foreground"}`}>{label}</Link>)}</nav>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{days.map((day) => <DayCard key={day.iso} day={day} />)}</div>
      {filter === "all" && <div className="mt-14 grid gap-6 lg:grid-cols-2"><section><h2 className="text-2xl font-semibold">უახლოესი იღბლიანი დღეები</h2><div className="mt-4 space-y-2">{lucky.map((day) => <DayCard key={day.iso} day={day} />)}</div></section><section><h2 className="text-2xl font-semibold">უახლოესი ფრთხილი დღეები</h2><div className="mt-4 space-y-2">{careful.map((day) => <DayCard key={day.iso} day={day} />)}</div></section></div>}
      <section className="mt-14 max-w-3xl"><h2 className="text-2xl font-semibold">როგორ გამოიყენო კალენდარი</h2><p className="mt-4 leading-8 text-foreground/80">საერთო ასტროლოგიური კალენდარი აჩვენებს კოლექტიურ ფონს. აირჩიე თარიღი, ნახე დღის მთავარი ასპექტები და გამოიყენე რეკომენდაციები დაგეგმვის დამატებით ინსტრუმენტად. ჯანმრთელობის, ფინანსური ან სამართლებრივი გადაწყვეტილება მხოლოდ ასტროლოგიურ შეფასებაზე არ დააფუძნო.</p></section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">ხშირად დასმული კითხვები</h2><div className="mt-5 space-y-3">{faq.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>
    </section><SiteFooter /></main>;
}

export function AstrologyCalendarDetail({ date }: { date: Date }) {
  const day = astrologyDay(date); const advice = dayAdvice(day); const tone = TONE[day.tone];
  const url = `${SITE}/astrologiuri-kalendari/${day.iso}`;
  const faq = [{ q: `${day.shortLabel} იღბლიანი დღეა?`, a: `${advice.title}: ${advice.summary}` }, { q: "ეს პროგნოზი ყველა ადამიანისთვის ერთნაირია?", a: "გვერდი საერთო ცის ასპექტებს აღწერს. პირადი გამოცდილება ნატალური რუკის, მდებარეობისა და ინდივიდუალური გარემოებების მიხედვით განსხვავდება." }];
  const ld = [articleLd({ url, headline: `${day.label}, დღის ასტროლოგიური პროგნოზი`, description: advice.summary, datePublished: "2026-07-21T00:00:00+04:00", dateModified: "2026-08-24T00:00:00+04:00" }), breadcrumbLd([{ name: "მთავარი", url: SITE }, { name: "ასტროლოგიური კალენდარი", url: `${SITE}/astrologiuri-kalendari` }, { name: day.label, url }]), faqLd(faq)];
  return <main className="relative isolate flex min-h-screen flex-col overflow-hidden"><Starfield count={90} shooting={1} /><SmartHeader /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
    <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12"><nav className="text-xs text-muted-foreground"><Link href="/astrologiuri-kalendari" className="hover:text-foreground">ასტროლოგიური კალენდარი</Link> / {day.label}</nav>
      <header className="mt-6 rounded-3xl border border-border bg-card/60 p-6 sm:p-9"><p className="text-sm" style={{ color: tone.color }}>{tone.icon} {advice.title} · ინდექსი {day.score}/100</p><h1 className="mt-3 text-balance text-3xl font-semibold sm:text-4xl">{day.label}, დღის ასტროლოგიური პროგნოზი</h1><p className="mt-4 text-lg leading-8 text-foreground/80">{day.lead}</p><p className="mt-3 leading-7 text-foreground/75">{advice.summary}</p></header>
      <section className="mt-10"><h2 className="text-2xl font-semibold">დღის პლანეტარული ასპექტები</h2><div className="mt-5 space-y-3">{day.sky.aspects.length ? day.sky.aspects.map((aspect) => <div key={`${aspect.aKa}-${aspect.bKa}-${aspect.kindKa}`} className="rounded-2xl border border-border bg-card/50 p-5"><div className="flex items-center justify-between gap-4"><h3 className="font-semibold">{aspect.aSymbol} {aspect.aKa}, {aspect.bSymbol} {aspect.bKa}</h3><span className="text-xs text-muted-foreground">ორბისი {aspect.orb.toFixed(1)}°</span></div><p className="mt-2 text-sm text-foreground/75">{aspect.kindKa} · {aspect.family === "harmonic" ? "ჰარმონიული გავლენა" : aspect.family === "tense" ? "დაძაბული გავლენა" : "ნეიტრალური აქცენტი"}</p></div>) : <p className="text-foreground/75">მკვეთრი ძირითადი ასპექტები არ ფიქსირდება, დღის ტონი შედარებით მშვიდია.</p>}</div></section>
      <section className="mt-10"><h2 className="text-2xl font-semibold">პლანეტები ნიშნებში</h2><div className="mt-4 flex flex-wrap gap-2">{day.sky.planets.map((planet) => <span key={planet.key} className="rounded-full border border-border bg-card/55 px-3 py-2 text-sm">{planet.symbol} {planet.labelKa}, {planet.signSymbol} {planet.signKa}</span>)}</div></section>
      <div className="mt-10 grid gap-4 sm:grid-cols-2"><section className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-5"><h2 className="font-semibold">რა გააკეთო</h2><ul className="mt-3 space-y-2 text-sm leading-6">{advice.do.map((item) => <li key={item}>• {item}</li>)}</ul></section><section className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 p-5"><h2 className="font-semibold">რას მოერიდო</h2><ul className="mt-3 space-y-2 text-sm leading-6">{advice.avoid.map((item) => <li key={item}>• {item}</li>)}</ul></section></div>
      <section className="mt-12"><h2 className="text-2xl font-semibold">ხშირად დასმული კითხვები</h2><div className="mt-5 space-y-3">{faq.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>
      <div className="mt-12 flex flex-wrap gap-3"><Link href="/ighbliani-dgheebi" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">იღბლიანი დღეები <ArrowRight className="size-4" /></Link><Link href="/frtxili-dgheebi" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">ფრთხილი დღეები <ArrowRight className="size-4" /></Link><Link href="/timing" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">ჩემი პერსონალური დღეები <ArrowRight className="size-4" /></Link></div>
    </article><SiteFooter /></main>;
}
