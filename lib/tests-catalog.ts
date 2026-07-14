/**
 * The catalog of tests and light quizzes shown on /tests. Featured assessments
 * remain pinned above the quick, replayable quiz section.
 */
export type TestCatalogEntry = {
  slug: string;
  kind: "featured" | "quiz";
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
    slug: "iq",
    kind: "featured",
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
    kind: "featured",
    href: "/pirovnebis-testi",
    titleKa: "Astro-MBTI",
    taglineKa: "შენი ფსიქოლოგიური ტიპი",
    descKa:
      "აღმოაჩინე შენი პიროვნების ტიპი 16 ტიპიდან — ძლიერი და სუსტი მხარეები, ურთიერთობები, კარიერა და ზრდის გზა.",
    metaKa: "60 კითხვა · ~7 წუთი · უფასო",
    available: true,
  },
  {
    slug: "famous-zodiac",
    kind: "quiz",
    href: "/quiz/varskvlavebis-zodiaqo",
    titleKa: "ვარსკვლავების ზოდიაქო",
    taglineKa: "გამოიცანი ცნობილი ადამიანების ნიშანი",
    descKa: "10-კითხვიანი სწრაფი ქვიზი — რამდენად კარგად იცნობ მსახიობების, მომღერლებისა და სპორტსმენების ზოდიაქოს ნიშნებს?",
    metaKa: "10 კითხვა · ~2 წუთი · უფასო",
    available: true,
  },
];
