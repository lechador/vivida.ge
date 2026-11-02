import type { UserLocale } from "@/lib/i18n/locale";

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
  titleEn: string;
  titlePl?: string;
  taglineKa: string;
  taglineEn: string;
  taglinePl?: string;
  descKa: string;
  descEn: string;
  descPl?: string;
  /** Short meta line, e.g. "60 კითხვა · ~7 წუთი · უფასო". */
  metaKa: string;
  metaEn: string;
  metaPl?: string;
  /** True while the test is live; false renders a "მალე" (soon) card. */
  available: boolean;
  /** Omit for all locales; use this while an assessment has one translation. */
  locales?: UserLocale[];
};

export function getTestTitle(
  test: TestCatalogEntry,
  locale: UserLocale,
): string {
  if (locale === "pl" && test.titlePl) return test.titlePl;
  return locale === "ka" ? test.titleKa : test.titleEn;
}

export function getTestTagline(
  test: TestCatalogEntry,
  locale: UserLocale,
): string {
  if (locale === "pl" && test.taglinePl) return test.taglinePl;
  return locale === "ka" ? test.taglineKa : test.taglineEn;
}

export function getTestDesc(
  test: TestCatalogEntry,
  locale: UserLocale,
): string {
  if (locale === "pl" && test.descPl) return test.descPl;
  return locale === "ka" ? test.descKa : test.descEn;
}

export function getTestMeta(
  test: TestCatalogEntry,
  locale: UserLocale,
): string {
  if (locale === "pl" && test.metaPl) return test.metaPl;
  return locale === "ka" ? test.metaKa : test.metaEn;
}

export const TESTS: TestCatalogEntry[] = [
  {
    slug: "iq",
    kind: "featured",
    href: "/iq-testi",
    titleKa: "IQ ტესტი",
    titleEn: "IQ Test",
    titlePl: "Test IQ",
    taglineKa: "შენი ინტელექტის კოეფიციენტი",
    taglineEn: "Estimate your reasoning ability",
    taglinePl: "Oceń swoje zdolności logicznego myślenia",
    descKa:
      "კულტურულად ნეიტრალური, დროზე გათვლილი ტესტი, ლოგიკური, რიცხვითი და სივრცითი აზროვნება. მიიღე შენი IQ ქულა, პროცენტილი და აზროვნების რუკა.",
    descEn:
      "A timed, culture-fair adaptive assessment of logical, numerical and spatial reasoning. Receive an estimated IQ score, percentile and reasoning profile.",
    descPl:
      "Kulturowo neutralny, adaptacyjny test logicznego, numerycznego i przestrzennego myślenia. Otrzymaj wynik IQ, percentyl i profil myślenia.",
    metaKa: "25 დავალება · ~25 წუთი · ადაპტიური",
    metaEn: "25 tasks · about 25 minutes · adaptive",
    metaPl: "25 zadań · ok. 25 minut · adaptacyjny",
    available: true,
  },
  {
    slug: "eq",
    kind: "featured",
    href: "/eq-testi",
    titleKa: "EQ ტესტი",
    titleEn: "EQ Test",
    titlePl: "Test EQ",
    taglineKa: "შენი ემოციური ინტელექტი",
    taglineEn: "Explore your emotional intelligence",
    taglinePl: "Poznaj swoją inteligencję emocjonalną",
    descKa:
      "თვითშეფასების ტესტი ხუთ სფეროში, თვითშემეცნება, თვითრეგულაცია, მოტივაცია, ემპათია და სოციალური უნარები. მიიღე EQ ქულა და შენი ემოციური რუკა.",
    descEn:
      "A self-report assessment across self-awareness, self-regulation, motivation, empathy and social skills, with a clear emotional profile.",
    descPl:
      "Samoopisowy test w pięciu obszarach: samoświadomość, samoregulacja, motywacja, empatia i umiejętności społeczne. Uzyskaj wynik EQ i profil emocjonalny.",
    metaKa: "40 კითხვა · ~7 წუთი · უფასო",
    metaEn: "40 questions · about 7 minutes · free",
    metaPl: "40 pytań · ok. 7 minut · darmowy",
    available: true,
  },
  {
    slug: "self-esteem",
    kind: "featured",
    href: "/tvit-shepasebis-testi",
    titleKa: "თვითშეფასების ტესტი",
    titleEn: "Self-Esteem Test",
    titlePl: "Test samooceny",
    taglineKa: "როგორ უყურებ საკუთარ თავს?",
    taglineEn: "How do you see yourself?",
    taglinePl: "Jak postrzegasz samego siebie?",
    descKa:
      "Rosenberg-ის 10-კითხვიანი სკალა ზომავს საკუთარი ღირებულების, შესაძლებლობებისა და თავის პატივისცემის საერთო განცდას. შედეგი და რეფლექსიის პერსონალური თემები მყისიერად.",
    descEn:
      "The ten-item Rosenberg scale explores your overall sense of self-worth and self-respect.",
    descPl:
      "10-punktowa skala Rosenberga bada ogólne poczucie własnej wartości i szacunku do siebie. Natychmiastowy wynik i tematy do refleksji.",
    metaKa: "10 კითხვა · ~2 წუთი · უფასო",
    metaEn: "10 questions · about 2 minutes · free",
    metaPl: "10 pytań · ok. 2 minuty · darmowy",
    available: true,
  },
  {
    slug: "big-five",
    kind: "featured",
    href: "/big-five",
    titleKa: "Big Five (დიდი ხუთეული)",
    titleEn: "Big Five Personality Test",
    titlePl: "Test Big Five (Wielka Piątka)",
    taglineKa: "პიროვნების 5 თვისება",
    taglineEn: "Five broad personality traits",
    taglinePl: "Pięć głównych cech osobowości",
    descKa:
      "პიროვნების ყველაზე მეცნიერულად სანდო ტესტი, ღიაობა, კეთილსინდისიერება, ექსტრავერსია, კეთილგანწყობა და ნევროტიზმი. მიიღე შენი პროფილი და რადარი.",
    descEn:
      "Explore openness, conscientiousness, extraversion, agreeableness and neuroticism through the most widely researched personality framework.",
    descPl:
      "Najbardziej rzetelny naukowo test osobowości: otwartość, sumienność, ekstrawersja, ugodowość i neurotyczność. Uzyskaj profil i wykres radarowy.",
    metaKa: "40 კითხვა · ~7 წუთი · უფასო",
    metaEn: "40 questions · about 7 minutes · free",
    metaPl: "40 pytań · ok. 7 minut · darmowy",
    available: true,
  },
  {
    slug: "astro-mbti",
    kind: "featured",
    href: "/pirovnebis-testi",
    titleKa: "Astro-MBTI",
    titleEn: "Astro-MBTI",
    titlePl: "Astro-MBTI",
    taglineKa: "შენი ფსიქოლოგიური ტიპი",
    taglineEn: "Discover your psychological type",
    taglinePl: "Odkryj swój typ psychologiczny",
    descKa:
      "აღმოაჩინე შენი პიროვნების ტიპი 16 ტიპიდან, ძლიერი და სუსტი მხარეები, ურთიერთობები, კარიერა და ზრდის გზა.",
    descEn:
      "Discover your personality among sixteen types, including strengths, challenges, relationships, career patterns and avenues for growth.",
    descPl:
      "Odkryj swój typ osobowości spośród 16 typów: mocne i słabe strony, relacje, kariera oraz ścieżka osobistego rozwoju.",
    metaKa: "60 კითხვა · ~7 წუთი · უფასო",
    metaEn: "60 questions · about 7 minutes · free",
    metaPl: "60 pytań · ok. 7 minut · darmowy",
    available: true,
  },
  {
    slug: "attachment",
    kind: "featured",
    href: "/mijachvulobis-testi",
    titleKa: "მიჯაჭვულობის სტილის ტესტი",
    titleEn: "Attachment Style Test",
    titlePl: "Test stylów przywiązania",
    taglineKa: "როგორ გიყვარს?",
    taglineEn: "How do you attach?",
    taglinePl: "Jak budujesz relacje i kochasz?",
    descKa:
      "24-კითხვიანი ტესტი შფოთისა და აცილების ორ ღერძზე, გაიგე, ხარ თუ არა უსაფრთხო, შფოთიანი, აცილებადი თუ შიშით-აცილებადი და რა სჭირდება შენს ურთიერთობას.",
    descEn:
      "A 24-item assessment across the anxiety and avoidance axes, secure, anxious, avoidant or fearful-avoidant.",
    descPl:
      "24-pytaniowy test badający osie lęku i unikania w relacjach: styl bezpieczny, lękowy, unikający lub lękowo-unikający.",
    metaKa: "24 კითხვა · ~5 წუთი · უფასო",
    metaEn: "24 questions · about 5 minutes · free",
    metaPl: "24 pytania · ok. 5 minut · darmowy",
    available: true,
  },
  {
    slug: "true-sign",
    kind: "quiz",
    href: "/quiz/namdvili-nishani",
    titleKa: "რომელი ნიშანი ხარ სინამდვილეში?",
    titleEn: "Which Zodiac Sign Are You Really?",
    titlePl: "Jakim znakiem zodiaku naprawdę jesteś?",
    taglineKa: "შენი ზოდიაქო ხასიათით",
    taglineEn: "Your sign, based on personality",
    taglinePl: "Twój znak na podstawie charakteru",
    descKa:
      "12-კითხვიანი ტესტი, რომელიც შენს ხასიათს ზოდიაქოს ერთ-ერთ ნიშანს შეუსაბამებს, შედეგი შეიძლება დაბადების ნიშანს არ ემთხვეოდეს. სახალისო და გასაზიარებელი.",
    descEn:
      "A playful twelve-question quiz that matches your personality to a zodiac sign, which may be different from your birth sign.",
    descPl:
      "12-pytaniowy quiz dopasowujący Twój charakter do żywiołu i jakości znaku zodiaku — wynik może różnić się od Twojego znaku urodzenia!",
    metaKa: "12 კითხვა · ~3 წუთი · უფასო",
    metaEn: "12 questions · about 3 minutes · free",
    metaPl: "12 pytań · ok. 3 minuty · darmowy",
    available: true,
  },
  {
    slug: "famous-zodiac",
    kind: "quiz",
    href: "/quiz/varskvlavebis-zodiaqo",
    titleKa: "ვარსკვლავების ზოდიაქო",
    titleEn: "Celebrity Zodiac Challenge",
    titlePl: "Zodiak gwiazd i celebrytów",
    taglineKa: "გამოიცანი ცნობილი ადამიანების ნიშანი",
    taglineEn: "Guess the signs of famous people",
    taglinePl: "Zgadnij znaki sławnych ludzi",
    descKa:
      "20-კითხვიანი სწრაფი ქვიზი, რამდენად კარგად იცნობ მსახიობების, მომღერლებისა და სპორტსმენების ზოდიაქოს ნიშნებს?",
    descEn:
      "A fast twenty-question challenge: how well do you know the zodiac signs of actors, musicians and athletes?",
    descPl:
      "Szybki quiz z 20 pytaniami: jak dobrze znasz znaki zodiaku aktorów, piosenkarzy i sportowców?",
    metaKa: "20 კითხვა · ~4 წუთი · უფასო",
    metaEn: "20 questions · about 4 minutes · free",
    metaPl: "20 pytań · ok. 4 minuty · darmowy",
    available: true,
  },
];
