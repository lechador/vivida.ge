import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { ZODIAC_SIGN_AM, ELEMENT_AM } from "@/lib/zodiac-sign-am";

export type PairRatingAm = "Ուժեղ" | "Ներդաշնակ" | "Զարգացնող" | "Դժվար";

export type ZodiacPairArmenian = {
  title: string;
  description: string;
  tagline: string;
  rating: PairRatingAm;
  overall: string;
  love: string;
  friendship: string;
  communication: string;
  strengths: string[];
  challenges: string[];
  verdict: string;
  faq: Array<{ q: string; a: string }>;
};

function determineRating(a: ZodiacSlug, b: ZodiacSlug): PairRatingAm {
  const aMeta = signMetaBySlug(a)!;
  const bMeta = signMetaBySlug(b)!;
  if (a === b) return "Ներդաշնակ";
  if (aMeta.element === bMeta.element) return "Ուժեղ";
  const elA = aMeta.element;
  const elB = bMeta.element;
  if (
    (elA === "ცეცხლი" && elB === "ჰაერი") ||
    (elA === "ჰაერი" && elB === "ცეცხლი") ||
    (elA === "მიწა" && elB === "წყალი") ||
    (elA === "წყალი" && elB === "მიწა")
  ) {
    return "Ուժեղ";
  }
  return "Զարգացնող";
}

export function zodiacPairArmenian(a: ZodiacSlug, b: ZodiacSlug): ZodiacPairArmenian {
  const aMeta = signMetaBySlug(a)!;
  const bMeta = signMetaBySlug(b)!;
  const aName = aMeta.labelAm || aMeta.labelKa;
  const bName = bMeta.labelAm || bMeta.labelKa;
  const aProfile = ZODIAC_SIGN_AM[a];
  const bProfile = ZODIAC_SIGN_AM[b];
  const aElement = ELEMENT_AM[aMeta.element];
  const bElement = ELEMENT_AM[bMeta.element];
  const rating = determineRating(a, b);

  const title = `${aName} և ${bName} համատեղելիություն. Սեր, ընկերություն և հարաբերություններ`;
  const description = `${aName} և ${bName} կենդանակերպի նշանների համատեղելիության ուղեցույց. Բացահայտեք սիրո, ընկերության, հաղորդակցության ուժեղ կողմերն ու մարտահրավերները:`;
  const tagline = `${aName} (${aElement}) × ${bName} (${bElement}) հարաբերությունների դինամիկան:`;

  const overall = `${aName} և ${bName} նշանների միջև միությունը համատեղում է ${aElement} և ${bElement} տարերքների յուրահատուկ էներգիաները: ${aProfile.tagline} Միևնույն ժամանակ ${bProfile.tagline.toLowerCase()} Երբ այս երկու նշանները միավորվում են, նրանք սովորում են լրացնել միմյանց և զարգացնել փոխադարձ հարգանք:`;

  const love = `Սիրային հարաբերություններում ${aName}ը և ${bName}ը փնտրում են խորը կապ: ${aProfile.love} Իր հերթին, ${bProfile.love.toLowerCase()} Հաջողության գրավականը միմյանց հուզական կարիքները հասկանալն ու ընդունելն է:`;

  const friendship = `Որպես ընկերներ, ${aName}ը և ${bName}ը կարող են դառնալ հուսալի հենարան: ${aProfile.strengths[0]} և ${bProfile.strengths[0].toLowerCase()} հատկանիշները ստեղծում են ամուր փոխըմբռնում և ընդհանուր հետաքրքրություններ:`;

  const communication = `Հաղորդակցության մեջ կարևոր է հաշվի առնել տարբեր մոտեցումները: ${aName}ը նախընտրում է անկեղծությունը, իսկ ${bName}ը՝ իրավիճակի բազմակողմանի դիտարկումը: Բաց երկխոսությունը օգնում է խուսափել թյուրիմացություններից:`;

  const strengths = [
    `Փոխադարձ աջակցություն (${aProfile.strengths[0]} և ${bProfile.strengths[0].toLowerCase()})`,
    `Տարերքների ներդաշնակ լրացում (${aElement} և ${bElement})`,
    `Ընդհանուր նպատակների շուրջ համախմբվելու կարողություն`,
    `Միմյանցից սովորելու և անձնական աճի հնարավորություն`,
  ];

  const challenges = [
    `Տարբեր հուզական ռիթմեր և արձագանքման ձևեր`,
    `Հնարավոր մարտահրավեր՝ ${aProfile.challenges[0].toLowerCase()}`,
    `Կարող է առաջանալ ${bProfile.challenges[0].toLowerCase()}`,
    `Համբերության և զիջողականության անհրաժեշտություն`,
  ];

  const verdict = `${aName} և ${bName} զույգն ունի բարձր ներուժ: Փոխադարձ հարգանքը, անկեղծ հաղորդակցությունն ու տարբերությունները գնահատելու ունակությունը կապահովեն ամուր և երկարատև միություն:`;

  const faq = [
    {
      q: `Արդյո՞ք ${aName}ը և ${bName}ը համատեղելի են:`,
      a: `${aName}ը և ${bName}ը ունեն ${rating.toLowerCase()} համատեղելիություն: Փոխադարձ ջանքերի և ճիշտ հաղորդակցության շնորհիվ նրանք կարող են կառուցել շատ ներդաշնակ հարաբերություններ:`,
    },
    {
      q: `Ինչպե՞ս են ${aName}ը և ${bName}ը համագործակցում սիրո մեջ:`,
      a: `Սիրո մեջ կարևոր է գնահատել զուգընկերոջ անհատականությունը: ${aName}ը բերում է իր բնական ջերմությունը, իսկ ${bName}ը՝ հոգատարությունն ու նվիրվածությունը:`,
    },
    {
      q: `Ո՞րն է գլխավոր դժվարությունը ${aName}ի և ${bName}ի միջև:`,
      a: `Գլխավոր դժվարությունը կարող է լինել ${aProfile.challenges[0].toLowerCase()} կամ ${bProfile.challenges[0].toLowerCase()}: Կարևոր է ժամանակին քննարկել առաջացած հարցերը:`,
    },
    {
      q: `Արդյո՞ք միայն Արևի նշանը բավարար է համատեղելիությունը որոշելու համար:`,
      a: `Ոչ: Լիարժեք սինաստրիան (սիրային համատեղելիության քարտեզը) ներառում է նաև Լուսնի, Վեներայի, Մարսի դիրքերը, ասցենդենտը և երկու քարտեզների միջև բոլոր ասպեկտները:`,
    },
  ];

  return {
    title,
    description,
    tagline,
    rating,
    overall,
    love,
    friendship,
    communication,
    strengths,
    challenges,
    verdict,
    faq,
  };
}
