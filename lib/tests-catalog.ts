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
  taglineKa: string;
  taglineEn: string;
  descKa: string;
  descEn: string;
  /** Short meta line, e.g. "60 კითხვა · ~7 წუთი · უფასო". */
  metaKa: string;
  metaEn: string;
  /** True while the test is live; false renders a "მალე" (soon) card. */
  available: boolean;
  /** Omit for all locales; use this while an assessment has one translation. */
  locales?: ("ka" | "en")[];
};

export const TESTS: TestCatalogEntry[] = [
  {
    slug: "iq",
    kind: "featured",
    href: "/iq-testi",
    titleKa: "IQ ტესტი",
    titleEn: "IQ Test",
    taglineKa: "შენი ინტელექტის კოეფიციენტი",
    taglineEn: "Estimate your reasoning ability",
    descKa:
      "კულტურულად ნეიტრალური, დროზე გათვლილი ტესტი — ლოგიკური, რიცხვითი და სივრცითი აზროვნება. მიიღე შენი IQ ქულა, პროცენტილი და აზროვნების რუკა.",
    descEn:
      "A timed, culture-fair adaptive assessment of logical, numerical and spatial reasoning. Receive an estimated IQ score, percentile and reasoning profile.",
    metaKa: "25 დავალება · ~25 წუთი · ადაპტიური",
    metaEn: "25 tasks · about 25 minutes · adaptive",
    available: true,
  },
  {
    slug: "eq",
    kind: "featured",
    href: "/eq-testi",
    titleKa: "EQ ტესტი",
    titleEn: "EQ Test",
    taglineKa: "შენი ემოციური ინტელექტი",
    taglineEn: "Explore your emotional intelligence",
    descKa:
      "თვითშეფასების ტესტი ხუთ სფეროში — თვითშემეცნება, თვითრეგულაცია, მოტივაცია, ემპათია და სოციალური უნარები. მიიღე EQ ქულა და შენი ემოციური რუკა.",
    descEn:
      "A self-report assessment across self-awareness, self-regulation, motivation, empathy and social skills, with a clear emotional profile.",
    metaKa: "40 კითხვა · ~7 წუთი · უფასო",
    metaEn: "40 questions · about 7 minutes · free",
    available: true,
  },
  {
    slug: "self-esteem",
    kind: "featured",
    href: "/tvit-shepasebis-testi",
    titleKa: "თვითშეფასების ტესტი",
    titleEn: "Self-Esteem Test",
    taglineKa: "როგორ უყურებ საკუთარ თავს?",
    taglineEn: "How do you see yourself?",
    descKa:
      "Rosenberg-ის 10-კითხვიანი სკალა ზომავს საკუთარი ღირებულების, შესაძლებლობებისა და თავის პატივისცემის საერთო განცდას. შედეგი და რეფლექსიის პერსონალური თემები მყისიერად.",
    descEn:
      "The ten-item Rosenberg scale explores your overall sense of self-worth and self-respect.",
    metaKa: "10 კითხვა · ~2 წუთი · უფასო",
    metaEn: "10 questions · about 2 minutes · free",
    available: true,
    locales: ["ka"],
  },
  {
    slug: "big-five",
    kind: "featured",
    href: "/big-five",
    titleKa: "Big Five (დიდი ხუთეული)",
    titleEn: "Big Five Personality Test",
    taglineKa: "პიროვნების 5 თვისება",
    taglineEn: "Five broad personality traits",
    descKa:
      "პიროვნების ყველაზე მეცნიერულად სანდო ტესტი — ღიაობა, კეთილსინდისიერება, ექსტრავერსია, კეთილგანწყობა და ნევროტიზმი. მიიღე შენი პროფილი და რადარი.",
    descEn:
      "Explore openness, conscientiousness, extraversion, agreeableness and neuroticism through the most widely researched personality framework.",
    metaKa: "40 კითხვა · ~7 წუთი · უფასო",
    metaEn: "40 questions · about 7 minutes · free",
    available: true,
  },
  {
    slug: "astro-mbti",
    kind: "featured",
    href: "/pirovnebis-testi",
    titleKa: "Astro-MBTI",
    titleEn: "Astro-MBTI",
    taglineKa: "შენი ფსიქოლოგიური ტიპი",
    taglineEn: "Discover your psychological type",
    descKa:
      "აღმოაჩინე შენი პიროვნების ტიპი 16 ტიპიდან — ძლიერი და სუსტი მხარეები, ურთიერთობები, კარიერა და ზრდის გზა.",
    descEn:
      "Discover your personality among sixteen types, including strengths, challenges, relationships, career patterns and avenues for growth.",
    metaKa: "60 კითხვა · ~7 წუთი · უფასო",
    metaEn: "60 questions · about 7 minutes · free",
    available: true,
  },
  {
    slug: "attachment",
    kind: "featured",
    href: "/mijachvulobis-testi",
    titleKa: "მიჯაჭვულობის სტილის ტესტი",
    titleEn: "Attachment Style Test",
    taglineKa: "როგორ გიყვარს?",
    taglineEn: "How do you attach?",
    descKa:
      "24-კითხვიანი ტესტი შფოთისა და აცილების ორ ღერძზე — გაიგე, ხარ თუ არა უსაფრთხო, შფოთიანი, აცილებადი თუ შიშით-აცილებადი და რა სჭირდება შენს ურთიერთობას.",
    descEn:
      "A 24-item assessment across the anxiety and avoidance axes — secure, anxious, avoidant or fearful-avoidant.",
    metaKa: "24 კითხვა · ~5 წუთი · უფასო",
    metaEn: "24 questions · about 5 minutes · free",
    available: true,
    locales: ["ka"],
  },
  {
    slug: "true-sign",
    kind: "quiz",
    href: "/quiz/namdvili-nishani",
    titleKa: "რომელი ნიშანი ხარ სინამდვილეში?",
    titleEn: "Which Zodiac Sign Are You Really?",
    taglineKa: "შენი ზოდიაქო ხასიათით",
    taglineEn: "Your sign, based on personality",
    descKa:
      "12-კითხვიანი ტესტი, რომელიც შენს ხასიათს ზოდიაქოს ერთ-ერთ ნიშანს შეუსაბამებს — შედეგი შეიძლება დაბადების ნიშანს არ ემთხვეოდეს. სახალისო და გასაზიარებელი.",
    descEn:
      "A playful twelve-question quiz that matches your personality to a zodiac sign—which may be different from your birth sign.",
    metaKa: "12 კითხვა · ~3 წუთი · უფასო",
    metaEn: "12 questions · about 3 minutes · free",
    available: true,
  },
  {
    slug: "famous-zodiac",
    kind: "quiz",
    href: "/quiz/varskvlavebis-zodiaqo",
    titleKa: "ვარსკვლავების ზოდიაქო",
    titleEn: "Celebrity Zodiac Challenge",
    taglineKa: "გამოიცანი ცნობილი ადამიანების ნიშანი",
    taglineEn: "Guess the signs of famous people",
    descKa:
      "20-კითხვიანი სწრაფი ქვიზი — რამდენად კარგად იცნობ მსახიობების, მომღერლებისა და სპორტსმენების ზოდიაქოს ნიშნებს?",
    descEn:
      "A fast twenty-question challenge: how well do you know the zodiac signs of actors, musicians and athletes?",
    metaKa: "20 კითხვა · ~4 წუთი · უფასო",
    metaEn: "20 questions · about 4 minutes · free",
    available: true,
  },
];
