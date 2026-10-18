export type EnglishEclipse = {
  slug: string;
  date: string;
  type: "solar" | "lunar";
  subtype: string;
  title: string;
  description: string;
  visibility: string;
  source: string;
};

export const ECLIPSES_EN: EnglishEclipse[] = [
  {
    slug: "2026-08-12-mzis-dabneleba",
    date: "2026-08-12",
    type: "solar",
    subtype: "Total",
    title: "August 12, 2026 Total Solar Eclipse",
    description:
      "A total solar eclipse visible across the Arctic, Greenland, Iceland, and northern Spain, with a partial eclipse across Europe.",
    visibility:
      "Totality crosses Greenland, western Iceland, and northern Spain; partial phases are visible across much of Europe and North America.",
    source: "https://science.nasa.gov/eclipses/",
  },
  {
    slug: "2026-08-28-mtvaris-dabneleba",
    date: "2026-08-28",
    type: "lunar",
    subtype: "Partial",
    title: "August 28, 2026 Partial Lunar Eclipse",
    description:
      "A deep partial lunar eclipse visible across the Americas, Europe, Africa, and western Asia.",
    visibility:
      "Visible across North and South America, Europe, Africa, and parts of western Asia.",
    source: "https://science.nasa.gov/eclipses/",
  },
  {
    slug: "2027-02-06-mzis-dabneleba",
    date: "2027-02-06",
    type: "solar",
    subtype: "Annular",
    title: "February 6, 2027 Annular Solar Eclipse",
    description:
      "An annular solar eclipse tracking across South America, the Atlantic Ocean, and western Africa.",
    visibility:
      "Annularity is visible in Chile, Argentina, and parts of West Africa.",
    source: "https://science.nasa.gov/eclipses/",
  },
  {
    slug: "2027-08-02-mzis-dabneleba",
    date: "2027-08-02",
    type: "solar",
    subtype: "Total",
    title: "August 2, 2027 Total Solar Eclipse",
    description:
      "One of the longest total solar eclipses of the century, crossing southern Spain, North Africa, and the Middle East, with partial visibility in Georgia.",
    visibility:
      "Totality passes through Spain, Morocco, Algeria, Tunisia, Libya, Egypt, and Saudi Arabia; partial phases are visible across Europe and the Caucasus.",
    source: "https://science.nasa.gov/eclipses/",
  },
];

export function eclipseEnBySlug(slug: string): EnglishEclipse | undefined {
  return ECLIPSES_EN.find((e) => e.slug === slug);
}
