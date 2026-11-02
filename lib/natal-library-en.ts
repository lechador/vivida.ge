import interpEn from "@/lib/seo/interpretation-library-en.json";
import houseEn from "@/lib/seo/house-library-en.json";
import aspectEn from "@/lib/seo/aspect-library-en.json";
import {
  getLibraryEntryPl,
  getHouseLibraryEntryPl,
  getAspectLibraryEntryPl,
  interpPl,
  housePl,
  aspectPl,
} from "./natal-library-pl";
import type { UserLocale } from "./i18n/user-locale";

export function getLibraryEntryEn(
  subject: string,
  sign: string,
): string | undefined {
  return (interpEn as Record<string, string>)[`${subject}:${sign}`];
}

export function getHouseLibraryEntryEn(
  kind: "cusp" | "occupant",
  house: number,
  subject: string,
): string | undefined {
  return (houseEn as Record<string, string>)[`${kind}:${house}:${subject}`];
}

export function getAspectLibraryEntryEn(
  a: string,
  b: string,
  kind: string,
): string | undefined {
  const dict = aspectEn as Record<string, string>;
  return (
    dict[`${a}-${b}-${kind}`] ??
    dict[`${b}-${a}-${kind}`] ??
    dict[`${a}:${b}:${kind}`] ??
    dict[`${b}:${a}:${kind}`]
  );
}

export function getLibraryEntry(
  subject: string,
  sign: string,
  locale: UserLocale = "en",
): string | undefined {
  if (locale === "pl") {
    return getLibraryEntryPl(subject, sign) ?? getLibraryEntryEn(subject, sign);
  }
  return getLibraryEntryEn(subject, sign);
}

export function getHouseLibraryEntry(
  kind: "cusp" | "occupant",
  house: number,
  subject: string,
  locale: UserLocale = "en",
): string | undefined {
  if (locale === "pl") {
    return (
      getHouseLibraryEntryPl(kind, house, subject) ??
      getHouseLibraryEntryEn(kind, house, subject)
    );
  }
  return getHouseLibraryEntryEn(kind, house, subject);
}

export function getAspectLibraryEntry(
  a: string,
  b: string,
  kind: string,
  locale: UserLocale = "en",
): string | undefined {
  if (locale === "pl") {
    return (
      getAspectLibraryEntryPl(a, b, kind) ?? getAspectLibraryEntryEn(a, b, kind)
    );
  }
  return getAspectLibraryEntryEn(a, b, kind);
}

export {
  interpEn,
  houseEn,
  aspectEn,
  interpPl,
  housePl,
  aspectPl,
  getLibraryEntryPl,
  getHouseLibraryEntryPl,
  getAspectLibraryEntryPl,
};
