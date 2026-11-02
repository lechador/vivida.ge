import type {
  ChartElement,
  SynastryAspect,
  SynastryCategory,
} from "@/lib/synastry";

export const CATEGORY_LABEL_PL: Record<SynastryCategory, string> = {
  love: "Miłość",
  friendship: "Przyjaźń",
  communication: "Komunikacja",
  growth: "Rozwój",
  chemistry: "Chemia",
  business: "Współpraca",
};

export const CATEGORY_DESCRIPTOR_PL: Record<SynastryCategory, string> = {
  love: "Więź emocjonalna i sposób okazywania uczuć",
  friendship: "Zaufanie, swoboda i radość ze spędzania wspólnego czasu",
  communication: "Jak naturalnie spotykają się Wasze myśli i słowa",
  growth: "Wasz potencjał do wspólnej nauki i ewolucji",
  chemistry: "Fizyczne przyciąganie, magnetyzm i intensywność",
  business: "Wspólne cele, struktura i współdziałanie",
};

export const BODY_LABEL_PL: Record<string, string> = {
  sun: "Słońce",
  moon: "Księżyc",
  mercury: "Merkury",
  venus: "Wenus",
  mars: "Mars",
  jupiter: "Jowisz",
  saturn: "Saturn",
  uranus: "Uran",
  neptune: "Neptun",
  pluto: "Pluton",
  chiron: "Chiron",
  ascendant: "Ascendent",
  midheaven: "Medium Coeli",
};

export const ASPECT_LABEL_PL: Record<string, string> = {
  conjunction: "koniunkcja",
  sextile: "sekstyl",
  square: "kwadratura",
  trine: "trygon",
  opposition: "opozycja",
};

export const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

export const ELEMENT_LABEL_PL: Record<ChartElement, string> = {
  fire: "Ogień",
  earth: "Ziemia",
  air: "Powietrze",
  water: "Woda",
};

export const ELEMENT_EMOJI_PL: Record<ChartElement, string> = {
  fire: "🔥",
  earth: "🪨",
  air: "🌬️",
  water: "💧",
};

export const HOUSE_LABEL_PL: Record<number, string> = {
  1: "1. dom · tożsamość",
  2: "2. dom · wartości i finanse",
  3: "3. dom · komunikacja",
  4: "4. dom · dom i korzenie",
  5: "5. dom · romans i twórczość",
  6: "6. dom · codzienność",
  7: "7. dom · partnerstwo",
  8: "8. dom · bliskość i transformacja",
  9: "9. dom · horyzonty i przekonania",
  10: "10. dom · kariera i reputacja",
  11: "11. dom · przyjaźń i marzenia",
  12: "12. dom · świat wewnętrzny",
};

export function overallVerdictPl(percent: number): string {
  if (percent >= 88) return "Wyjątkowa więź";
  if (percent >= 78) return "Silna zgodność";
  if (percent >= 66) return "Naturalna harmonia";
  if (percent >= 55) return "Obiecujący potencjał";
  if (percent >= 43) return "Dynamiczne połączenie";
  if (percent >= 30) return "Wyzwanie z przestrzenią do wzrostu";
  return "Wymagające połączenie o wysokim tarciu";
}

export function overallNarrativePl(percent: number): string {
  if (percent >= 78)
    return "Wasze kosmogramy wykazują wiele punktów naturalnego porozumienia. Więź ta może rozwijać się z niezwykłą lekkością bez popadania w pasywność.";
  if (percent >= 55)
    return "Łączy Was istotna wspólna płaszczyzna, a różnice utrzymują relację żywą, dynamiczną i sprzyjającą ewolucji.";
  if (percent >= 43)
    return "To połączenie łączy łatwość ze strefami tarcia. Ciekawość i szczera komunikacja ukształtują kierunek Waszego rozwoju.";
  return "Wasza relacja wymaga cierpliwości i świadomego wysiłku. Różnice są wyraźne, ale wskazują dokładnie miejsca, w których każde z Was może dojrzeć.";
}

export function categoryNarrativePl(
  category: SynastryCategory,
  score: number,
): string {
  const subject = CATEGORY_LABEL_PL[category].toLowerCase();
  if (score >= 78)
    return `Wyraźny atut: ${subject} rozwija się między Wami naturalnie i bez przeszkód.`;
  if (score >= 60)
    return `Solidny potencjał w obszarze: ${subject}, zwłaszcza gdy zachowujecie uważność na styl bycia partnera.`;
  if (score >= 43)
    return `${CATEGORY_LABEL_PL[category]} łączy wspierające wzorce z kwestiami wymagającymi cierpliwości i wzajemnego zrozumienia.`;
  return `${CATEGORY_LABEL_PL[category]} może wymagać świadomego wysiłku, jasnych oczekiwań i przestrzeni na wzajemną odmienność.`;
}

export function aspectTone(
  kind: SynastryAspect["kind"],
): "harmonious" | "tense" | "neutral" {
  if (kind === "trine" || kind === "sextile") return "harmonious";
  if (kind === "square" || kind === "opposition") return "tense";
  return "neutral";
}

export function describeAspectPl(aspect: SynastryAspect): string {
  const left = BODY_LABEL_PL[aspect.a] ?? aspect.a;
  const right = BODY_LABEL_PL[aspect.b] ?? aspect.b;
  const tone = aspectTone(aspect.kind);
  if (tone === "harmonious")
    return `${left} i ${right} wspierają swobodną wymianę energii. Im ściślejszy aspekt, tym naturalniej odczuwacie to wsparcie.`;
  if (tone === "tense")
    return `${left} i ${right} ciągną w różnych kierunkach. Może to rodzić napięcia, ale także impuls do rozwoju, gdy podejdziecie do różnic świadomie.`;
  return `${left} i ${right} tworzą ścisły węzeł, wzmacniając zarówno lekkość, jak i złożoność tych sfer Waszych kosmogramów.`;
}

export function describeOverlayPl(body: string, house: number): string {
  const bodyName = BODY_LABEL_PL[body] ?? body;
  const houseName = HOUSE_LABEL_PL[house] ?? `${house}. dom`;
  return `${bodyName} aktywuje tematy, za które odpowiada ${houseName.toLowerCase()}, sprawiając, że ten obszar życia staje się wyraźnie obecny w Waszej relacji.`;
}
