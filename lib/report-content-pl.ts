import type {
  ChartInterpretationJson,
  NatalAspectJson,
  NatalChartJson,
  PointJson,
} from "@/db/schema";
import { aspectKey } from "@/lib/aspects";
import { computeElementBalance, type Element } from "@/lib/elements";
import { houseDef, HOUSE_NUMBERS } from "@/lib/houses";
import { signByIndex } from "@/lib/zodiac";
import {
  getLibraryEntryPl,
  getHouseLibraryEntryPl,
  getAspectLibraryEntryPl,
} from "@/lib/natal-library-pl";

const ELEMENT_PL: Record<Element, string> = {
  ცეცხლი: "ogień",
  მიწა: "ziemia",
  ჰაერი: "powietrze",
  წყალი: "woda",
};

const ELEMENT_STYLE_PL: Record<Element, string> = {
  ცეცხლი: "bezpośredni, ekspresyjny i napędzany ruchem oraz działaniem",
  მიწა: "ugruntowany, praktyczny i skupiony na trwałych fundamentach",
  ჰაერი: "ciekawy świata, towarzyski i otwarty na idee oraz relacje",
  წყალი: "intuicyjny, emocjonalnie wnikliwy i wrażliwy na atmosferę",
};

const MODALITY_PL: Record<string, string> = {
  კარდინალური: "kardynalny",
  ფიქსირებული: "stały",
  მუტაბელური: "zmienny",
};

const MODALITY_STYLE_PL: Record<string, string> = {
  კარდინალური: "inicjuje i tworzy dynamikę",
  ფიქსირებული: "stabilizuje, angażuje się i doprowadza sprawy do końca",
  მუტაბელური: "dostosowuje się, interpretuje i reaguje na zmiany",
};

const ASPECT_PL: Record<NatalAspectJson["kind"], string> = {
  conjunction: "koniunkcję",
  sextile: "sekstyl",
  square: "kwadraturę",
  trine: "trygon",
  opposition: "opozycję",
};

const ASPECT_DYNAMIC_PL: Record<NatalAspectJson["kind"], string> = {
  conjunction:
    "Te motywacje działają jak jedna skoncentrowana siła. Wzajemnie się wzmacniają, choć oddzielenie ich potrzeb może wymagać świadomego wysiłku.",
  sextile:
    "Te obszary horoskopu wspierają się nawzajem poprzez otwierające się możliwości. Połączenie staje się silniejsze, gdy aktywnie z niego korzystasz.",
  square:
    "Te potrzeby tworzą twórcze tarcie. Napięcie staje się źródłem mistrzostwa, gdy przestajesz zmuszać jedną stronę do uciszania drugiej.",
  trine:
    "Te energie współpracują w sposób naturalny. Ta łatwość jest prawdziwym darem, zwłaszcza gdy nadajesz jej świadomy kierunek.",
  opposition:
    "Te potrzeby ciągną ku przeciwległym biegunom jednej osi. Integracja przychodzi poprzez równowagę, perspektywę i przestrzeń dla obu stron.",
};

const BODY_NAME_PL: Record<string, string> = {
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

const SIGN_NAME_PL: Record<string, string> = {
  aries: "Baran",
  taurus: "Byk",
  gemini: "Bliźnięta",
  cancer: "Rak",
  leo: "Lew",
  virgo: "Panna",
  libra: "Waga",
  scorpio: "Skorpion",
  sagittarius: "Strzelec",
  capricorn: "Koziorożec",
  aquarius: "Wodnik",
  pisces: "Ryby",
};

const SIGN_LOCATIVE_PL: Record<string, string> = {
  aries: "Baranie",
  taurus: "Byku",
  gemini: "Bliźniętach",
  cancer: "Raku",
  leo: "Lwie",
  virgo: "Pannie",
  libra: "Wadze",
  scorpio: "Skorpionie",
  sagittarius: "Strzelcu",
  capricorn: "Koziorożcu",
  aquarius: "Wodniku",
  pisces: "Rybach",
};

const HOUSE_LABEL_PL: Record<number, string> = {
  1: "Pierwszym Domu",
  2: "Drugim Domu",
  3: "Trzecim Domu",
  4: "Czwartym Domu",
  5: "Piątym Domu",
  6: "Szóstym Domu",
  7: "Siódmym Domu",
  8: "Ósmym Domu",
  9: "Dziewiątym Domu",
  10: "Dziesiątym Domu",
  11: "Jedenastym Domu",
  12: "Dwunastym Domu",
};

function bodyNamePl(key: string): string {
  return BODY_NAME_PL[key] ?? key[0].toUpperCase() + key.slice(1);
}

function signNamePl(key: string): string {
  return SIGN_NAME_PL[key] ?? key;
}

function signLocativePl(key: string): string {
  return SIGN_LOCATIVE_PL[key] ?? key;
}

function fallbackPlacementTextPl(
  key: string,
  point: PointJson,
  options: { role?: string; includeHouse?: boolean } = {},
): string {
  const sign = signByIndex(point.signIndex);
  const element = ELEMENT_PL[sign.element];
  const modality = MODALITY_PL[sign.modality] ?? sign.modality;
  const role = options.role ?? "ważną część Twojego horoskopu";
  const house = point.house ? houseDef(point.house) : null;

  let text = `${bodyNamePl(key)} w ${signLocativePl(sign.key)} wyraża ${role} w sposób ${ELEMENT_STYLE_PL[sign.element]}. ${signNamePl(sign.key)} to ${modality} znak żywiołu ${element}: ${MODALITY_STYLE_PL[sign.modality] ?? "działa w swoim własnym, unikalnym rytmie"}.`;
  if (options.includeHouse !== false && house && point.house) {
    text += ` W Twoim ${HOUSE_LABEL_PL[point.house] ?? `Domu ${point.house}`} staje się to szczególnie widoczne w codziennym życiu.`;
  }
  if (point.retrograde) {
    text += ` Ponieważ ${bodyNamePl(key)} znajdował się w ruchu wstecznym (retrogradacji), ta funkcja może być przetwarzana bardziej wewnętrznie i refleksyjnie, zanim ujawni się na zewnątrz.`;
  }
  return text;
}

function fallbackAspectTextPl(aspect: NatalAspectJson): string {
  const tightness =
    aspect.orb < 2
      ? "To ścisły, dominujący układ w Twoim horoskopie."
      : aspect.orb < 5
        ? "To wyraźny, powtarzający się wzorzec w Twoim życiu."
        : "To szerszy układ tła w Twoim horoskopie.";

  return `${bodyNamePl(aspect.a)} tworzy ${ASPECT_PL[aspect.kind]} z ${bodyNamePl(aspect.b)}. ${ASPECT_DYNAMIC_PL[aspect.kind]} ${tightness}`;
}

/**
 * Complete Polish interpretation generated from the chart itself using the
 * translated natal interpretation library (Big Three, planets, houses, aspects).
 */
export function buildPolishChartInterpretation(
  chart: NatalChartJson,
): ChartInterpretationJson {
  const sun = chart.bodies.sun;
  const moon = chart.bodies.moon;
  const asc = chart.ascendant;
  const balance = computeElementBalance(chart);
  const dominant = balance.dominant;
  const sunSign = signByIndex(sun.signIndex);
  const moonSign = signByIndex(moon.signIndex);
  const ascSign = signByIndex(asc.signIndex);

  // Big Three with full multi-paragraph Polish prose
  const sunText =
    getLibraryEntryPl("sun", sunSign.key) ??
    fallbackPlacementTextPl("sun", sun, {
      role: "tożsamość, siłę życiową i kierunek rozwoju",
    });
  const moonText =
    getLibraryEntryPl("moon", moonSign.key) ??
    fallbackPlacementTextPl("moon", moon, {
      role: "potrzeby emocjonalne, instynkty i sposób regeneracji",
    });
  const ascText =
    getLibraryEntryPl("ascendant", ascSign.key) ??
    fallbackPlacementTextPl("ascendant", asc, {
      role: "Twój pierwszy kontakt ze światem i styl, w jakim inni Cię postrzegają",
      includeHouse: false,
    });

  // 8 Planets with full multi-paragraph Polish prose
  const planets: Record<string, string> = {};
  for (const key of [
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
  ]) {
    const point = chart.bodies[key];
    if (point) {
      const sign = signByIndex(point.signIndex);
      planets[key] =
        getLibraryEntryPl(key, sign.key) ?? fallbackPlacementTextPl(key, point);
    }
  }

  // Houses composed of Cusp Sign + Occupant Planets (multi-paragraph)
  const occupantsByHouse = new Map<number, string[]>();
  for (const [key, point] of Object.entries(chart.bodies)) {
    if (!point.house) continue;
    const list = occupantsByHouse.get(point.house) ?? [];
    list.push(key);
    occupantsByHouse.set(point.house, list);
  }

  const houses: Record<string, string> = {};
  for (const n of HOUSE_NUMBERS) {
    const cusp = chart.houses.find((h) => h.number === n);
    if (!cusp) continue;
    const sign = signByIndex(cusp.signIndex);
    const cuspBody = getHouseLibraryEntryPl("cusp", n, sign.key);
    const occupantBodies = (occupantsByHouse.get(n) ?? [])
      .map((planet) => getHouseLibraryEntryPl("occupant", n, planet))
      .filter((b): b is string => Boolean(b));

    if (cuspBody) {
      houses[String(n)] = [cuspBody, ...occupantBodies].join("\n\n");
    } else {
      const presentNames = (occupantsByHouse.get(n) ?? []).map(bodyNamePl);
      houses[String(n)] =
        `Twój ${HOUSE_LABEL_PL[n] ?? `Dom ${n}`} zaczyna się w znaku ${signLocativePl(sign.key)}, wnosząc ${ELEMENT_STYLE_PL[sign.element]} podejście do tej sfery życia.` +
        (presentNames.length > 0
          ? ` Przebywają tu: ${presentNames.join(", ")}, co sprawia, że ten obszar jest szczególnie aktywny i osobiście znaczący.`
          : " Brak planet natalnych w tym domu nie oznacza braku znaczenia; znak na wierzchołku opisuje Twoje naturalne nastawienie do tego obszaru.");
    }
  }

  // Aspects with full multi-paragraph Polish prose
  const aspects: Record<string, string> = {};
  for (const aspect of chart.aspects ?? []) {
    const key = aspectKey(aspect.a, aspect.b, aspect.kind);
    const aspectBody = getAspectLibraryEntryPl(aspect.a, aspect.b, aspect.kind);
    aspects[key] = aspectBody ?? fallbackAspectTextPl(aspect);
  }

  const tightest = [...(chart.aspects ?? [])].sort((a, b) => a.orb - b.orb)[0];
  const highlights: NonNullable<ChartInterpretationJson["highlights"]> = [
    {
      title: `${ELEMENT_PL[dominant][0].toUpperCase() + ELEMENT_PL[dominant].slice(1)} dominuje w Twoim horoskopie`,
      body: `${Math.round(balance.percentages[dominant])}% ważonego nacisku horoskopu przypada na żywioł ${ELEMENT_PL[dominant]}. Prawdopodobnie powracasz do trybu ${ELEMENT_STYLE_PL[dominant]}, gdy decyzje mają dla Ciebie kluczowe znaczenie.`,
    },
    {
      title: `Słońce w ${signLocativePl(sunSign.key)}, Księżyc w ${signLocativePl(moonSign.key)}`,
      body: `Twój świadomy kierunek przemawia przez znak ${signNamePl(sunSign.key)}, podczas gdy Twoje emocjonalne odruchy wyrażają się przez znak ${signNamePl(moonSign.key)}. Ich relacja opisuje nieustanny dialog między tym, do czego świadomie dążysz, a tym, czego instynktownie potrzebujesz.`,
    },
  ];
  if (tightest) {
    const aspectBody = getAspectLibraryEntryPl(
      tightest.a,
      tightest.b,
      tightest.kind,
    );
    highlights.push({
      title: `${bodyNamePl(tightest.a)} ${ASPECT_PL[tightest.kind]} ${bodyNamePl(tightest.b)}`,
      body: aspectBody
        ? aspectBody.slice(0, 320) + "..."
        : fallbackAspectTextPl(tightest),
    });
  } else {
    highlights.push({
      title: `Ascendent w ${signLocativePl(ascSign.key)}`,
      body: `Nowe sytuacje witasz poprzez cechy znaku ${signNamePl(ascSign.key)}: styl ${ELEMENT_STYLE_PL[ascSign.element]}. To często właśnie to, co inni zauważają w Tobie jako pierwsze.`,
    });
  }

  const dominantUpper =
    ELEMENT_PL[dominant][0].toUpperCase() + ELEMENT_PL[dominant].slice(1);

  return {
    summary: `Twój horoskop łączy Słońce w ${signLocativePl(sunSign.key)}, Księżyc w ${signLocativePl(moonSign.key)} i Ascendent w ${signLocativePl(ascSign.key)}. Słońce opisuje kierunek, w którym stajesz się w pełni sobą, Księżyc pokazuje, co przywraca Twoje poczucie bezpieczeństwa emocjonalnego, a Ascendent kształtuje Twój sposób wchodzenia w nowe sytuacje. Żywioł ${dominantUpper} ma najsilniejszy udział w Twoim horoskopie, nadając całości ${ELEMENT_STYLE_PL[dominant]} ton. Traktuj te układy jako zintegrowany system: żaden pojedynczy znak nie definiuje Cię w odosobnieniu.`,
    highlights,
    bigThree: {
      sun: sunText,
      moon: moonText,
      ascendant: ascText,
    },
    planets,
    houses,
    aspects,
  };
}
