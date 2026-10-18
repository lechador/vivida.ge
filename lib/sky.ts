import type { NatalChartData, HouseCusp } from "@/lib/astrology-local";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { computeTransits, detectCrossAspects, houseOfLongitude } from "@/lib/transits";
import { BODIES, signByIndex } from "@/lib/zodiac";
import { HOUSES } from "@/lib/houses";

export type SkyPlanet = {
  key: string;
  longitude: number;
  speedDegPerHour: number;
  retrograde: boolean;
  signIndex: number;
  house: number | null;
  houseText?: string;
  signText?: string;
};

export type SkyAspect = {
  transit: string;
  natal: string;
  kind: string;
  orb: number;
  title: string;
  body: string;
};

export type SkyData = {
  sampledAt: number;
  ascLng: number;
  houses: HouseCusp[];
  natal: Array<{ key: string; longitude: number }>;
  planets: SkyPlanet[];
  moon: SkyPlanet;
  aspects: SkyAspect[];
};

export async function composeSkyData(
  chart: NatalChartData,
  _locale: UserLocale = "ka",
): Promise<SkyData> {
  const now = new Date();
  const transits = computeTransits(now);
  const houses = chart.houses ?? [];
  const ascLng = chart.ascendant?.longitude ?? houses[0]?.cuspLongitude ?? 0;

  const planets: SkyPlanet[] = Object.entries(transits).map(([key, pos]) => {
    const signIndex = Math.floor(pos.longitude / 30) % 12;
    const house = houseOfLongitude(pos.longitude, houses);
    const sign = signByIndex(signIndex);
    const bodyMeta = BODIES[key];
    const houseMeta = house ? HOUSES[house] : undefined;
    return {
      key,
      longitude: pos.longitude,
      speedDegPerHour: pos.speedDegPerHour,
      retrograde: pos.retrograde,
      signIndex,
      house,
      houseText: houseMeta
        ? `${bodyMeta?.labelKa ?? key} ახლა გადის შენს ${houseMeta.labelKa}ს — ${houseMeta.meaningKa}`
        : undefined,
      signText: `${bodyMeta?.labelKa ?? key} ${sign.labelKa}ში აძლიერებს ${sign.element}ს ენერგიას.`,
    };
  });

  const moon =
    planets.find((p) => p.key === "moon") ??
    planets[0] ?? {
      key: "moon",
      longitude: 0,
      speedDegPerHour: 0.5,
      retrograde: false,
      signIndex: 0,
      house: 1,
    };

  const natalBodies = Object.fromEntries(
    Object.entries(chart.bodies ?? {}).map(([k, v]) => [k, { longitude: v.longitude }]),
  );
  const rawAspects = detectCrossAspects(transits, natalBodies).slice(0, 6);
  const aspects: SkyAspect[] = rawAspects.map((a) => ({
    transit: a.transit,
    natal: a.natal,
    kind: a.kind,
    orb: a.orb,
    title: `${BODIES[a.transit]?.labelKa ?? a.transit} · ${a.kind} · ${BODIES[a.natal]?.labelKa ?? a.natal}`,
    body: "ეს ასპექტი აკავშირებს მიმდინარე ცის მოძრაობას შენს ნატალურ პოზიციასთან და ქმნის დღის ემოციურ ფონს.",
  }));

  const natal = Object.entries(chart.bodies ?? {}).map(([key, val]) => ({
    key,
    longitude: val.longitude,
  }));

  return {
    sampledAt: now.getTime(),
    ascLng,
    houses,
    natal,
    planets,
    moon,
    aspects,
  };
}
