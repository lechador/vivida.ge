import Link from "next/link";
import { ArrowRight, Brain, Fingerprint, Heart, Radar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type CompletedKind = "iq" | "eq" | "big-five" | "astro-mbti" | "famous-zodiac";

const RECOMMENDATIONS: Record<CompletedKind, {
  eyebrow: string;
  title: string;
  description: string;
  items: { href: string; title: string; description: string; Icon: typeof Brain; accent: string }[];
}> = {
  iq: {
    eyebrow: "შემდეგი ნაბიჯი",
    title: "შეავსე შენი სურათი",
    description: "ინტელექტის შემდეგ, გაიგე როგორ ფიქრობ, იღებ გადაწყვეტილებებს და ურთიერთობ სხვა ადამიანებთან.",
    items: [
      { href: "/pirovnebis-testi", title: "Astro-MBTI", description: "აღმოაჩინე შენი ფსიქოლოგიური ტიპი", Icon: Fingerprint, accent: "var(--vivida-violet)" },
      { href: "/eq-testi", title: "EQ ტესტი", description: "ემოციური ინტელექტის ტესტი", Icon: Heart, accent: "var(--vivida-gold)" },
      { href: "/quiz/varskvlavebis-zodiaqo", title: "ვარსკვლავების ზოდიაქო", description: "სწრაფი 20-კითხვიანი ქვიზი", Icon: Sparkles, accent: "var(--vivida-pink)" },
      { href: "/big-five", title: "Big Five ტესტი", description: "პიროვნების 5 თვისება", Icon: Radar, accent: "var(--vivida-violet)" },
    ],
  },
  eq: {
    eyebrow: "შემდეგი ნაბიჯი",
    title: "შეავსე შენი სურათი",
    description: "ემოციური ინტელექტის შემდეგ, გამოსცადე შენი ლოგიკა და აღმოაჩინე ფსიქოლოგიური ტიპი.",
    items: [
      { href: "/iq-testi", title: "IQ ტესტი", description: "25 ადაპტიური ლოგიკური დავალება", Icon: Brain, accent: "var(--vivida-cyan)" },
      { href: "/pirovnebis-testi", title: "Astro-MBTI", description: "აღმოაჩინე შენი ფსიქოლოგიური ტიპი", Icon: Fingerprint, accent: "var(--vivida-violet)" },
      { href: "/big-five", title: "Big Five ტესტი", description: "პიროვნების 5 თვისება", Icon: Radar, accent: "var(--vivida-violet)" },
    ],
  },
  "big-five": {
    eyebrow: "შემდეგი ნაბიჯი",
    title: "შეავსე შენი სურათი",
    description: "პიროვნების პროფილის შემდეგ, გამოსცადე შენი ლოგიკა და ემოციური ინტელექტი.",
    items: [
      { href: "/iq-testi", title: "IQ ტესტი", description: "25 ადაპტიური ლოგიკური დავალება", Icon: Brain, accent: "var(--vivida-cyan)" },
      { href: "/eq-testi", title: "EQ ტესტი", description: "ემოციური ინტელექტის ტესტი", Icon: Heart, accent: "var(--vivida-gold)" },
    ],
  },
  "astro-mbti": {
    eyebrow: "შემდეგი ნაბიჯი",
    title: "გააცანი თავს კიდევ ერთი მხარე",
    description: "შენი ტიპი უკვე იცი — ახლა გამოსცადე ლოგიკა, პატერნები და ანალიტიკური აზროვნება.",
    items: [
      { href: "/iq-testi", title: "IQ ტესტი", description: "25 ადაპტიური ლოგიკური დავალება", Icon: Brain, accent: "var(--vivida-cyan)" },
      { href: "/eq-testi", title: "EQ ტესტი", description: "ემოციური ინტელექტის ტესტი", Icon: Heart, accent: "var(--vivida-gold)" },
      { href: "/quiz/varskvlavebis-zodiaqo", title: "ვარსკვლავების ზოდიაქო", description: "სწრაფი 20-კითხვიანი ქვიზი", Icon: Sparkles, accent: "var(--vivida-pink)" },
      { href: "/big-five", title: "Big Five ტესტი", description: "პიროვნების 5 თვისება", Icon: Radar, accent: "var(--vivida-violet)" },
    ],
  },
  "famous-zodiac": {
    eyebrow: "გინდა მეტი?",
    title: "სცადე სრულფასოვანი ტესტი",
    description: "სწრაფი ქვიზის შემდეგ, აღმოაჩინე შენი პიროვნების ტიპი ან აზროვნების პროფილი.",
    items: [
      { href: "/pirovnebis-testi", title: "Astro-MBTI", description: "60 კითხვა · შენი ფსიქოლოგიური ტიპი", Icon: Fingerprint, accent: "var(--vivida-violet)" },
      { href: "/iq-testi", title: "IQ ტესტი", description: "25 ადაპტიური ლოგიკური დავალება", Icon: Brain, accent: "var(--vivida-cyan)" },
      { href: "/eq-testi", title: "EQ ტესტი", description: "ემოციური ინტელექტის ტესტი", Icon: Heart, accent: "var(--vivida-gold)" },
      { href: "/big-five", title: "Big Five ტესტი", description: "პიროვნების 5 თვისება", Icon: Radar, accent: "var(--vivida-violet)" },
    ],
  },
};

/** A compact result-page engagement surface that leads into a complementary test. */
export function NextTestWidget({ completed }: { completed: CompletedKind }) {
  const recommendation = RECOMMENDATIONS[completed];
  return <section className="mt-8 rounded-3xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{recommendation.eyebrow}</div>
    <h2 className="mt-1 text-lg font-semibold tracking-tight">{recommendation.title}</h2>
    <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{recommendation.description}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{recommendation.items.map(({ href, title, description, Icon, accent }) => <Link key={href} href={href} className="group rounded-2xl border border-border bg-background/35 p-4 transition-colors hover:border-foreground/25"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl" style={{ background: `color-mix(in oklch, ${accent} 15%, transparent)`, color: accent }}><Icon className="size-4" /></span><span className="font-medium">{title}</span><ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></div><p className="mt-2 text-xs text-muted-foreground">{description}</p></Link>)}</div>
    <Button asChild variant="ghost" className="mt-3 px-0 text-[var(--vivida-cyan)] hover:bg-transparent hover:text-[var(--vivida-cyan)]"><Link href="/tests">ყველა ტესტი და ქვიზი <ArrowRight className="size-4" /></Link></Button>
  </section>;
}
