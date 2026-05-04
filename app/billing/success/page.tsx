import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";

export const metadata = { title: "გადახდა წარმატებულია · Vivida" };

export default function BillingSuccessPage() {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_30%,oklch(0.32_0.18_305/0.5),transparent_70%)]"
      />
      <Starfield count={90} />

      <section className="relative z-10 mx-auto max-w-md px-6 text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] shadow-[0_0_60px_-10px_oklch(0.78_0.18_305/0.6)]">
          <Sparkles className="size-8 text-background" />
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          კეთილი იყოს შენი მობრძანება{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            Pro
          </span>
          -ში ✨
        </h1>
        <p className="mt-4 text-muted-foreground">
          გადახდა წარმატებით დასრულდა! დაბრუნდი მთავარ გვერდზე — შენი Pro
          ფუნქციები სულ მალე გაგიაქტიურდება.
        </p>
        <Button asChild variant="mystic" size="lg" className="mt-8">
          <Link href="/dashboard">ჩემს რუკაზე დაბრუნება</Link>
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          შენი გამოწერის სტატუსის ნახვა შეგიძლია{" "}
          <Link href="/account" className="underline underline-offset-4">
            ანგარიშის გვერდზე
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
