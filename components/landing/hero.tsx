"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

import { SignInButton } from "./sign-in-button";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: EASE_OUT_EXPO },
  }),
};

export function Hero() {
  return (
    <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-32 text-center sm:pt-32">
      <motion.span
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur"
      >
        <span className="size-1.5 rounded-full bg-[var(--vivida-cyan)] vivida-pulse" />
        ახალი · შენი დაბადების მომენტის მიხედვით
      </motion.span>

      <motion.h1
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
      >
        შენი{" "}
        <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
          კოსმიური რუკა
        </span>
        ,<br className="hidden sm:block" /> ახსნილი ყოველდღე.
      </motion.h1>

      <motion.p
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground sm:text-xl"
      >
        Vivida შენი დაბადების ზუსტ მომენტს ცოცხალ, პირად გზამკვლევად აქცევს —
        ყოველდღიური პროგნოზები, სრული ნატალური რუკა და თავსებადობა საყვარელ
        ადამიანებთან.
      </motion.p>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-10"
      >
        <SignInButton />
      </motion.div>

      <motion.p
        custom={4}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-4 text-xs text-muted-foreground/80"
      >
        უფასო · ბარათი არ სჭირდება · 60 წამში
      </motion.p>

      <motion.p
        custom={5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-3 text-sm text-muted-foreground"
      >
        ან დარეგისტრირდი{" "}
        <Link
          href="/signup"
          className="text-foreground underline-offset-2 hover:underline"
        >
          ელფოსტით
        </Link>
        {" · "}
        <Link
          href="/login"
          className="text-foreground underline-offset-2 hover:underline"
        >
          შესვლა
        </Link>
      </motion.p>
    </section>
  );
}
