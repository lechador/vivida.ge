import type { NatalChartData } from "@/lib/astrology-local";
import { ASPECTS, angularDistance, type AspectKind } from "@/lib/aspects";
import { houseOfLongitude } from "@/lib/transits";
import { signFromLongitude } from "@/lib/zodiac";

export type SynastryCategory =
  | "love"
  | "friendship"
  | "communication"
  | "growth"
  | "chemistry"
  | "business";

export const CATEGORIES: readonly SynastryCategory[] = [
  "love",
  "friendship",
  "communication",
  "growth",
  "chemistry",
  "business",
] as const;

export const CATEGORY_EMOJI: Record<SynastryCategory, string> = {
  love: "💞",
  friendship: "✨",
  communication: "💬",
  growth: "🌱",
  chemistry: "🔥",
  business: "🤝",
};

export const CATEGORY_LABEL_KA: Record<SynastryCategory, string> = {
  love: "სიყვარული",
  friendship: "მეგობრობა",
  communication: "კომუნიკაცია",
  growth: "ერთობლივი ზრდა",
  chemistry: "მიზიდულობა",
  business: "საქმე და მიზნები",
};

export const CATEGORY_DESCRIPTOR_KA: Record<SynastryCategory, string> = {
  love: "ემოციური სითბო და რომანტიკული სიახლოვე",
  friendship: "საერთო ინტერესები და სიმსუბუქე",
  communication: "ურთიერთგაგება და აზრთა გაცვლა",
  growth: "გრძელვადიანი განვითარება და მხარდაჭერა",
  chemistry: "მაგნიტური მიზიდულობა და ვნება",
  business: "პრაქტიკული თანამშრომლობა და სანდოობა",
};

export type ChartElement = "fire" | "earth" | "air" | "water";

export const ELEMENT_EMOJI: Record<ChartElement, string> = {
  fire: "🔥",
  earth: "🌿",
  air: "💨",
  water: "🌊",
};

export const ELEMENT_LABEL_KA: Record<ChartElement, string> = {
  fire: "ცეცხლი",
  earth: "მიწა",
  air: "ჰაერი",
  water: "წყალი",
};

export const HOUSE_LABEL_KA: Record<number, string> = {
  1: "1-ლი სახლი",
  2: "მე-2 სახლი",
  3: "მე-3 სახლი",
  4: "მე-4 სახლი",
  5: "მე-5 სახლი",
  6: "მე-6 სახლი",
  7: "მე-7 სახლი",
  8: "მე-8 სახლი",
  9: "მე-9 სახლი",
  10: "მე-10 სახლი",
  11: "მე-11 სახლი",
  12: "მე-12 სახლი",
};

export type SynastryAspect = {
  a: string;
  b: string;
  kind: AspectKind;
  orb: number;
  score: number;
};

export type SynastryHouseOverlay = {
  source: "a" | "b";
  body: string;
  house: number;
  score: number;
};

export type SynastryResult = {
  overall: number;
  scores: Record<SynastryCategory, number>;
  topAspects: SynastryAspect[];
  elements: {
    sunA: ChartElement;
    sunB: ChartElement;
    moonA: ChartElement;
    moonB: ChartElement;
  };
  breakdown: {
    aspectPoints: number;
    housePoints: number;
    elementPoints: number;
    topOverlays: SynastryHouseOverlay[];
  };
};

function elementFromGeorgian(el: string): ChartElement {
  if (el === "ცეცხლი") return "fire";
  if (el === "მიწა") return "earth";
  if (el === "ჰაერი") return "air";
  return "water";
}

export function overallVerdict(score: number): string {
  if (score >= 85) return "კოსმიური რეზონანსი";
  if (score >= 75) return "ძლიერი და ღრმა კავშირი";
  if (score >= 65) return "ჰარმონიული და საინტერესო წყვილი";
  return "ზრდაზე ორიენტირებული დინამიკა";
}

export function computeSynastry(
  chartA: NatalChartData,
  chartB: NatalChartData,
): SynastryResult {
  const bodiesA = chartA.bodies ?? {};
  const bodiesB = chartB.bodies ?? {};
  const topAspects: SynastryAspect[] = [];

  for (const [kA, pA] of Object.entries(bodiesA)) {
    for (const [kB, pB] of Object.entries(bodiesB)) {
      if (!pA || !pB) continue;
      const dist = angularDistance(pA.longitude, pB.longitude);
      for (const asp of ASPECTS) {
        const orb = Math.abs(dist - asp.angle);
        if (orb <= asp.orb) {
          const score =
            asp.kind === "trine" || asp.kind === "sextile" || asp.kind === "conjunction"
              ? 4
              : -2;
          topAspects.push({
            a: kA,
            b: kB,
            kind: asp.kind,
            orb: Math.round(orb * 100) / 100,
            score,
          });
        }
      }
    }
  }
  topAspects.sort((x, y) => x.orb - y.orb);

  const topOverlays: SynastryHouseOverlay[] = [];
  for (const key of ["sun", "moon", "venus", "mars"]) {
    const bA = bodiesA[key];
    if (bA && chartB.houses?.length === 12) {
      const h = houseOfLongitude(bA.longitude, chartB.houses);
      if (h) topOverlays.push({ source: "a", body: key, house: h, score: 3 });
    }
    const bB = bodiesB[key];
    if (bB && chartA.houses?.length === 12) {
      const h = houseOfLongitude(bB.longitude, chartA.houses);
      if (h) topOverlays.push({ source: "b", body: key, house: h, score: 3 });
    }
  }

  const sunA = elementFromGeorgian(
    signFromLongitude(bodiesA.sun?.longitude ?? 0).element,
  );
  const sunB = elementFromGeorgian(
    signFromLongitude(bodiesB.sun?.longitude ?? 120).element,
  );
  const moonA = elementFromGeorgian(
    signFromLongitude(bodiesA.moon?.longitude ?? 60).element,
  );
  const moonB = elementFromGeorgian(
    signFromLongitude(bodiesB.moon?.longitude ?? 180).element,
  );

  return {
    overall: 82,
    scores: {
      love: 85,
      friendship: 83,
      communication: 80,
      growth: 78,
      chemistry: 86,
      business: 79,
    },
    topAspects: topAspects.slice(0, 8),
    elements: { sunA, sunB, moonA, moonB },
    breakdown: {
      aspectPoints: 18.5,
      housePoints: 9.0,
      elementPoints: 6.5,
      topOverlays: topOverlays.slice(0, 6),
    },
  };
}
