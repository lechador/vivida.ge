import Link from "next/link";
import { Apple, Smartphone } from "lucide-react";

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
      {/* Test environment notice — kept on top so it can't be missed */}
      <div className="border-b border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs text-[var(--vivida-pink)] sm:px-6">
          <span className="size-1.5 rounded-full bg-[var(--vivida-pink)] vivida-pulse" aria-hidden />
          ეს არის სატესტო ვერსია — Vivida განვითარების ფაზაშია
        </div>
      </div>

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

      {/* Payments + apps row */}
      <div className="border-t border-border/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between">
          {/* Payment methods */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              უსაფრთხო გადახდა
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <PaymentMark><VisaMark /></PaymentMark>
              <PaymentMark><MastercardMark /></PaymentMark>
              <PaymentMark><GooglePayMark /></PaymentMark>
              <PaymentMark><ApplePayMark /></PaymentMark>
            </div>
          </div>

          {/* App store badges (placeholder — apps in development) */}
          <div className="flex flex-col gap-2.5 md:items-end">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              მობილური აპი — მალე
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <StoreBadge icon={<Apple className="size-4" />} brand="App Store" />
              <StoreBadge icon={<Smartphone className="size-4" />} brand="Google Play" />
            </div>
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

function PaymentMark({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 min-w-[44px] items-center justify-center rounded-md border border-border/70 bg-card/40 px-2 backdrop-blur-sm">
      {children}
    </span>
  );
}

function StoreBadge({
  icon,
  brand,
}: {
  icon: React.ReactNode;
  brand: string;
}) {
  return (
    <span
      aria-disabled
      className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/40 px-2.5 py-1.5 text-xs text-muted-foreground"
      title="აპი მუშავდება"
    >
      <span className="text-foreground/70">{icon}</span>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] uppercase tracking-wider opacity-80">
          მუშავდება
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-foreground/85">
          {brand}
        </span>
      </span>
    </span>
  );
}

// ─── Inline payment marks ────────────────────────────────────────────────
// Simple SVGs of the brand wordmarks. Not the official lockups (which are
// trademarked) — just recognizable monochrome-ish placeholders for the
// payment-methods row.

function VisaMark() {
  return (
    <svg
      viewBox="0 0 64 22"
      className="h-3.5 w-auto"
      role="img"
      aria-label="Visa"
    >
      <text
        x="32"
        y="17"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="900"
        fontStyle="italic"
        fill="#1a1f71"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg
      viewBox="0 0 36 22"
      className="h-4 w-auto"
      role="img"
      aria-label="Mastercard"
    >
      <circle cx="13" cy="11" r="9" fill="#eb001b" />
      <circle cx="23" cy="11" r="9" fill="#f79e1b" />
      <path
        d="M18 4.5a9 9 0 0 1 0 13 9 9 0 0 1 0-13z"
        fill="#ff5f00"
      />
    </svg>
  );
}

function GooglePayMark() {
  return (
    <svg
      viewBox="0 0 56 20"
      className="h-3.5 w-auto"
      role="img"
      aria-label="Google Pay"
    >
      <text
        x="0"
        y="15"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="700"
      >
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC04">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
        <tspan fill="currentColor" className="fill-foreground/85"> Pay</tspan>
      </text>
    </svg>
  );
}

function ApplePayMark() {
  return (
    <svg
      viewBox="0 0 56 20"
      className="h-3.5 w-auto"
      role="img"
      aria-label="Apple Pay"
    >
      <g className="fill-foreground/85">
        <path d="M9.6 5.5c.5-.6.8-1.4.8-2.2-.7 0-1.5.4-2 1-.4.5-.9 1.4-.7 2.1.8.1 1.5-.4 1.9-.9zM10.5 6.6c-1.1-.1-2 .6-2.5.6-.6 0-1.4-.6-2.3-.6C4.5 6.7 3 7.6 2.3 9.1c-1 1.6-.3 4 .7 5.3.5.6 1 1.3 1.8 1.3.7 0 1-.4 1.9-.4.9 0 1.1.4 1.9.4.8 0 1.3-.6 1.8-1.2.5-.7.8-1.4.8-1.4-.1 0-1.5-.5-1.5-2.1 0-1.3 1.1-1.9 1.1-1.9-.6-.9-1.5-1-1.8-1z" />
        <text
          x="14"
          y="15"
          fontFamily="Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
        >
          Pay
        </text>
      </g>
    </svg>
  );
}
