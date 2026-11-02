import { PolishFooter } from "@/components/pl/polish-footer";
import { PolishHeader } from "@/components/pl/polish-header";
import { Starfield } from "@/components/landing/starfield";

export function PolishShell({
  children,
  georgianPath = "/",
}: {
  children: React.ReactNode;
  georgianPath?: string;
}) {
  return (
    <div
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-background"
    >
      <Starfield count={48} />
      <PolishHeader georgianPath={georgianPath} />
      <main className="relative z-10 flex-1">{children}</main>
      <PolishFooter />
    </div>
  );
}
