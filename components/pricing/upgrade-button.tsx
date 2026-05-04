"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { IntervalId } from "@/lib/pricing";

export function UpgradeButton({
  interval,
  className,
  size = "lg",
  label,
  authed,
}: {
  interval: IntervalId;
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
  label?: string;
  /** Pre-fetched: when false, route to / instead of attempting checkout */
  authed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="mystic"
      size={size}
      disabled={isPending}
      className={className}
      onClick={() => {
        if (!authed) {
          router.push("/?from=pricing");
          return;
        }
        startTransition(async () => {
          try {
            const res = await fetch("/api/flitt/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan: "pro", interval }),
            });
            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as {
                error?: string;
                message?: string;
              };
              if (data.error === "flitt_not_configured") {
                alert(
                  "გადახდები ჯერ არ არის ჩართული. დაამატე FLITT_MERCHANT_ID და FLITT_SECRET_KEY .env.local ფაილში."
                );
                return;
              }
              alert(data.message ?? `შეცდომა: ${res.status}`);
              return;
            }
            const data = (await res.json()) as { checkoutUrl: string };
            window.location.href = data.checkoutUrl;
          } catch (err) {
            alert(`შეცდომა: ${(err as Error).message}`);
          }
        });
      }}
    >
      <Sparkles />
      {isPending ? "გადამისამართება…" : label ?? "გადადი Pro-ზე"}
    </Button>
  );
}
