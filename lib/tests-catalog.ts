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
    slug: "famous-zodiac",
    href: "/quiz/varskvlavebis-zodiaqo",
    titleKa: "ვარსკვლავების ზოდიაქო",
    taglineKa: "გამოიცანი ცნობილი ადამიანების ნიშანი",
    descKa: "10-კითხვიანი სწრაფი ქვიზი — რამდენად კარგად იცნობ მსახიობების, მომღერლებისა და სპორტსმენების ზოდიაქოს ნიშნებს?",
    metaKa: "10 კითხვა · ~2 წუთი · უფასო",
    available: true,
  },
  {
    slug: "iq",
    href: "/iq-testi",
    titleKa: "IQ ტესტი",
    taglineKa: "შენი ინტელექტის კოეფიციენტი",
    descKa:
      "კულტურულად ნეიტრალური, დროზე გათვლილი ტესტი — ლოგიკური, რიცხვითი და სივრცითი აზროვნება. მიიღე შენი IQ ქულა, პროცენტილი და აზროვნების რუკა.",
    metaKa: "25 დავალება · ~25 წუთი · ადაპტიური",
    available: true,
  },
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
