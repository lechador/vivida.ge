import type { LucideIcon } from "lucide-react";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Common section header for /report. Numbered icon container + title +
 * optional subtitle. Visually consistent across all sections so the page
 * feels organized at a glance.
 */
export function SectionHeader({
  number,
  Icon,
  title,
  subtitle,
  locale = "ka",
}: {
  /** Two-digit string like "01", "02" — for visual rhythm */
  number: string;
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
  locale?: UserLocale;
}) {
  return (
    <header className="mb-6 flex items-center gap-4">
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border/80 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/15 ring-1 ring-foreground/10">
        <Icon className="size-5 text-foreground/85" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
          {locale !== "ka" ? "Section" : "სექცია"} {number}
        </div>
        <h2 className="mt-0.5 text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
