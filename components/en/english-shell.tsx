import { EnglishFooter } from "@/components/en/english-footer";
import { EnglishHeader } from "@/components/en/english-header";
import { Starfield } from "@/components/landing/starfield";

export function EnglishShell({
  children,
  georgianPath = "/",
}: {
  children: React.ReactNode;
  georgianPath?: string;
}) {
  return (
    <div
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_32%_at_50%_-5%,oklch(0.26_0.12_305/0.32),transparent_70%)]"
      />
      <Starfield count={70} shooting={1} />
      <EnglishHeader georgianPath={georgianPath} />
      <main className="relative z-10 flex-1">{children}</main>
      <EnglishFooter />
    </div>
  );
}
