import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";

const PRODUCT_LINKS = [
  { href: "/nataluri-ruka", label: "ნატალური რუკა" },
  { href: "/piradi-ruka", label: "პირადი რუკა" },
  { href: "/features", label: "ფუნქციები" },
  { href: "/how-it-works", label: "როგორ მუშაობს" },
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

const TOOL_LINKS = [
  { href: "/horoskopi", label: "დღის ჰოროსკოპი" },
  { href: "/horoskopi/kvireuli", label: "კვირის ჰოროსკოპი" },
  { href: "/horoskopi/tviuri", label: "თვის ჰოროსკოპი" },
  { href: "/taro", label: "ტარო" },
  { href: "/tests", label: "ტესტები" },
  { href: "/numerologia", label: "ნუმეროლოგია" },
  { href: "/chinuri-horoskopi", label: "ჩინური ჰოროსკოპი" },
  { href: "/astrologiuri-kalendari", label: "ასტროლოგიური კალენდარი" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "წესები და პირობები" },
  { href: "/privacy", label: "კონფიდენციალურობა" },
  { href: "/en", label: "English" },
];

/**
 * Site-wide footer for public marketing pages. Authed app pages skip this
 * — they have their own bottom UI density and the chat launcher.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-14 md:flex-row md:items-start md:justify-between">
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

      {/* Payments + apps row */}
      <div className="border-t border-border/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between">
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
              <StoreBadge>
                <AppStoreBadge />
              </StoreBadge>
              <StoreBadge>
                <PlayStoreBadge />
              </StoreBadge>
            </div>
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

function StoreBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-disabled
      title="აპი მუშავდება"
      className="relative inline-flex opacity-65 transition-opacity hover:opacity-90"
    >
      {children}
      <span className="absolute -right-1.5 -top-1.5 inline-flex items-center rounded-full border border-[var(--vivida-pink)]/45 bg-background px-1.5 py-px text-[8px] font-semibold uppercase tracking-wider text-[var(--vivida-pink)]">
        მალე
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

/**
 * Google Pay official wordmark — the "G Pay" lockup with the Google
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
      {/* G in circle — uses Google's 4 brand colors */}
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
 * Apple Pay official wordmark — the Apple "" glyph + "Pay".
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

/**
 * Apple App Store badge — black rounded rectangle with the Apple logo,
 * "Download on the" caption and "App Store" wordmark. Simplified from
 * Apple's official marketing badge.
 */
function AppStoreBadge() {
  return (
    <svg
      viewBox="0 0 124 40"
      className="h-9 w-auto"
      role="img"
      aria-label="Download on the App Store"
    >
      <rect
        width="124"
        height="40"
        rx="6"
        fill="#000"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
      />
      {/* Apple logo */}
      <path
        d="M19.6 13.4c.55-.66.92-1.58.82-2.5-.79.04-1.74.52-2.3 1.18-.5.59-.94 1.55-.83 2.45.88.07 1.78-.45 2.3-1.13zM20.4 14.7c-1.27-.07-2.36.72-2.97.72-.6 0-1.55-.69-2.55-.67-1.31.02-2.52.76-3.19 1.94-1.36 2.36-.35 5.86 1 7.78.65.94 1.43 2 2.45 1.96 1-.04 1.36-.63 2.55-.63 1.18 0 1.5.63 2.55.61 1.05-.02 1.71-.95 2.36-1.9.74-1.09 1.05-2.13 1.06-2.18-.02-.01-2.04-.78-2.06-3.1-.02-1.94 1.59-2.87 1.66-2.92-.91-1.34-2.31-1.49-2.81-1.51z"
        fill="#fff"
      />
      {/* Captions */}
      <text
        x="33"
        y="17"
        fontFamily="-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"
        fontSize="7"
        fill="#fff"
      >
        Download on the
      </text>
      <text
        x="33"
        y="30"
        fontFamily="-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"
        fontSize="14"
        fontWeight="600"
        fill="#fff"
      >
        App Store
      </text>
    </svg>
  );
}

/**
 * Google Play (Play Store) badge — black rounded rectangle with the
 * 4-color Play triangle, "GET IT ON" caption and "Google Play"
 * wordmark. Simplified from Google's official Play badge.
 */
function PlayStoreBadge() {
  return (
    <svg
      viewBox="0 0 134 40"
      className="h-9 w-auto"
      role="img"
      aria-label="Get it on Google Play"
    >
      <rect
        width="134"
        height="40"
        rx="6"
        fill="#000"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
      />
      {/* Play triangle composed of 4 colored shapes */}
      <g transform="translate(11.5, 9.5)">
        <path d="M0 0v21l11.2-10.5L0 0z" fill="#00C2D6" />
        <path d="M0 0l11.2 10.5L14.7 7 1.7-.7C1-.4.5-.2 0 0z" fill="#FFD400" />
        <path d="M0 21l11.2-10.5L14.7 14 1.7 21.7c-.7-.3-1.2-.5-1.7-.7z" fill="#FF3946" />
        <path d="M14.7 7l-3.5 3.5 3.5 3.5L20 11.6c.6-.4 1-.7 1-1.1 0-.4-.4-.7-1-1.1L14.7 7z" fill="#00E676" />
      </g>
      {/* Captions */}
      <text
        x="40"
        y="17"
        fontFamily="-apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif"
        fontSize="7"
        fill="#fff"
      >
        GET IT ON
      </text>
      <text
        x="40"
        y="30"
        fontFamily="-apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif"
        fontSize="14"
        fontWeight="600"
        fill="#fff"
      >
        Google Play
      </text>
    </svg>
  );
}
