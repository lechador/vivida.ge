import Link from "next/link";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";

export const metadata = { title: "გადახდა გაუქმებულია · Vivida" };

export default function BillingCancelPage() {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_30%,oklch(0.22_0.05_280/0.5),transparent_70%)]"
      />
      <Starfield count={60} />

      <section className="relative z-10 mx-auto max-w-md px-6 text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl border border-border bg-card/60">
          <CircleAlert className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          გადახდა გაუქმდა
        </h1>
        <p className="mt-4 text-muted-foreground">
          არ ინერვიულო, ხელახლა ცდა ნებისმიერ დროს შეგიძლია. შენი მონაცემები
          შენახულია.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">მთავარ გვერდზე</Link>
          </Button>
          <Button asChild variant="mystic" size="lg">
            <Link href="/pricing">თავიდან ცდა</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
