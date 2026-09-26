"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";

type LinkProps = ComponentProps<typeof Link>;

export function TrackedPublicLink({
  event,
  target,
  feature,
  surface,
  locale = "ka",
  onClick,
  ...props
}: LinkProps & {
  event: "dream" | "moon" | "next";
  target: string;
  feature: string;
  surface: string;
  locale?: string;
}) {
  const name =
    event === "dream"
      ? ANALYTICS_EVENT.dreamSymbolSelected
      : event === "moon"
        ? ANALYTICS_EVENT.moonSectionSelected
        : ANALYTICS_EVENT.publicNextLinkSelected;
  const targetKey =
    event === "dream" ? "symbol" : event === "moon" ? "section" : "destination";

  return (
    <Link
      {...props}
      onClick={(click) => {
        trackEvent(name, {
          ...productEventBase(feature, surface, locale),
          [targetKey]: target,
        });
        onClick?.(click);
      }}
    />
  );
}
