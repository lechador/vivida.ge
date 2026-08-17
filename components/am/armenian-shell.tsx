import { ArmenianFooter } from "@/components/am/armenian-footer";
import { ArmenianHeader } from "@/components/am/armenian-header";
import { Starfield } from "@/components/landing/starfield";

export function ArmenianShell({
  children,
  georgianPath = "/",
  englishPath = "/",
}: {
  children: React.ReactNode;
  georgianPath?: string;
  englishPath?: string;
}) {
  return (
    <div
      lang="hy"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_-5%,oklch(0.30_0.16_305/0.48),transparent_70%),radial-gradient(45%_30%_at_90%_35%,oklch(0.28_0.14_220/0.35),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <ArmenianHeader
        georgianPath={georgianPath}
        englishPath={englishPath}
      />
      <main className="relative z-10 flex-1">{children}</main>
      <ArmenianFooter />
    </div>
  );
}
