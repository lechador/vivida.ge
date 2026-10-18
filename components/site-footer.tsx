import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";
import { EnglishFooter } from "@/components/en/english-footer";
import { InstallAppButton } from "@/components/pwa/install-button";
import type { UserLocale } from "@/lib/i18n/locale";

const PRODUCT_LINKS = [
  { href: "/nataluri-ruka", label: "ნატალური რუკა" },
  { href: "/piradi-ruka", label: "პირადი რუკა" },
  { href: "/features", label: "ფუნქციები" },
  { href: "/how-it-works", label: "როგორ მუშაობს" },
];

const LEARN_LINKS = [
  { href: "/articles", label: "სტატიები" },
  { href: "/zodiac", label: "ცის ნიშნები" },
  { href: "/zodiac/datit", label: "ნიშანი თარიღით" },
  { href: "/zodiac/mtvare", label: "მთვარის ნიშანი" },
  { href: "/zodiac/amomavali", label: "ამომავალი ნიშანი" },
  { href: "/zodiac/elementebi", label: "ელემენტები" },
  { href: "/zodiac/tavsebadoba", label: "თავსებადობა" },
  { href: "/zodiac/gzamkvlevi", label: "სრული გზამკვლევი" },
  { href: "/astrologiuri-saxlebi", label: "ასტროლოგიური სახლები" },
  { href: "/planetebi", label: "პლანეტები" },
];

const TOOL_LINKS = [
  { href: "/horoskopi", label: "დღის ჰოროსკოპი" },
  { href: "/horoskopi/kvireuli", label: "კვირის ჰოროსკოპი" },
  { href: "/taro", label: "ტაროზე მკითხაობა" },
  { href: "/mkitxaoba", label: "მკითხაობა ონლაინ" },
  { href: "/sizmris-akhsna", label: "სიზმრის ახსნა" },
  { href: "/tests", label: "ტესტები" },
  { href: "/iq-testi", label: "IQ ტესტი" },
  { href: "/numerologia", label: "ნუმეროლოგია" },
  { href: "/angeluri-ricxvebi", label: "ანგელოზური რიცხვები" },
  { href: "/chinuri-horoskopi", label: "ჩინური ჰოროსკოპი" },
  { href: "/astrologiuri-kalendari", label: "ასტროლოგიური კალენდარი" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "წესები და პირობები" },
  { href: "/privacy", label: "კონფიდენციალურობა" },
  { href: "/en", label: "English" },
];

/**
 * Site-wide footer for public marketing pages. Authed app pages skip this,
 * they have their own bottom UI density and the chat launcher.
 */
export function SiteFooter({ locale = "ka" }: { locale?: UserLocale } = {}) {
  if (locale === "en") return <EnglishFooter />;

  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16 md:flex-row md:items-start md:justify-between">
        {/* Brand block */}
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <VividaMark size={32} id="footer" />
            <span className="font-display text-2xl font-medium tracking-tight text-foreground">
              Vivida
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            შენი პირადი ასტრონომიული და ასტროლოგიური ალმანახი. ზუსტი ეფემერიდები,
            ნატალური რუკა, ყოველდღიური ტრანზიტები და თავსებადობა.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:gap-10">
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
              ხელსაწყოები
            </h3>
            <ul className="space-y-2 text-sm">
              {TOOL_LINKS.map((link) => (
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

      {/* Payments + web app row */}
      <div className="border-t border-border/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between">
          {/* Payment methods */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              უსაფრთხო გადახდა
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <PaymentMark>
                <VisaMark />
              </PaymentMark>
              <PaymentMark>
                <MastercardMark />
              </PaymentMark>
              <PaymentMark>
                <GooglePayMark />
              </PaymentMark>
              <PaymentMark>
                <ApplePayMark />
              </PaymentMark>
            </div>
          </div>

          <div className="flex max-w-xs flex-col gap-2 md:items-end md:text-right">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Vivida ვებზე
            </span>
            <p className="text-xs leading-relaxed text-foreground/75">
              გამოიყენე ბრაუზერში ან დაამატე მთავარ ეკრანზე სწრაფი წვდომისთვის.
            </p>
            <InstallAppButton locale={locale} surface="site_footer" />
          </div>
        </div>
      </div>

      <div className="border-t border-border/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col-reverse items-start justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
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

// ─── Inline payment marks ────────────────────────────────────────────────
// Simple SVGs of the brand wordmarks. Not the official lockups (which are
// trademarked), just recognizable monochrome-ish placeholders for the
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
      <path d="M18 4.5a9 9 0 0 1 0 13 9 9 0 0 1 0-13z" fill="#ff5f00" />
    </svg>
  );
}

/**
 * Google Pay official wordmark, the "G Pay" lockup with the Google
 * 4-color G in a circle and "Pay" in dark grey. Path data simplified
 * from the published brand asset.
 */
function GooglePayMark() {
  return (
    <svg
      viewBox="0 0 64 24"
      className="h-4 w-auto"
      role="img"
      aria-label="Google Pay"
    >
      {/* G in circle, uses Google's 4 brand colors */}
      <circle cx="11" cy="12" r="10" fill="#fff" />
      <path
        d="M16.5 12.2c0-.5-.04-.97-.13-1.42H11v2.7h3.08c-.13.7-.54 1.3-1.15 1.7v1.4h1.86c1.09-1 1.71-2.48 1.71-4.38z"
        fill="#4285F4"
      />
      <path
        d="M11 17.6c1.55 0 2.86-.51 3.81-1.4l-1.86-1.4c-.52.34-1.18.55-1.95.55-1.5 0-2.77-1.01-3.22-2.37H5.86v1.45c.95 1.88 2.91 3.17 5.14 3.17z"
        fill="#34A853"
      />
      <path
        d="M7.78 12.98c-.12-.34-.18-.7-.18-1.08s.06-.74.18-1.08V9.37H5.86c-.39.77-.61 1.65-.61 2.53 0 .88.22 1.76.61 2.53l1.92-1.45z"
        fill="#FBBC04"
      />
      <path
        d="M11 8.05c.84 0 1.6.29 2.2.86l1.65-1.65C13.86 6.32 12.55 5.8 11 5.8c-2.23 0-4.19 1.29-5.14 3.17l1.92 1.45C8.23 9.06 9.5 8.05 11 8.05z"
        fill="#EA4335"
      />
      {/* Pay wordmark */}
      <text
        x="24"
        y="17"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13"
        fontWeight="600"
        className="fill-foreground/85"
      >
        Pay
      </text>
    </svg>
  );
}

/**
 * Apple Pay official wordmark, the Apple "" glyph + "Pay".
 */
function ApplePayMark() {
  return (
    <svg
      viewBox="0 0 56 20"
      className="h-3.5 w-auto"
      role="img"
      aria-label="Apple Pay"
    >
      <g className="fill-foreground/85">
        {/* Apple logo */}
        <path d="M9.6 5.4c.55-.66.92-1.58.82-2.5-.79.04-1.74.52-2.3 1.18-.5.59-.94 1.55-.83 2.45.88.07 1.78-.45 2.3-1.13zM10.4 6.7c-1.27-.07-2.36.72-2.97.72-.6 0-1.55-.69-2.55-.67-1.31.02-2.52.76-3.19 1.94-1.36 2.36-.35 5.86 1 7.78.65.94 1.43 2 2.45 1.96 1-.04 1.36-.63 2.55-.63 1.18 0 1.5.63 2.55.61 1.05-.02 1.71-.95 2.36-1.9.74-1.09 1.05-2.13 1.06-2.18-.02-.01-2.04-.78-2.06-3.1-.02-1.94 1.59-2.87 1.66-2.92-.91-1.34-2.31-1.49-2.81-1.51z" />
        {/* Pay text */}
        <text
          x="18"
          y="14.5"
          fontFamily="-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"
          fontSize="13"
          fontWeight="600"
        >
          Pay
        </text>
      </g>
    </svg>
  );
}
