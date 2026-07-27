import Link from "next/link";
import { Languages } from "lucide-react";

export function GeorgianContentNote({ href, label = "Open the Georgian version" }: { href: string; label?: string }) {
  return (
    <aside className="rounded-2xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/8 p-4 text-sm text-foreground/85 sm:p-5">
      <div className="flex items-start gap-3">
        <Languages className="mt-0.5 size-5 shrink-0 text-[var(--vivida-violet)]" />
        <div>
          <p className="font-medium text-foreground">Detailed readings are currently in Georgian</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            The core guide is translated, while personalized interpretations and some interactive tools remain in Georgian during this first release.
          </p>
          <Link href={href} hrefLang="ka-GE" className="mt-2 inline-block font-medium text-[var(--vivida-cyan)] hover:underline">
            {label} →
          </Link>
        </div>
      </div>
    </aside>
  );
}
