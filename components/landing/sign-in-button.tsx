"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/actions/auth";

export function SignInButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative inline-block"
    >
      <div
        aria-hidden
        className="absolute -inset-1 rounded-2xl bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-60 blur-xl"
      />
      <Button
        variant="mystic"
        size="xl"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await signInWithGoogle("/dashboard");
          })
        }
        className="relative"
      >
        <Sparkles className="size-5" />
        {isPending ? "ვარსკვლავებს ვალაგებთ…" : "შემოდი Google-ით — გახსენი შენი რუკა"}
      </Button>
    </motion.div>
  );
}
