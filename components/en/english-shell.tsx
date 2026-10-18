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
      className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-background"
    >
      <Starfield count={48} />
      <EnglishHeader georgianPath={georgianPath} />
      <main className="relative z-10 flex-1">{children}</main>
      <EnglishFooter />
    </div>
  );
}
