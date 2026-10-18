import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function AstroGate({
  title = "ეს ფუნქცია ნატალურ რუკას ეფუძნება",
  description = "შეავსე დაბადების მონაცემები და გაიხსნება შენი პერსონალური ასტროლოგიური პროფილი, რუკა, ჰოროსკოპი, თავსებადობა და მეტი.",
  next,
  locale = "ka",
}: {
  title?: string;
  description?: string;
  next?: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const href = next
    ? `/onboarding?next=${encodeURIComponent(next)}`
    : "/onboarding";
  return (
    <div className="mx-auto max-w-lg rounded-md border border-border bg-card p-8 text-center sm:p-10">
      <div className="mx-auto grid size-12 place-items-center rounded-sm border border-border bg-secondary/50 text-primary">
        <Lock className="size-5" />
      </div>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {en ? "NATAL DATA REQUIRED" : "საჭიროა დაბადების მონაცემები"}
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={href}>
          <Sparkles className="size-4" />
          {en ? "Create astro profile" : "ასტრო პროფილის შექმნა"}
        </Link>
      </Button>
    </div>
  );
}
