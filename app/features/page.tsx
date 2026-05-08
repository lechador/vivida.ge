import Link from "next/link";
import {
  Brain,
  Compass,
  Globe2,
  Heart,
  MessageCircle,
  Sparkles,
  Sun,
  UserCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";

export const metadata = {
  title: "ფუნქციები",
  description:
    "ნატალური რუკა, ყოველდღიური პროგნოზი, თავსებადობა, AI ანალიზი, საჯარო პროფილი — Vivida-ს ყველა ფუნქცია ერთ ადგილას.",
};

type Feature = {
  Icon: LucideIcon;
  title: string;
  body: string;
  hue: string;
  isPro?: boolean;
};

const FEATURES: Feature[] = [
  {
    Icon: Sun,
    title: "ყოველდღიური პროგნოზი",
    body: "შენი დღევანდელი ცა — ერთხელ დაგენერირებული, შენი ნატალური რუკით პერსონალიზებული. ემოციური ფონი, შესაძლებლობა, ფოკუსის ზონა.",
    hue: "oklch(0.82 0.16 80)",
  },
  {
    Icon: Compass,
    title: "სრული ნატალური რუკა",
    body: "ცოცხალი ვიზუალი — 12 ნიშანი, 12 სახლი, 10+ პლანეტა, ყველა ასპექტი. შენი დიდი სამეული (მზე, მთვარე, ამომავალი) ცენტრში.",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    Icon: Heart,
    title: "თავსებადობა (Synastry)",
    body: "ნახე ვისთან რეზონირებ კოსმოსურად — სიყვარული, მეგობრობა, კომუნიკაცია, ზრდა, ქიმია. პროცენტი + დეტალური ახსნა.",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    Icon: Brain,
    title: "AI ინტერპრეტაცია",
    body: "შენი რუკის ემოციური პორტრეტი, შექმნილი AI-ს მიერ. არა ზოგადი ჰოროსკოპი — შენი მონაცემების მიხედვით პერსონალური ანალიზი.",
    hue: "oklch(0.78 0.15 195)",
    isPro: true,
  },
  {
    Icon: Sparkles,
    title: "მნიშვნელოვანი შტრიხები",
    body: "Pro AI შენს რუკაში ყველაზე საინტერესო კავშირებს პოულობს — სტელიუმები, ძლიერი ასპექტები, უნიკალური აქცენტები.",
    hue: "oklch(0.72 0.22 350)",
    isPro: true,
  },
  {
    Icon: UserCircle,
    title: "საჯარო პროფილი",
    body: "შექმენი @username, ატვირთე ფოტოები, დაწერე ბიო — სხვებმა აღმოგაჩინონ შენი ნიშნით და მაშინვე ნახონ თქვენი თავსებადობა.",
    hue: "oklch(0.72 0.18 145)",
  },
  {
    Icon: Globe2,
    title: "აღმოაჩინე ცა",
    body: "Vivida გიჩვენებს თავსებად ხალხს — შენი დომინანტი ელემენტის მიხედვით, შენი ნიშნით, ან უბრალოდ ვინც ახლოს არის.",
    hue: "oklch(0.78 0.15 195)",
  },
  {
    Icon: Users,
    title: "მეგობრების წრე",
    body: "მეგობრების მოწვევა, შემოსული მოთხოვნები, თქვენი თავსებადობა ერთი დაკლიკვით. შენი კოსმიური წრე ერთ ადგილას.",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    Icon: MessageCircle,
    title: "პირდაპირი შეტყობინებები",
    body: "ისაუბრე მეგობრებთან რეალურ დროში — write receipts, typing indicators, ფონური შეტყობინებები. ყველაფერი როგორც უნდა იყოს.",
    hue: "oklch(0.78 0.18 305)",
  },
];

export default function FeaturesPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(50%_40%_at_30%_40%,oklch(0.40_0.18_305/0.18),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />

      <SmartHeader active="features" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ფუნქციები
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          ყველაფერი, რაც{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            შენს რუკას
          </span>{" "}
          ცოცხალს ხდის
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          Vivida არ არის უბრალო ჰოროსკოპის აპი. ეს არის შენი პერსონალური
          კოსმიური თანამგზავრი — დაბადებიდან ყოველდღიურ გადაწყვეტილებებამდე.
        </p>

        <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
              style={
                {
                  ["--feat-hue" as string]: feature.hue,
                } as React.CSSProperties
              }
            >
              <div
                aria-hidden
                className="absolute -right-12 -top-12 size-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                style={{
                  background: `radial-gradient(circle, ${feature.hue} 0%, transparent 70%)`,
                }}
              />
              <div className="relative">
                <div
                  className="mb-4 grid size-12 place-items-center rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklch, var(--feat-hue) 22%, transparent), color-mix(in oklch, var(--feat-hue) 8%, transparent))",
                    boxShadow:
                      "inset 0 0 0 1px color-mix(in oklch, var(--feat-hue) 32%, transparent)",
                  }}
                >
                  <feature.Icon
                    className="size-5"
                    style={{
                      color: feature.hue,
                      filter: `drop-shadow(0 0 6px ${feature.hue})`,
                    }}
                  />
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h2>
                  {feature.isPro && (
                    <span className="rounded-full bg-[var(--vivida-violet)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--vivida-violet)] ring-1 ring-[var(--vivida-violet)]/30">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-pretty text-sm leading-relaxed text-foreground/85">
                  {feature.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            ყველაფერი ერთ ადგილას
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            დაიწყე უფასოდ. გადადი Pro-ზე როცა გინდა, რომ უფრო ღრმად შეიცნო შენი
            კოსმოსი.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="mystic" size="lg">
              <Link href="/signup">დაიწყე უფასოდ</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">ფასები</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
