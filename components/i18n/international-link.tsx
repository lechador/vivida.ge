import NextLink from "next/link";
import type { ComponentProps } from "react";

import { localeHref } from "@/lib/i18n/armenian-routes";
import type { UserLocale } from "@/lib/i18n/user-locale";

type LinkProps = ComponentProps<typeof NextLink>;

function localizedHref(href: LinkProps["href"], locale: UserLocale) {
  if (typeof href === "string") return localeHref(href, locale);
  if (!href.pathname || typeof href.pathname !== "string") return href;

  return {
    ...href,
    pathname: localeHref(href.pathname, locale),
  };
}

function InternationalLink({ locale, ...props }: LinkProps & { locale: UserLocale }) {
  return <NextLink {...props} href={localizedHref(props.href, locale)} />;
}

/** Keeps English content links on the public, English-readable URL vocabulary. */
export function EnglishLink(props: LinkProps) {
  return <InternationalLink {...props} locale="en" />;
}

/** Prefixes Armenian links with /am and uses the international URL vocabulary. */
export function ArmenianLink(props: LinkProps) {
  return <InternationalLink {...props} locale="am" />;
}
