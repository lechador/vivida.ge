import { Shield } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "ადმინი" };

/**
 * Shared shell for every /admin/* route. Centralises the `requireAdmin`
 * gate so individual pages don't have to repeat it, and provides a
 * minimal admin chrome (header strip + a few section links).
 *
 * Non-admins hit the redirect inside `requireAdmin` and never see this.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Shield className="size-4 text-[var(--vivida-violet)]" />
            <span className="text-sm font-semibold tracking-tight">
              ვივიდას ადმინი
            </span>
          </div>
          <nav className="flex items-center gap-4 text-xs">
            <Link
              href="/admin/feed"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              ფიდი
            </Link>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground/80">
              {admin.email}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <Link
              href="/feed"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              დაბრუნება
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
