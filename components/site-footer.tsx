import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";

const PRODUCT_LINKS = [
  { href: "/features", label: "ფუნქციები" },
  { href: "/how-it-works", label: "როგორ მუშაობს" },
  { href: "/pricing", label: "ფასები" },
];

const LEARN_LINKS = [
  { href: "/zodiac", label: "ცის ნიშნები" },
  { href: "/zodiac/datit", label: "ნიშანი თარიღით" },
  { href: "/zodiac/mtvare", label: "მთვარის ნიშანი" },
  { href: "/zodiac/amomavali", label: "ამომავალი ნიშანი" },
  { href: "/zodiac/elementebi", label: "ელემენტები" },
  { href: "/zodiac/tavsebadoba", label: "თავსებადობა" },
  { href: "/zodiac/gzamkvlevi", label: "სრული გზამკვლევი" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "წესები და პირობები" },
  { href: "/privacy", label: "კონფიდენციალურობა" },
];

/**
 * Site-wide footer for public marketing pages. Authed app pages skip this
 * — they have their own bottom UI density and the chat launcher.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-14 md:flex-row md:items-start md:justify-between">
        {/* Brand block */}
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <VividaMark size={36} id="footer" />
            <span
              className="bg-clip-text text-transparent text-xl font-semibold tracking-tight"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
              }}
            >
              vivida
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            შენი კოსმიური რუკა, ცოცხალი და პერსონალური. ყოველდღიური
            პროგნოზები, ნატალური რუკა და თავსებადობა.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              პროდუქტი
            </h3>
            <ul className="space-y-2 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/85 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              ისწავლე
            </h3>
            <ul className="space-y-2 text-sm">
              {LEARN_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/85 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              სამართლებრივი
            </h3>
            <ul className="space-y-2 text-sm">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/85 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col-reverse items-start justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <p>© {year} Vivida. ყველა უფლება დაცულია.</p>
          <p>დამზადებულია საქართველოში · ✦</p>
        </div>
      </div>
    </footer>
  );
}
