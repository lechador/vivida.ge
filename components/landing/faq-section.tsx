"use client";

import { motion } from "framer-motion";

import { HOME_CONTENT } from "@/lib/seo/home-content";

export function FaqSection() {
  const faq = HOME_CONTENT.faq;

  return (
    <section className="relative z-10 mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 text-center text-3xl font-semibold tracking-tight sm:mb-10 sm:text-4xl"
      >
        ხშირად დასმული კითხვები
      </motion.h2>

      <div className="space-y-3">
        {faq.map((item, i) => (
          <motion.details
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.45,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
              <span>{item.q}</span>
              <span
                aria-hidden
                className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45"
              >
                ✦
              </span>
            </summary>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
              {item.a}
            </p>
          </motion.details>
        ))}
      </div>
    </section>
  );
}
