import type {
  ChartElement,
  SynastryAspect,
  SynastryCategory,
} from "@/lib/synastry";

export const CATEGORY_LABEL_AM: Record<SynastryCategory, string> = {
  love: "Սեր",
  friendship: "Ընկերություն",
  communication: "Հաղորդակցություն",
  growth: "Համատեղ աճ",
  chemistry: "Քիմիա և կիրք",
  business: "Համագործակցություն",
};

export const CATEGORY_DESCRIPTOR_AM: Record<SynastryCategory, string> = {
  love: "Հուզական կապ և սեր արտահայտելու փոխադարձ ձև",
  friendship: "Վստահություն, թեթևություն և միասին ժամանակ անցկացնելու հաճույք",
  communication: "Մտքերի և բառերի բնական համահունչություն",
  growth: "Միասին սովորելու և զարգանալու ներուժ",
  chemistry: "Ֆիզիկական գրավչություն և կրքոտություն",
  business: "Ընդհանուր նպատակներ, կառուցվածք և գործնական համագործակցություն",
};

export const BODY_LABEL_AM: Record<string, string> = {
  sun: "Արև",
  moon: "Լուսին",
  mercury: "Մերկուրի",
  venus: "Վեներա",
  mars: "Մարս",
  jupiter: "Յուպիտեր",
  saturn: "Սատուրն",
  uranus: "Ուրան",
  neptune: "Նեպտուն",
  pluto: "Պլուտոն",
  chiron: "Քիրոն",
  ascendant: "Ասցենդենտ",
  midheaven: "Միջօրեական",
};

export const ASPECT_LABEL_AM: Record<string, string> = {
  conjunction: "միացում",
  sextile: "սեքստիլ",
  square: "քառակուսի",
  trine: "տրիգոն",
  opposition: "օպոզիցիա",
};

export const ELEMENT_LABEL_AM: Record<ChartElement, string> = {
  fire: "Կրակ",
  earth: "Հող",
  air: "Օդ",
  water: "Ջուր",
};

export const HOUSE_LABEL_AM: Record<number, string> = {
  1: "1-ին տուն · ինքնություն",
  2: "2-րդ տուն · արժեքներ",
  3: "3-րդ տուն · հաղորդակցություն",
  4: "4-րդ տուն · տուն և արմատներ",
  5: "5-րդ տուն · սեր և ստեղծարարություն",
  6: "6-րդ տուն · առօրյա կյանք",
  7: "7-րդ տուն · գործընկերություն",
  8: "8-րդ տուն · մտերմություն և տրանսֆորմացիա",
  9: "9-րդ տուն · հորիզոններ և հավատք",
  10: "10-րդ տուն · կարիերա և հեղինակություն",
  11: "11-րդ տուն · ընկերություն և իդեալներ",
  12: "12-րդ տուն · ներաշխարհ",
};

export function overallVerdictAm(percent: number): string {
  if (percent >= 88) return "Բացառիկ ներդաշնակ կապ";
  if (percent >= 78) return "Ուժեղ համատեղելիություն";
  if (percent >= 66) return "Բնական ներդաշնակություն";
  if (percent >= 55) return "Հուսադրող ներուժ";
  if (percent >= 43) return "Դինամիկ կապ";
  if (percent >= 30) return "Մարտահրավերներով և աճի հնարավորությամբ կապ";
  return "Լարվածությամբ լի կապ";
}

export function overallNarrativeAm(percent: number): string {
  if (percent >= 78)
    return "Ձեր քարտեզները ցույց են տալիս բնական հասկացողության բազմաթիվ կետեր: Կապը թեթև է, խորը և ոգեշնչող:";
  if (percent >= 55)
    return "Կա ամուր ընդհանուր հիմք, ինչպես նաև տարբերություններ, որոնք հարաբերությունները պահում են ակտիվ և զարգացող:";
  if (percent >= 43)
    return "Այս կապը համատեղում է թեթևությունն ու շփման լարվածությունը: Անկեղծ հաղորդակցությունը կօգնի ներդաշնակեցնել այն:";
  return "Ձեր քարտեզները պահանջում են համբերություն և գիտակցված ջանքեր: Տարբերությունները կարող են դառնալ անձնական աճի աղբյուր:";
}

export function categoryNarrativeAm(
  category: SynastryCategory,
  score: number,
): string {
  const subject = CATEGORY_LABEL_AM[category].toLowerCase();
  if (score >= 78)
    return `Հստակ առավելություն. ${subject} ոլորտում ձեր էներգիաները հոսում են բնականորեն և հեշտությամբ:`;
  if (score >= 60)
    return `${subject} ոլորտում կա ամուր ներուժ, հատկապես, երբ ուշադիր եք միմյանց ոճի նկատմամբ:`;
  if (score >= 43)
    return `${CATEGORY_LABEL_AM[category]} ոլորտը խառն է. որոշ գործոններ աջակցում են ձեզ, իսկ մյուսները պահանջում են համբերություն:`;
  return `${CATEGORY_LABEL_AM[category]} ոլորտը կարող է պահանջել գիտակցված ջանքեր, հստակ ակնկալիքներ և միմյանց տարբերությունների ընդունում:`;
}

export function describeAspectAm(aspect: SynastryAspect): string {
  const left = BODY_LABEL_AM[aspect.a] ?? aspect.a;
  const right = BODY_LABEL_AM[aspect.b] ?? aspect.b;
  if (aspect.kind === "trine" || aspect.kind === "sextile")
    return `${left}-ը և ${right}-ը աջակցում են էներգիայի հեշտ փոխանակմանը: Որքան ճշգրիտ է ասպեկտը, այնքան բնական է դրսևորվում:`;
  if (aspect.kind === "square" || aspect.kind === "opposition")
    return `${left}-ը և ${right}-ը ձգում են տարբեր ուղղություններով: Սա կարող է ստեղծել լարվածություն, բայց նաև դինամիկ առաջընթաց:`;
  return `${left}-ը և ${right}-ը սերտորեն միահյուսված են՝ ուժեղացնելով ձեր քարտեզների այս երկու հատվածների ազդեցությունը:`;
}

export function describeOverlayAm(body: string, house: number): string {
  const bodyName = BODY_LABEL_AM[body] ?? body;
  const houseName = HOUSE_LABEL_AM[house] ?? `${house}-րդ տուն`;
  return `${bodyName}-ն ակտիվացնում է ${houseName}-ի թեմաները՝ դարձնելով կյանքի այս ոլորտն ավելի նկատելի հարաբերություններում:`;
}
