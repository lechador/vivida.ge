import rawData from "@/lib/seo/zodiac-placements-am.json";
import type {
  ByDateContentEn,
  ElementContentEn,
  ElementsHubContentEn,
  MoonHubContentEn,
  MoonSignContentEn,
  RisingHubContentEn,
  RisingSignContentEn,
} from "@/lib/seo/zodiac-content-en";
import type { ElementSlug, ZodiacSlug } from "@/lib/seo/zodiac-dates";
import type { PlacementKind } from "@/lib/zodiac-placement-en";

type ArmenianPlacementDataset = {
  moons: Record<ZodiacSlug, MoonSignContentEn>;
  risings: Record<ZodiacSlug, RisingSignContentEn>;
  elements: Record<ElementSlug, ElementContentEn>;
  moonHub: MoonHubContentEn;
  risingHub: RisingHubContentEn;
  elementsHub: ElementsHubContentEn;
  byDate: ByDateContentEn;
};

export const ZODIAC_PLACEMENTS_AM = rawData as ArmenianPlacementDataset;

export type PlacementArmenian = {
  title: string;
  description: string;
  tagline: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  famous: string[];
  faq: Array<{ q: string; a: string }>;
};

export function placementArmenian(
  kind: PlacementKind,
  sign: ZodiacSlug,
): PlacementArmenian {
  if (kind === "moon") {
    const source = ZODIAC_PLACEMENTS_AM.moons[sign];
    return {
      title: source.pageTitle,
      description: source.metaDescription,
      tagline: source.tagline,
      intro: source.intro,
      sections: [
        { title: "Էմոցիոնալ միջուկը", body: source.emotionalCore },
        { title: `${source.labelEn} Լուսնի նշանը սիրո մեջ`, body: source.love },
        { title: "Ստվերային կողմերն ու մարտահրավերները", body: source.shadow },
        {
          title: "Լուսնի նշանների համատեղելիությունը",
          body: source.compatibility,
        },
      ],
      famous: source.famous,
      faq: source.faq,
    };
  }

  const source = ZODIAC_PLACEMENTS_AM.risings[sign];
  return {
    title: source.pageTitle,
    description: source.metaDescription,
    tagline: source.tagline,
    intro: source.intro,
    sections: [
      { title: "Առաջին տպավորությունը", body: source.firstImpression },
      { title: "Արտաքին տեսքն ու անձնական ոճը", body: source.appearance },
      { title: "Կյանքի նկատմամբ մոտեցումը", body: source.approach },
      {
        title: "Հարաբերություններն ու լրացնող էներգիան",
        body: source.bestPaired,
      },
    ],
    famous: source.famous,
    faq: source.faq,
  };
}

export const ELEMENT_NAME_AM: Record<ElementSlug, string> = {
  fire: "Կրակի նշաններ",
  earth: "Հողի նշաններ",
  air: "Օդի նշաններ",
  water: "Ջրի նշաններ",
};

export const ELEMENT_SHORT_NAME_AM: Record<ElementSlug, string> = {
  fire: "Կրակ",
  earth: "Հող",
  air: "Օդ",
  water: "Ջուր",
};

export type ZodiacElementArmenian = {
  name: string;
  title: string;
  description: string;
  tagline: string;
  intro: string;
  personality: string;
  strengths: string[];
  challenges: string[];
  love: string;
  career: string;
  compatibility: string;
  faq: Array<{ q: string; a: string }>;
};

export function elementArmenian(element: ElementSlug): ZodiacElementArmenian {
  const source = ZODIAC_PLACEMENTS_AM.elements[element];
  return {
    name: ELEMENT_NAME_AM[element],
    title: source.pageTitle,
    description: source.metaDescription,
    tagline: source.tagline,
    intro: source.intro,
    personality: source.personality,
    strengths: source.strengths,
    challenges: source.weaknesses,
    love: source.love,
    career: source.career,
    compatibility: source.compatibility,
    faq: source.faq,
  };
}
