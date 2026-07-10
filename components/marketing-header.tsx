import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";
import { MarketingCta } from "@/components/marketing-cta";

/**
 * Lightweight header for public marketing pages (/how-it-works, /features,
 * /terms, /privacy). The authed AppHeader is over-featured for these — we
 * just need brand + a few nav links + a CTA.
 */
export function MarketingHeader({
  active,
}: {
  active?: "features" | "how-it-works" | "nataluri-ruka" | "zodiac";
}) {
  const link = (href: string, label: string, key: typeof active) => (
    <Link
      href={href}
      className={
        active === key
          ? "text-foreground transition-colors"
          : "text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {label}
    </Link>
  );

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
      <Link href="/" className="flex items-center gap-2.5">
        <VividaMark size={40} id="marketing-header" />
        <span
          className="bg-clip-text text-transparent text-lg font-semibold tracking-tight sm:text-xl"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
          }}
        >
          vivida
        </span>
      </Link>

      <nav className="hidden items-center gap-7 text-sm sm:flex">
        {link("/nataluri-ruka", "ნატალური რუკა", "nataluri-ruka")}
        {link("/zodiac", "ზოდიაქო", "zodiac")}
        {link("/how-it-works", "როგორ მუშაობს", "how-it-works")}
      </nav>

      <MarketingCta />
    </header>
  );
}
