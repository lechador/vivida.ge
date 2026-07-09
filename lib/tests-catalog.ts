/**
 * The catalog of psychological tests shown on the /tests hub. Adding a new test
 * is a single entry here (plus its own pages). Keep the newest/most prominent
 * first — the hub renders them in this order.
 */
export type TestCatalogEntry = {
  slug: string;
  /** Where "start" links to. */
  href: string;
  titleKa: string;
  taglineKa: string;
  descKa: string;
  /** Short meta line, e.g. "60 კითხვა · ~7 წუთი · უფასო". */
  metaKa: string;
  /** True while the test is live; false renders a "მალე" (soon) card. */
  available: boolean;
};

export const TESTS: TestCatalogEntry[] = [
  {
    slug: "astro-mbti",
    href: "/pirovnebis-testi",
    titleKa: "Astro-MBTI",
    taglineKa: "შენი ფსიქოლოგიური ტიპი",
    descKa:
      "აღმოაჩინე შენი პიროვნების ტიპი 16 ტიპიდან — ძლიერი და სუსტი მხარეები, ურთიერთობები, კარიერა და ზრდის გზა.",
    metaKa: "60 კითხვა · ~7 წუთი · უფასო",
    available: true,
  },
];
