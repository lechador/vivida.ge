import Link from "next/link";
import {
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  Telescope,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";

export const metadata = {
  title: "როგორ მუშაობს · Vivida",
  description:
    "ნახე როგორ ქმნის Vivida შენს პერსონალურ კოსმიურ რუკას — დაბადების მონაცემიდან AI ინტერპრეტაციამდე.",
};

type Step = {
  number: string;
  Icon: LucideIcon;
  title: string;
  body: string;
  hue: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    Icon: UserPlus,
    title: "შემოდი Google-ით",
    body: "ერთი დაკლიკებით — ანგარიშის შექმნა არ გჭირდება. პაროლი, დადასტურებები, არაფერი. პირდაპირ კოსმოსში გადადი.",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    number: "02",
    Icon: Calendar,
    title: "შეიყვანე დაბადების მონაცემები",
    body: "თარიღი, დრო და ადგილი. ჩვენ ვიპოვით ზუსტ კოორდინატებს და დროის სარტყელს, რომ შენი რუკა ვამცნოთ წამის სიზუსტით.",
    hue: "oklch(0.85 0.16 85)",
  },
  {
    number: "03",
    Icon: Compass,
    title: "ნახე შენი ნატალური რუკა",
    body: "ცის რუკა, რომელიც დახვდა შენს დაბადებას — მზე, მთვარე, ამომავალი ნიშანი, 12 სახლი, ყველა ასპექტი. ცოცხალი ვიზუალით.",
    hue: "oklch(0.78 0.15 195)",
  },
  {
    number: "04",
    Icon: Sparkles,
    title: "მიიღე AI ინტერპრეტაცია",
    body: "ჩვენი AI შენი რუკის ემოციური პორტრეტს ქმნის — შენი დიდი სამეული, ძლიერი მხარეები და ცხოვრების ძირითადი თემები ცოცხალ ენაზე.",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    number: "05",
    Icon: Telescope,
    title: "აღმოაჩინე თავსებადი ხალხი",
    body: "Vivida გიჩვენებს ვისთან რეზონირებ კოსმოსურად — სიყვარული, მეგობრობა, კომუნიკაცია, ზრდა, ქიმია. ხუთ სფეროში.",
    hue: "oklch(0.72 0.22 350)",
  },
  {
    number: "06",
    Icon: MapPin,
    title: "გაუზიარე სამყაროს",
    body: "შექმენი საჯარო პროფილი — სხვებმა აღმოგაჩინონ შენი ნიშნით ან @username-ით. ყოველთვის შენი არჩევანია, რას აჩვენებ.",
    hue: "oklch(0.72 0.18 145)",
  },
];

export default function HowItWorksPage() {
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

      <SmartHeader active="how-it-works" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          როგორ მუშაობს
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          ექვსი ნაბიჯი{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            შენს კოსმოსამდე
          </span>
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          Vivida გადააქცევს შენი დაბადების ზუსტ მომენტს ცოცხალ, პირად
          გზამკვლევად. გზა რამდენიმე წუთიანია — შედეგი მთელი ცხოვრებისთვის.
        </p>

        <div className="mt-12 space-y-4 sm:space-y-5">
          {STEPS.map((step) => (
            <article
              key={step.number}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15 sm:p-7"
              style={
                {
                  ["--step-hue" as string]: step.hue,
                } as React.CSSProperties
              }
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 size-44 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                style={{
                  background: `radial-gradient(circle, ${step.hue} 0%, transparent 70%)`,
                }}
              />
              <div className="relative flex items-start gap-4 sm:gap-6">
                <div
                  className="grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-semibold tabular-nums sm:size-16 sm:text-3xl"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklch, var(--step-hue) 22%, transparent), color-mix(in oklch, var(--step-hue) 8%, transparent))",
                    boxShadow:
                      "inset 0 0 0 1px color-mix(in oklch, var(--step-hue) 32%, transparent)",
                    color: step.hue,
                  }}
                >
                  {step.number}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <step.Icon
                      className="size-5 shrink-0"
                      style={{
                        color: step.hue,
                        filter: `drop-shadow(0 0 6px ${step.hue})`,
                      }}
                    />
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-pretty text-base text-foreground/85 sm:text-lg">
                    {step.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            მზად ხარ შენი ცის სანახავად?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            დაიწყე უფასოდ. ნატალური რუკა, ყოველდღიური პროგნოზი და თავსებადობა
            ყოველთვის შენთან.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">დაიწყე უფასოდ</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
