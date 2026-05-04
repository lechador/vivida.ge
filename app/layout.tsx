import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ChatShell } from "@/components/chat/chat-shell";
import "./globals.css";

const notoGeorgian = Noto_Sans_Georgian({
  variable: "--font-sans",
  subsets: ["georgian", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vivida — შენი კოსმიური რუკა",
  description:
    "პერსონალური ასტროლოგია, ყოველდღიური ჰოროსკოპი და ნატალური რუკა შენი დაბადების ზუსტი მომენტის მიხედვით. გაიგე, რას ამბობენ შენზე ვარსკვლავები.",
  metadataBase: new URL("https://vivida.ge"),
  openGraph: {
    title: "Vivida — შენი კოსმიური რუკა",
    description:
      "პერსონალური ასტროლოგია, ყოველდღიური ჰოროსკოპი და ნატალური რუკა შენი დაბადების ზუსტი მომენტის მიხედვით.",
    url: "https://vivida.ge",
    siteName: "Vivida",
    type: "website",
    locale: "ka_GE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={`dark ${notoGeorgian.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextTopLoader
          color="oklch(0.78 0.18 305)"
          height={2.5}
          showSpinner={false}
          shadow="0 0 12px oklch(0.78 0.18 305 / 0.6), 0 0 6px oklch(0.78 0.18 305 / 0.4)"
          easing="cubic-bezier(0.22, 1, 0.36, 1)"
          speed={400}
        />
        {children}
        <ChatShell />
      </body>
    </html>
  );
}
