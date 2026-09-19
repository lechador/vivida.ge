import NextLink from "next/link";
import type { ComponentProps } from "react";

import type { UserLocale } from "@/lib/i18n/user-locale";
import { localizedHref } from "@/lib/seo/public-paths";

type LinkProps = ComponentProps<typeof NextLink>;

// Georgian renders the shared route tree as-is; English renders the public,
// English-readable URL vocabulary (rewritten back internally by the proxy).
function InternationalLink({
  locale,
  href,
  ...props
}: LinkProps & { locale: UserLocale }) {
  const resolved =
    typeof href === "string" ? localizedHref(href, locale) : href;
  return <NextLink href={resolved} {...props} />;
}

/** Keeps English content links on the public, English-readable URL vocabulary. */
export function EnglishLink(props: LinkProps) {
  return <InternationalLink {...props} locale="en" />;
}
