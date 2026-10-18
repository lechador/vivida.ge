import type { UserLocale } from "@/lib/i18n/locale";

export function internationalPublicPath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  if (path === "/en") return "/";
  if (path.startsWith("/en/")) return path.slice(3);
  return path;
}

export function localizedHref(path: string, locale: UserLocale = "ka"): string {
  if (locale === "en") return internationalPublicPath(path);
  return path;
}
