import interpEn from "@/lib/seo/interpretation-library-en.json";
import houseEn from "@/lib/seo/house-library-en.json";
import aspectEn from "@/lib/seo/aspect-library-en.json";

export function getLibraryEntryEn(subject: string, sign: string): string | undefined {
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

export { interpEn, houseEn, aspectEn };
