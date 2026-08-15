import type {
  ChartInterpretationJson,
  NatalAspectJson,
  NatalChartJson,
  PointJson,
} from "@/db/schema";
import { aspectKey } from "@/lib/aspects";
import { computeElementBalance, type Element } from "@/lib/elements";
import { houseDef, HOUSE_NUMBERS } from "@/lib/houses";
import { bodyMeta, signByIndex } from "@/lib/zodiac";
import {
  getLibraryEntryEn,
  getHouseLibraryEntryEn,
  getAspectLibraryEntryEn,
} from "@/lib/natal-library-en";

const ELEMENT_EN: Record<Element, string> = {
  ცეცხლი: "fire",
  მიწა: "earth",
  ჰაერი: "air",
  წყალი: "water",
};

const ELEMENT_STYLE: Record<Element, string> = {
  ცეცხლი: "direct, expressive and motivated by movement",
  მიწა: "grounded, practical and attentive to what can be sustained",
  ჰაერი: "curious, social and drawn to ideas and connections",
  წყალი: "intuitive, emotionally perceptive and responsive to atmosphere",
};

const MODALITY_EN: Record<string, string> = {
  კარდინალური: "cardinal",
  ფიქსირებული: "fixed",
  მუტაბელური: "mutable",
};

const MODALITY_STYLE: Record<string, string> = {
  კარდინალური: "initiates and creates momentum",
  ფიქსირებული: "stabilizes, commits and follows through",
  მუტაბელური: "adapts, translates and responds to change",
};

const ASPECT_EN: Record<NatalAspectJson["kind"], string> = {
  conjunction: "conjunction",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposition",
};

const ASPECT_DYNAMIC: Record<NatalAspectJson["kind"], string> = {
  conjunction:
    "These drives operate as one concentrated force. Their strengths reinforce each other, though separating their needs can take conscious effort.",
  sextile:
    "These parts of the chart support one another through opportunity. The connection becomes stronger when you actively use it.",
  square:
    "These needs create productive friction. The tension can become a source of skill once you stop forcing one side to silence the other.",
  trine:
    "These energies cooperate naturally. The ease is a genuine resource, especially when you give it direction instead of taking it for granted.",
  opposition:
    "These needs pull toward opposite ends of one axis. Integration comes through balance, perspective and room for both sides.",
};

function bodyName(key: string): string {
  return bodyMeta(key)?.labelEn ?? key[0].toUpperCase() + key.slice(1);
}

function fallbackPlacementText(
  key: string,
  point: PointJson,
  options: { role?: string; includeHouse?: boolean } = {},
): string {
  const meta = bodyMeta(key);
  const sign = signByIndex(point.signIndex);
  const element = ELEMENT_EN[sign.element];
  const modality = MODALITY_EN[sign.modality] ?? sign.modality;
  const role = options.role ?? meta?.meaningEn ?? "an important part of your chart";
  const house = point.house ? houseDef(point.house) : null;

  let text = `${bodyName(key)} in ${sign.labelEn} expresses ${role} in a ${ELEMENT_STYLE[sign.element]} way. ${sign.labelEn} is a ${modality} ${element} sign: it ${MODALITY_STYLE[sign.modality] ?? "responds in its own distinct rhythm"}.`;
  if (options.includeHouse !== false && house) {
    text += ` In your ${house.labelEn}, this becomes especially visible through ${house.themeEn.toLowerCase()}. ${house.meaningEn}`;
  }
  if (point.retrograde) {
    text += ` Because ${bodyName(key)} was retrograde, this function may be processed more privately or reflectively before it is expressed outwardly.`;
  }
  return text;
}

function fallbackAspectText(aspect: NatalAspectJson): string {
  const a = bodyMeta(aspect.a);
  const b = bodyMeta(aspect.b);
  const tightness =
    aspect.orb < 2
      ? "This is a tight, prominent pattern in your chart."
      : aspect.orb < 5
        ? "This is a clear recurring pattern in your chart."
        : "This is a broader background pattern in your chart.";

  return `${bodyName(aspect.a)} forms a ${ASPECT_EN[aspect.kind]} with ${bodyName(aspect.b)}. ${ASPECT_DYNAMIC[aspect.kind]} ${a?.labelEn ?? bodyName(aspect.a)} represents ${a?.meaningEn ?? "one inner drive"}, while ${b?.labelEn ?? bodyName(aspect.b)} represents ${b?.meaningEn ?? "another inner drive"}. ${tightness}`;
}

/**
 * Complete English interpretation generated from the chart itself using the
 * translated natal interpretation library (Big Three, planets, houses, aspects).
 */
export function buildEnglishChartInterpretation(
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

  // Big Three with full multi-paragraph English prose
  const sunText =
    getLibraryEntryEn("sun", sunSign.key) ??
    fallbackPlacementText("sun", sun, {
      role: "identity, vitality and the direction of growth",
    });
  const moonText =
    getLibraryEntryEn("moon", moonSign.key) ??
    fallbackPlacementText("moon", moon, {
      role: "emotional needs, instincts and the way you restore yourself",
    });
  const ascText =
    getLibraryEntryEn("ascendant", ascSign.key) ??
    fallbackPlacementText("ascendant", asc, {
      role: "your first response to life and the style others initially meet",
      includeHouse: false,
    });

  // 8 Planets with full multi-paragraph English prose
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
        getLibraryEntryEn(key, sign.key) ?? fallbackPlacementText(key, point);
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
    const cuspBody = getHouseLibraryEntryEn("cusp", n, sign.key);
    const occupantBodies = (occupantsByHouse.get(n) ?? [])
      .map((planet) => getHouseLibraryEntryEn("occupant", n, planet))
      .filter((b): b is string => Boolean(b));

    if (cuspBody) {
      houses[String(n)] = [cuspBody, ...occupantBodies].join("\n\n");
    } else {
      const def = houseDef(n);
      const presentNames = (occupantsByHouse.get(n) ?? []).map(bodyName);
      houses[String(n)] =
        `Your ${def.labelEn} begins in ${sign.labelEn}, bringing a ${ELEMENT_STYLE[sign.element]} approach to ${def.themeEn.toLowerCase()}. ${def.meaningEn}` +
        (presentNames.length > 0
          ? ` ${presentNames.join(", ")} ${presentNames.length === 1 ? "is" : "are"} placed here, making this area especially active and personally significant.`
          : " With no natal planets here, this area is still meaningful; its cusp sign describes how you tend to approach it.");
    }
  }

  // Aspects with full multi-paragraph English prose
  const aspects: Record<string, string> = {};
  for (const aspect of chart.aspects ?? []) {
    const key = aspectKey(aspect.a, aspect.b, aspect.kind);
    const aspectBody = getAspectLibraryEntryEn(aspect.a, aspect.b, aspect.kind);
    aspects[key] = aspectBody ?? fallbackAspectText(aspect);
  }

  const tightest = [...(chart.aspects ?? [])].sort((a, b) => a.orb - b.orb)[0];
  const highlights: NonNullable<ChartInterpretationJson["highlights"]> = [
    {
      title: `${ELEMENT_EN[dominant][0].toUpperCase() + ELEMENT_EN[dominant].slice(1)} leads your chart`,
      body: `${Math.round(balance.percentages[dominant])}% of the weighted chart emphasis falls in ${ELEMENT_EN[dominant]}. You are likely to return to a ${ELEMENT_STYLE[dominant]} mode when choices feel important.`,
    },
    {
      title: `${sunSign.labelEn} Sun, ${moonSign.labelEn} Moon`,
      body: `Your conscious direction speaks through ${sunSign.labelEn}, while your emotional reflexes speak through ${moonSign.labelEn}. Their relationship describes the ongoing conversation between what you choose and what you instinctively need.`,
    },
  ];
  if (tightest) {
    const aspectBody = getAspectLibraryEntryEn(tightest.a, tightest.b, tightest.kind);
    highlights.push({
      title: `${bodyName(tightest.a)} ${ASPECT_EN[tightest.kind]} ${bodyName(tightest.b)}`,
      body: aspectBody ? aspectBody.slice(0, 320) + "..." : fallbackAspectText(tightest),
    });
  } else {
    highlights.push({
      title: `${ascSign.labelEn} rising`,
      body: `You meet new situations through ${ascSign.labelEn}: ${ELEMENT_STYLE[ascSign.element]}. This is often what others notice before they see the rest of your chart.`,
    });
  }

  return {
    summary: `Your chart combines a ${sunSign.labelEn} Sun, ${moonSign.labelEn} Moon and ${ascSign.labelEn} Ascendant. The Sun describes the direction in which you become more fully yourself, the Moon shows what restores emotional safety, and the Ascendant shapes how you enter situations and begin new chapters. ${ELEMENT_EN[dominant][0].toUpperCase() + ELEMENT_EN[dominant].slice(1)} is the strongest element in the weighted chart, giving the whole pattern a ${ELEMENT_STYLE[dominant]} tone. Read these placements as a system: no single sign defines you on its own.`,
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
