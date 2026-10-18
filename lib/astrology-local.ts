/**
 * Local natal chart computation via circular-natal-horoscope-js.
 * Used as a fallback when freeastrologyapi.com is unavailable, or as a
 * deterministic offline source we can rely on regardless of API state.
 */

import { Origin, Horoscope } from "circular-natal-horoscope-js";

import { BODIES, signByIndex, signByLabelEn, signFromLongitude } from "./zodiac";
import type {
  HouseJson,
  NatalChartJson,
  PointJson,
} from "@/db/schema";

export { BODIES, signByIndex };
export type NatalChartData = NatalChartJson;
export type HouseCusp = HouseJson;

export type NatalInput = {
  /** ISO-style YYYY-MM-DD */
  date: string;
  /** HH:MM 24h, or null for unknown (we'll use 12:00). */
  time: string | null;
  latitude: number;
  longitude: number;
  /** IANA tz, e.g. "Asia/Tbilisi". Used only for documentation in JSON; the engine takes UTC offset internally via location + UTC seed. */
  timezone: string;
};

const BODY_KEYS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
] as const;

function buildPoint(longitude: number, house?: number | null, retro?: boolean): PointJson {
  const sign = signFromLongitude(longitude);
  const norm = ((longitude % 360) + 360) % 360;
  return {
    longitude: norm,
    signIndex: sign.index,
    signDegree: norm - sign.index * 30,
    house: house ?? null,
    retrograde: retro ?? undefined,
  };
}

export function computeNatalLocally(input: NatalInput): NatalChartJson {
  const [yStr, mStr, dStr] = input.date.split("-");
  const year = Number(yStr);
  const month = Number(mStr) - 1; // library uses 0-indexed months
  const day = Number(dStr);
  const [hStr, minStr] = (input.time ?? "12:00").split(":");
  const hour = Number(hStr);
  const minute = Number(minStr);

  const origin = new Origin({
    year,
    month,
    date: day,
    hour,
    minute,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  const horoscope = new Horoscope({
    origin,
    language: "en",
    zodiac: "tropical",
    houseSystem: "placidus",
    aspectPoints: [],
    aspectWithPoints: [],
    aspectTypes: [],
  });

  const ascSign = signByLabelEn(horoscope.Ascendant.Sign.label);
  const ascDeg = horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees;
  const ascendant: PointJson = {
    longitude: ascDeg,
    signIndex: ascSign?.index ?? Math.floor(ascDeg / 30),
    signDegree: ascDeg - Math.floor(ascDeg / 30) * 30,
    house: 1,
  };

  const mcDeg: number =
    horoscope.Midheaven?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0;
  const midheaven = buildPoint(mcDeg, 10);

  const bodies: Record<string, PointJson> = {};
  for (const key of BODY_KEYS) {
    const body = horoscope.CelestialBodies?.[key];
    if (!body) continue;
    const deg = body.ChartPosition?.Ecliptic?.DecimalDegrees;
    if (typeof deg !== "number") continue;
    bodies[key] = buildPoint(
      deg,
      body.House?.id ?? null,
      body.isRetrograde === true || body.isRetrograde === "true"
    );
  }

  const houses: HouseJson[] = (horoscope.Houses as Array<{
    id: number;
    ChartPosition: { StartPosition: { Ecliptic: { DecimalDegrees: number } } };
  }>).map((h) => {
    const deg = h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
    return {
      number: h.id,
      cuspLongitude: ((deg % 360) + 360) % 360,
      signIndex: signFromLongitude(deg).index,
    };
  });

  return {
    ascendant,
    midheaven,
    bodies,
    houses,
  };
}

export function computePositions(date: Date): Record<string, PointJson> {
  const iso = date.toISOString().slice(0, 10);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const chart = computeNatalLocally({
    date: iso,
    time: `${hh}:${mm}`,
    latitude: 41.7151,
    longitude: 44.8271,
    timezone: "Asia/Tbilisi",
  });
  return chart.bodies;
}

