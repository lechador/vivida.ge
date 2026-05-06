import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { applyUnsubscribe, isUnsubscribeType } from "@/lib/unsubscribe";

export const metadata = { title: "გამოწერის გაუქმება" };
export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  daily: "ყოველდღიური ჰოროსკოპის წერილები",
  marketing: "სიახლეები და სარეკლამო წერილები",
  nudges: "შეხსენებები",
  all: "ყველა მარკეტინგული წერილი",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; type?: string }>;
}) {
  const { token, type: rawType } = await searchParams;
  const type = rawType && isUnsubscribeType(rawType) ? rawType : "all";

  let status: "missing" | "not_found" | "ok" = "missing";
  let email: string | null = null;
  if (token) {
    const r = await applyUnsubscribe(token, type);
    if (r) {
      status = "ok";
      email = r.email;
    } else {
      status = "not_found";
    }
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.28_0.12_300/0.4),transparent_70%)]"
      />
      <Starfield count={60} />

      <section className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="rounded-2xl border border-border bg-card/65 p-8 ring-1 ring-foreground/5 backdrop-blur-xl">
          {status === "ok" ? (
            <>
              <h1 className="mb-3 text-2xl font-semibold tracking-tight">
                გამოწერა გაუქმდა
              </h1>
              <p className="text-sm text-muted-foreground">
                {email ? <>{email} — </> : null}
                <span className="text-foreground">{LABELS[type]}</span>{" "}
                გამორთულია. შესაძლოა რამდენიმე წუთში მაინც მიიღო წერილი,
                რომელიც უკვე იგზავნებოდა გაუქმებამდე.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                შენი არჩევანი ნებისმიერ დროს შეგიძლია შეცვალო ანგარიშის
                გვერდზე.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild>
                  <Link href="/account">ანგარიში</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">მთავარი</Link>
                </Button>
              </div>
            </>
          ) : status === "not_found" ? (
            <>
              <h1 className="mb-3 text-2xl font-semibold tracking-tight">
                ბმული აღარ მოქმედებს
              </h1>
              <p className="text-sm text-muted-foreground">
                ეს გამოწერის ბმული უცნობია — შესაძლოა უკვე გამოყენებულია ან
                ანგარიში წაიშალა. გამოწერების მართვა შეგიძლია ანგარიშის
                გვერდზე.
              </p>
              <div className="mt-6 flex justify-center">
                <Button asChild>
                  <Link href="/account">ანგარიშში გადასვლა</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="mb-3 text-2xl font-semibold tracking-tight">
                გამოწერის ბმული არასწორია
              </h1>
              <p className="text-sm text-muted-foreground">
                ბმულს აკლია token. გამოწერების მართვა შეგიძლია ანგარიშის
                გვერდზე.
              </p>
              <div className="mt-6 flex justify-center">
                <Button asChild>
                  <Link href="/account">ანგარიშში გადასვლა</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
