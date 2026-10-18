"use client";

import { ArrowRight } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/actions/auth";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

export function SignInButton({
  label,
  loadingLabel,
  size = "xl",
  source = "home_hero",
}: {
  label?: string;
  loadingLabel?: string;
  size?: "default" | "sm" | "lg" | "xl";
  source?: string;
} = {}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="default"
      size={size}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          trackEvent(ANALYTICS_EVENT.homePrimaryCtaClick, {
            surface: source,
            method: "google",
          });
          await signInWithGoogle("/post-login");
        })
      }
      className="px-7 font-semibold tracking-tight"
    >
      <span>
        {isPending
          ? (loadingLabel ?? "რუკა მზადდება…")
          : (label ?? "შექმენი შენი რუკა უფასოდ")}
      </span>
      <ArrowRight className="size-4" />
    </Button>
  );
}
