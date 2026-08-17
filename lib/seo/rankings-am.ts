import type { RankingCategory } from "@/lib/seo/rankings";
import type { ZodiacSlug } from "@/lib/seo/zodiac-dates";

export type RankingTopicAm = {
  slug: string;
  title: string;
  short: string;
  trait: string;
  emoji: string;
  category: RankingCategory;
  order: ZodiacSlug[];
};

export const RANKING_CATEGORIES_AM: Record<RankingCategory, string> = {
  love: "Սեր և հարաբերություններ",
  personality: "Բնավորություն",
  shadow: "Ստվերային կողմեր",
  success: "Հաջողություն և կարիերա",
  social: "Սոցիալական հատկանիշներ",
};

export const RANKINGS_HUB_AM = {
  title: "Կենդանակերպի նշանների վարկանիշներ. բնավորություն, սեր և հաջողություն",
  description:
    "Բացահայտեք կենդանակերպի բոլոր 12 նշանների վարկանիշները՝ ըստ ռոմանտիզմի, հավատարմության, խելքի, առաջնորդության, ամբիցիաների և այլ հատկանիշների:",
};

const O = (...signs: ZodiacSlug[]) => signs;

export const RANKING_TOPICS_AM: RankingTopicAm[] = [
  {
    slug: "tavsebadi",
    title: "Կենդանակերպի ամենահամատեղելի նշանները",
    short: "Ամենահամատեղելի",
    trait: "հարմարվողականություն, համագործակցություն և տարբեր հարաբերություններ հասկանալու ունակություն",
    emoji: "💞",
    category: "love",
    order: O("libra", "pisces", "taurus", "cancer", "sagittarius", "leo", "gemini", "virgo", "capricorn", "aquarius", "aries", "scorpio"),
  },
  {
    slug: "romantiuli",
    title: "Կենդանակերպի ամենառոմանտիկ նշանները",
    short: "Ամենառոմանտիկ",
    trait: "նրբություն, երևակայություն, ուշադրության ժեստեր և խորը հուզական ներկայություն",
    emoji: "🌹",
    category: "love",
    order: O("pisces", "cancer", "libra", "leo", "taurus", "scorpio", "sagittarius", "aries", "virgo", "gemini", "capricorn", "aquarius"),
  },
  {
    slug: "ertguli",
    title: "Կենդանակերպի ամենահավատարիմ նշանները",
    short: "Ամենահավատարիմ",
    trait: "նվիրվածություն, հուսալիություն, կայունություն և անկեղծություն հարաբերություններում",
    emoji: "💍",
    category: "love",
    order: O("taurus", "scorpio", "capricorn", "cancer", "leo", "virgo", "libra", "pisces", "aries", "aquarius", "sagittarius", "gemini"),
  },
  {
    slug: "echviani",
    title: "Կենդանակերպի ամենախանդոտ նշանները",
    short: "Ամենախանդոտ",
    trait: "սեփականատիրական զգացում, հուզական ինտենսիվություն և անորոշության հանդեպ զգայունություն",
    emoji: "🔥",
    category: "love",
    order: O("scorpio", "taurus", "cancer", "leo", "aries", "pisces", "capricorn", "libra", "virgo", "sagittarius", "gemini", "aquarius"),
  },
  {
    slug: "vnebiani",
    title: "Կենդանակերպի ամենակրքոտ նշանները",
    short: "Ամենակրքոտ",
    trait: "էներգիայի ինտենսիվություն, ցանկություն, խիզախություն և ամբողջական նվիրում",
    emoji: "💋",
    category: "love",
    order: O("scorpio", "aries", "leo", "taurus", "sagittarius", "cancer", "pisces", "libra", "capricorn", "gemini", "virgo", "aquarius"),
  },
  {
    slug: "mimzidveli",
    title: "Կենդանակերպի ամենագրավիչ նշանները",
    short: "Ամենագրավիչ",
    trait: "խարիզմա, անհատական ոճ, ինքնավստահություն և բնական ձգողականություն",
    emoji: "✨",
    category: "love",
    order: O("libra", "scorpio", "leo", "taurus", "pisces", "aries", "sagittarius", "gemini", "cancer", "capricorn", "aquarius", "virgo"),
  },
  {
    slug: "chkviani",
    title: "Կենդանակերպի ամենախելացի նշանները",
    short: "Ամենախելացի",
    trait: "վերլուծական միտք, հետաքրքրասիրություն, տրամաբանություն և ինտելեկտուալ ճկունություն",
    emoji: "🧠",
    category: "personality",
    order: O("aquarius", "virgo", "gemini", "scorpio", "capricorn", "sagittarius", "libra", "pisces", "taurus", "cancer", "leo", "aries"),
  },
  {
    slug: "dzlieri",
    title: "Կենդանակերպի ամենաուժեղ նշանները",
    short: "Ամենաուժեղ",
    trait: "դիմացկունություն, կամքի ուժ, տոկունություն և ճնշման տակ վերականգնվելու ունակություն",
    emoji: "💪",
    category: "personality",
    order: O("scorpio", "capricorn", "leo", "aries", "taurus", "aquarius", "sagittarius", "virgo", "cancer", "libra", "pisces", "gemini"),
  },
  {
    slug: "jiuti",
    title: "Կենդանակերպի ամենահամառ նշանները",
    short: "Ամենահամառ",
    trait: "հետևողականություն, սեփական կարծիքին կառչած լինել և զիջումների դժվար գնալ",
    emoji: "🐂",
    category: "personality",
    order: O("taurus", "capricorn", "scorpio", "leo", "aquarius", "aries", "virgo", "cancer", "sagittarius", "libra", "pisces", "gemini"),
  },
  {
    slug: "emociuri",
    title: "Կենդանակերպի ամենահուզական նշանները",
    short: "Ամենահուզական",
    trait: "զգացմունքների խորություն, զգայուն արձագանք և բաց լինել տրամադրությունների նկատմամբ",
    emoji: "🌊",
    category: "personality",
    order: O("cancer", "pisces", "scorpio", "leo", "aries", "libra", "taurus", "virgo", "sagittarius", "gemini", "capricorn", "aquarius"),
  },
  {
    slug: "mkhiaruli",
    title: "Կենդանակերպի ամենաուրախ նշանները",
    short: "Ամենաուրախ",
    trait: "հումորի զգացում, կենսախնդություն, լավատեսություն և մթնոլորտը ջերմացնելու ձիրք",
    emoji: "😄",
    category: "personality",
    order: O("sagittarius", "gemini", "leo", "aries", "aquarius", "libra", "pisces", "scorpio", "taurus", "cancer", "virgo", "capricorn"),
  },
  {
    slug: "damoukidebeli",
    title: "Կենդանակերպի ամենաանկախ նշանները",
    short: "Ամենաանկախ",
    trait: "ինքնուրույնություն, ազատատենչություն, խիզախություն և սեփական ուղով գնալու ձգտում",
    emoji: "🦅",
    category: "personality",
    order: O("aquarius", "sagittarius", "aries", "capricorn", "scorpio", "gemini", "virgo", "leo", "taurus", "libra", "pisces", "cancer"),
  },
  {
    slug: "mgrdznobiare",
    title: "Կենդանակերպի ամենազգայուն նշանները",
    short: "Ամենազգայուն",
    trait: "էմպաթիա, ինտուիցիա, հուզական ընկալունակություն և նուրբ մանրուքների զգացողություն",
    emoji: "🌙",
    category: "personality",
    order: O("pisces", "cancer", "scorpio", "virgo", "libra", "taurus", "leo", "gemini", "capricorn", "sagittarius", "aquarius", "aries"),
  },
  {
    slug: "lideri",
    title: "Կենդանակերպի լավագույն առաջնորդները",
    short: "Լավագույն առաջնորդ",
    trait: "նախաձեռնողականություն, պատասխանատվություն, վստահություն և որոշումներ կայացնելու ունակություն",
    emoji: "🏆",
    category: "success",
    order: O("leo", "capricorn", "aries", "scorpio", "taurus", "aquarius", "sagittarius", "virgo", "libra", "gemini", "cancer", "pisces"),
  },
  {
    slug: "shromismoyvare",
    title: "Կենդանակերպի ամենաաշխատասեր նշանները",
    short: "Ամենաաշխատասեր",
    trait: "կարգապահություն, տոկունություն, կենտրոնացում և գործը մինչև վերջ հասցնելու պատրաստակամություն",
    emoji: "🛠️",
    category: "success",
    order: O("capricorn", "virgo", "taurus", "scorpio", "aries", "leo", "cancer", "aquarius", "libra", "sagittarius", "gemini", "pisces"),
  },
  {
    slug: "ighbliani",
    title: "Կենդանակերպի ամենահաջողակ նշանները",
    short: "Ամենահաջողակ",
    trait: "լավատեսություն, հնարավորություններին բաց լինել և հարմար պահը զգալու ինտուիցիա",
    emoji: "🍀",
    category: "success",
    order: O("sagittarius", "pisces", "leo", "aries", "libra", "taurus", "gemini", "aquarius", "cancer", "scorpio", "virgo", "capricorn"),
  },
  {
    slug: "mizandasakhuli",
    title: "Կենդանակերպի ամենանպատակասլաց նշանները",
    short: "Ամենանպատակասլաց",
    trait: "նպատակին հավատարմություն, համառություն, ռազմավարական մտածողություն և հաղթելու վճռականություն",
    emoji: "🎯",
    category: "success",
    order: O("capricorn", "aries", "scorpio", "leo", "virgo", "taurus", "aquarius", "sagittarius", "gemini", "libra", "cancer", "pisces"),
  },
  {
    slug: "patiosani",
    title: "Կենդանակերպի ամենաազնիվ նշանները",
    short: "Ամենաազնիվ",
    trait: "ուղղախոսություն, սկզբունքայնություն, անկեղծություն և ճշմարտությունն ասելու համարձակություն",
    emoji: "🤝",
    category: "social",
    order: O("sagittarius", "aries", "virgo", "capricorn", "aquarius", "taurus", "leo", "scorpio", "libra", "gemini", "cancer", "pisces"),
  },
  {
    slug: "guluxvi",
    title: "Կենդանակերպի ամենաառատաձեռն նշանները",
    short: "Ամենաառատաձեռն",
    trait: "մեծահոգություն, օգնելու պատրաստակամություն, հյուրընկալություն և կիսվելու բնական ձգտում",
    emoji: "🎁",
    category: "social",
    order: O("leo", "sagittarius", "pisces", "cancer", "libra", "taurus", "aries", "scorpio", "aquarius", "gemini", "virgo", "capricorn"),
  },
  {
    slug: "ndobiani",
    title: "Կենդանակերպի ամենահուսալի նշանները",
    short: "Ամենահուսալի",
    trait: "վստահելիություն, գաղտնապահություն, խոսքի տեր լինել և խոստումները պահել",
    emoji: "🛡️",
    category: "social",
    order: O("taurus", "capricorn", "virgo", "cancer", "scorpio", "leo", "libra", "aquarius", "aries", "pisces", "sagittarius", "gemini"),
  },
  {
    slug: "gabrazebadi",
    title: "Կենդանակերպի ամենաշուտ բռնկվող նշանները",
    short: "Ամենաշուտ բռնկվող",
    trait: "արագ բարկանալ, իմպուլսիվ արձագանք, զգացմունքները թաքցնելու դժվարություն",
    emoji: "⚡",
    category: "shadow",
    order: O("aries", "scorpio", "leo", "sagittarius", "taurus", "cancer", "capricorn", "gemini", "virgo", "aquarius", "pisces", "libra"),
  },
  {
    slug: "egoisti",
    title: "Կենդանակերպի ամենաինքնակենտրոն նշանները",
    short: "Ամենաինքնակենտրոն",
    trait: "չափազանցված ինքնավստահություն, հպարտություն, սեփական շահերը վեր դասել",
    emoji: "👑",
    category: "shadow",
    order: O("aries", "leo", "capricorn", "aquarius", "scorpio", "sagittarius", "taurus", "gemini", "virgo", "libra", "cancer", "pisces"),
  },
  {
    slug: "civi",
    title: "Կենդանակերպի ամենասառնասիրտ նշանները",
    short: "Ամենասառը",
    trait: "հուզական զսպվածություն, փակվածություն, հեռավորություն պահել",
    emoji: "❄️",
    category: "shadow",
    order: O("aquarius", "capricorn", "virgo", "scorpio", "gemini", "taurus", "sagittarius", "libra", "aries", "leo", "pisces", "cancer"),
  },
  {
    slug: "sashishi",
    title: "Կենդանակերպի ամենավտանգավոր նշանները",
    short: "Ամենավտանգավոր",
    trait: "հուզական ինտենսիվություն, ռազմավարական բնազդներ և ճնշման տակ ուժեղ հակահարված",
    emoji: "🦂",
    category: "shadow",
    order: O("scorpio", "aries", "capricorn", "leo", "taurus", "aquarius", "sagittarius", "virgo", "cancer", "gemini", "libra", "pisces"),
  },
];

export const rankingTopicAmBySlug = (slug: string) =>
  RANKING_TOPICS_AM.find((topic) => topic.slug === slug);

export const SIGN_REASON_AM: Record<ZodiacSlug, string> = {
  aries: "Խոյը գործում է արագ, սիրում է մրցակցել և բերում է կրակոտ առաջնորդություն",
  taurus: "Ցուլը բերում է համբերություն, հավատարմություն, զգայունություն և հողեղեն կայունություն",
  gemini: "Երկվորյակներն արագ են հարմարվում, հեշտությամբ հաղորդակցվում և տեսնում հարցի բոլոր կողմերը",
  cancer: "Խեցգետինը զգում է հուզական ենթատեքստը, պաշտպանում է մտերիմներին և հիշում կարևորը",
  leo: "Առյուծն ավելացնում է ջերմություն, արիություն, տեսանելիություն և ստեղծագործելու ձգտում",
  virgo: "Կույսը նկատում է մանրուքները, կատարելագործում համակարգերը և գործում գործնական խելքով",
  libra: "Կշեռքը հասկանում է սոցիալական հավասարակշռությունը, համագործակցությունն ու գեղեցկությունը",
  scorpio: "Կարիճն աչքի է ընկնում ինտենսիվությամբ, գաղտնապահությամբ և հոգեբանական խորությամբ",
  sagittarius: "Աղեղնավորը բերում է լավատեսություն, հումոր, ազնվություն և նոր փորձառությունների ծարավ",
  capricorn: "Այծեղջյուրն ապավինում է կարգապահությանը, ռազմավարությանը և երկարաժամկետ տոկունությանը",
  aquarius: "Ջրհոսը գնահատում է ինքնավարությունը, ինքնատիպ միտքը և ոչ ստանդարտ լուծումները",
  pisces: "Ձկները առաջնորդվում են երևակայությամբ, էմպաթիայով, ինտուիցիայով և նուրբ զգացողությամբ",
};
