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
  titleAm: string;
  taglineKa: string;
  taglineEn: string;
  taglineAm: string;
  descKa: string;
  descEn: string;
  descAm: string;
  /** Short meta line, e.g. "60 კითხვა · ~7 წუთი · უფასო". */
  metaKa: string;
  metaEn: string;
  metaAm: string;
  /** True while the test is live; false renders a "მალე" (soon) card. */
  available: boolean;
};

export const TESTS: TestCatalogEntry[] = [
  {
    slug: "iq",
    kind: "featured",
    href: "/iq-testi",
    titleKa: "IQ ტესტი",
    titleEn: "IQ Test",
    titleAm: "IQ Թեստ",
    taglineKa: "შენი ინტელექტის კოეფიციენტი",
    taglineEn: "Estimate your reasoning ability",
    taglineAm: "Գնահատեք ձեր տրամաբանական ինտելեկտը",
    descKa:
      "კულტურულად ნეიტრალური, დროზე გათვლილი ტესტი — ლოგიკური, რიცხვითი და სივრცითი აზროვნება. მიიღე შენი IQ ქულა, პროცენტილი და აზროვნების რუკა.",
    descEn:
      "A timed, culture-fair adaptive assessment of logical, numerical and spatial reasoning. Receive an estimated IQ score, percentile and reasoning profile.",
    descAm:
      "Տրամաբանական, թվային և տարածական մտածողության թեստ: Ստացեք ձեր IQ միավորը և մտածողության պրոֆիլը:",
    metaKa: "25 დავალება · ~25 წუთი · ადაპტიური",
    metaEn: "25 tasks · about 25 minutes · adaptive",
    metaAm: "25 առաջադրանք · ~25 րոպե · ադապտիվ",
    available: true,
  },
  {
    slug: "eq",
    kind: "featured",
    href: "/eq-testi",
    titleKa: "EQ ტესტი",
    titleEn: "EQ Test",
    titleAm: "EQ Թեստ",
    taglineKa: "შენი ემოციური ინტელექტი",
    taglineEn: "Explore your emotional intelligence",
    taglineAm: "Բացահայտեք ձեր էմոցիոնալ ինտելեկտը",
    descKa:
      "თვითშეფასების ტესტი ხუთ სფეროში — თვითშემეცნება, თვითრეგულაცია, მოტივაცია, ემპათია და სოციალური უნარები. მიიღე EQ ქულა და შენი ემოციური რუკა.",
    descEn:
      "A self-report assessment across self-awareness, self-regulation, motivation, empathy and social skills, with a clear emotional profile.",
    descAm:
      "Ինքնաճանաչման թեստ 5 ոլորտներում՝ ինքնագիտակցություն, ինքնակառավարում, մոտիվացիա, էմպաթիա և սոցիալական հմտություններ:",
    metaKa: "40 კითხვა · ~7 წუთი · უფასო",
    metaEn: "40 questions · about 7 minutes · free",
    metaAm: "40 հարց · ~7 րոպե · անվճար",
    available: true,
  },
  {
    slug: "big-five",
    kind: "featured",
    href: "/big-five",
    titleKa: "Big Five (დიდი ხუთეული)",
    titleEn: "Big Five Personality Test",
    titleAm: "Big Five (Մեծ Հնգյակ)",
    taglineKa: "პიროვნების 5 თვისება",
    taglineEn: "Five broad personality traits",
    taglineAm: "Անհատականության 5 գլխավոր գծեր",
    descKa:
      "პიროვნების ყველაზე მეცნიერულად სანდო ტესტი — ღიაობა, კეთილსინდისიერება, ექსტრავერსია, კეთილგანწყობა და ნევროტიზმი. მიიღე შენი პროფილი და რადარი.",
    descEn:
      "Explore openness, conscientiousness, extraversion, agreeableness and neuroticism through the most widely researched personality framework.",
    descAm:
      "Անհատականության առավել գիտական թեստը՝ բացություն, բարեխղճություն, էքստրավերսիա, համերաշխություն և նևրոտիզմ:",
    metaKa: "40 კითხვა · ~7 წუთი · უფასო",
    metaEn: "40 questions · about 7 minutes · free",
    metaAm: "40 հարց · ~7 րոպե · անվճար",
    available: true,
  },
  {
    slug: "astro-mbti",
    kind: "featured",
    href: "/pirovnebis-testi",
    titleKa: "Astro-MBTI",
    titleEn: "Astro-MBTI",
    titleAm: "Astro-MBTI",
    taglineKa: "შენი ფსიქოლოგიური ტიპი",
    taglineEn: "Discover your psychological type",
    taglineAm: "Բացահայտեք ձեր հոգեբանական տիպը",
    descKa:
      "აღმოაჩინე შენი პიროვნების ტიპი 16 ტიპიდან — ძლიერი და სუსტი მხარეები, ურთიერთობები, კარიერა და ზრდის გზა.",
    descEn:
      "Discover your personality among sixteen types, including strengths, challenges, relationships, career patterns and avenues for growth.",
    descAm:
      "Բացահայտեք ձեր անհատականության տիպը 16 տիպերից՝ ուժեղ և թույլ կողմեր, հարաբերություններ, կարիերա և աճի ուղի:",
    metaKa: "60 კითხვა · ~7 წუთი · უფასო",
    metaEn: "60 questions · about 7 minutes · free",
    metaAm: "60 հարց · ~7 րոպե · անվճար",
    available: true,
  },
  {
    slug: "true-sign",
    kind: "quiz",
    href: "/quiz/namdvili-nishani",
    titleKa: "რომელი ნიშანი ხარ სინამდვილეში?",
    titleEn: "Which Zodiac Sign Are You Really?",
    titleAm: "Ո՞ր նշանն եք իրականում:",
    taglineKa: "შენი ზოდიაქო ხასიათით",
    taglineEn: "Your sign, based on personality",
    taglineAm: "Ձեր կենդանակերպը՝ ըստ բնավորության",
    descKa:
      "12-კითხვიანი ტესტი, რომელიც შენს ხასიათს ზოდიაქოს ერთ-ერთ ნიშანს შეუსაბამებს — შედეგი შეიძლება დაბადების ნიშანს არ ემთხვეოდეს. სახალისო და გასაზიარებელი.",
    descEn:
      "A playful twelve-question quiz that matches your personality to a zodiac sign—which may be different from your birth sign.",
    descAm:
      "12 հարցից բաղկացած արագ քվիզ, որը համապատասխանեցնում է ձեր բնավորությունը կենդանակերպի նշաններից մեկին:",
    metaKa: "12 კითხვა · ~3 წუთი · უფასო",
    metaEn: "12 questions · about 3 minutes · free",
    metaAm: "12 հարց · ~3 րոպե · անվճար",
    available: true,
  },
  {
    slug: "famous-zodiac",
    kind: "quiz",
    href: "/quiz/varskvlavebis-zodiaqo",
    titleKa: "ვარსკვლავების ზოდიაქო",
    titleEn: "Celebrity Zodiac Challenge",
    titleAm: "Հայտնիների կենդանակերպը",
    taglineKa: "გამოიცანი ცნობილი ადამიანების ნიშანი",
    taglineEn: "Guess the signs of famous people",
    taglineAm: "Գուշակեք հայտնի մարդկանց նշանները",
    descKa:
      "20-კითხვიანი სწრაფი ქვიზი — რამდენად კარგად იცნობ მსახიობების, მომღერლებისა და სპორტსმენების ზოდიაქოს ნიშნებს?",
    descEn:
      "A fast twenty-question challenge: how well do you know the zodiac signs of actors, musicians and athletes?",
    descAm:
      "20 հարցից բաղկացած քվիզ. որքանո՞վ լավ գիտեք հայտնի դերասանների, երգիչների և մարզիկների նշանները:",
    metaKa: "20 კითხვა · ~4 წუთი · უფასო",
    metaEn: "20 questions · about 4 minutes · free",
    metaAm: "20 հարց · ~4 րոպե · անվճար",
    available: true,
  },
];

