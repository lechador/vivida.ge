import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The "create your astro profile to unlock" card. Shown in place of a feature
 * that needs birth data, so an account without it can still browse the app and
 * opt into astrology when ready (rather than being force-funnelled at signup).
 */
export function AstroGate({
  title = "ეს ფუნქცია ნატალურ რუკას ეფუძნება",
  description = "შეავსე დაბადების მონაცემები და გაიხსნება შენი პერსონალური ასტროლოგიური პროფილი — რუკა, ჰოროსკოპი, თავსებადობა და მეტი.",
  next,
}: {
  title?: string;
  description?: string;
  /** Where to return after onboarding (relative path). */
  next?: string;
}) {
  const href = next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding";
  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
        <Lock className="size-6 text-[var(--vivida-violet)]" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-pretty text-sm text-muted-foreground">
        {description}
      </p>
      <Button asChild variant="mystic" size="lg" className="mt-6">
        <Link href={href}>
          <Sparkles className="size-4" />
          ასტრო პროფილის შექმნა
        </Link>
      </Button>
    </div>
  );
}
