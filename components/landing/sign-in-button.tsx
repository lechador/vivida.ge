"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/actions/auth";

export function SignInButton({
  label,
  loadingLabel,
}: {
  label?: string;
  loadingLabel?: string;
} = {}) {
  const [isPending, startTransition] = useTransition();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative inline-block"
    >
      <motion.div
        aria-hidden
        className="absolute -inset-1 rounded-2xl bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-60 blur-xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <Button
        variant="mystic"
        size="xl"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await signInWithGoogle("/feed");
          })
        }
        className="relative bg-[linear-gradient(120deg,var(--vivida-cyan),var(--vivida-pink))] shadow-[0_14px_44px_-10px_oklch(0.78_0.18_200/0.55)]"
      >
        <Sparkles className="size-5" />
        {isPending
          ? loadingLabel ?? "ვარსკვლავებს ვალაგებთ…"
          : label ?? "შექმენი შენი რუკა ახლავე"}
      </Button>
    </motion.div>
  );
}
