import interpPl from "@/lib/seo/interpretation-library-pl.json";
import housePl from "@/lib/seo/house-library-pl.json";
import aspectPl from "@/lib/seo/aspect-library-pl.json";

export function getLibraryEntryPl(
  subject: string,
  sign: string,
): string | undefined {
  return (interpPl as Record<string, string>)[`${subject}:${sign}`];
}

export function getHouseLibraryEntryPl(
  kind: "cusp" | "occupant",
  house: number,
  subject: string,
): string | undefined {
  return (housePl as Record<string, string>)[`${kind}:${house}:${subject}`];
}

export function getAspectLibraryEntryPl(
  a: string,
  b: string,
  kind: string,
): string | undefined {
  const dict = aspectPl as Record<string, string>;
  return (
    dict[`${a}-${b}-${kind}`] ??
    dict[`${b}-${a}-${kind}`] ??
    dict[`${a}:${b}:${kind}`] ??
    dict[`${b}:${a}:${kind}`]
  );
}

export { interpPl, housePl, aspectPl };
