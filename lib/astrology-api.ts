/**
 * freeastrologyapi.com client.
 * Returns the same NatalChartJson shape as astrology-local.ts so callers
 * don't have to care which source produced the chart.
 *
 * Endpoint reference: https://json.freeastrologyapi.com/western/planets
 * (POST, x-api-key header)
 */

import { signFromLongitude, signByLabelEn } from "./zodiac";
import type { NatalChartJson, PointJson } from "@/db/schema";
import type { NatalInput } from "./astrology-local";

const PLANETS_URL = "https://json.freeastrologyapi.com/western/planets";

interface ApiPlanet {
  planet: { en: string };
  fullDegree: number;
  normDegree: number;
  isRetro?: string | boolean;
  zodiac_sign?: { number?: number; name?: { en?: string } };
  house?: number;
}

interface ApiResponse {
  statusCode: number;
  output?: ApiPlanet[];
}

/** Resolve an IANA timezone string to a numeric UTC offset for a given date. */
function offsetForDate(timezone: string, isoDate: string): number {
  const target = new Date(`${isoDate}T12:00:00Z`);
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(target);
    const tzPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    // shortOffset gives e.g. "GMT+4" or "GMT+05:30"
    const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(tzPart);
    if (!m) return 0;
    const sign = m[1] === "-" ? -1 : 1;
    const hours = Number(m[2]);
    const minutes = m[3] ? Number(m[3]) : 0;
    return sign * (hours + minutes / 60);
  } catch {
    return 0;
  }
}

function bodyKeyFromName(name: string): string | null {
  const lower = name.toLowerCase().trim();
  // Map API names to our canonical keys
  if (lower === "sun") return "sun";
  if (lower === "moon") return "moon";
  if (lower === "mercury") return "mercury";
  if (lower === "venus") return "venus";
  if (lower === "mars") return "mars";
  if (lower === "jupiter") return "jupiter";
  if (lower === "saturn") return "saturn";
  if (lower === "uranus") return "uranus";
  if (lower === "neptune") return "neptune";
  if (lower === "pluto") return "pluto";
  if (lower === "chiron" || lower === "chrion") return "chiron";
  if (lower === "ascendant") return "ascendant";
  if (lower === "mc" || lower === "midheaven") return "midheaven";
  return null;
}

function pointFromApi(p: ApiPlanet): PointJson {
  const longitude = ((p.fullDegree % 360) + 360) % 360;
  const apiName = p.zodiac_sign?.name?.en;
  const sign = apiName ? signByLabelEn(apiName) : undefined;
  const signIndex = sign?.index ?? signFromLongitude(longitude).index;
  return {
    longitude,
    signIndex,
    signDegree:
      typeof p.normDegree === "number"
        ? p.normDegree
        : longitude - signIndex * 30,
    house: p.house ?? null,
    retrograde: p.isRetro === true || p.isRetro === "True" || p.isRetro === "true",
  };
}

export async function fetchNatalFromApi(
  input: NatalInput,
  apiKey: string
): Promise<NatalChartJson> {
  const [year, month, day] = input.date.split("-").map(Number);
  const [hour, minute] = (input.time ?? "12:00").split(":").map(Number);
  const tzOffset = offsetForDate(input.timezone, input.date);

  const body = {
    year,
    month,
    date: day,
    hours: hour,
    minutes: minute,
    seconds: 0,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: tzOffset,
    config: {
      observation_point: "topocentric",
      ayanamsha: "tropical",
      language: "en",
    },
  };

  const res = await fetch(PLANETS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(
      `freeastrologyapi.com returned ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse;
  const points = json.output ?? [];

  const bodies: Record<string, PointJson> = {};
  let ascendant: PointJson | null = null;
  let midheaven: PointJson | null = null;

  for (const p of points) {
    const key = bodyKeyFromName(p.planet?.en ?? "");
    if (!key) continue;
    if (key === "ascendant") {
      ascendant = pointFromApi(p);
    } else if (key === "midheaven") {
      midheaven = pointFromApi(p);
    } else {
      bodies[key] = pointFromApi(p);
    }
  }

  if (!ascendant) {
    throw new Error("API response missing ascendant");
  }

  return {
    ascendant,
    midheaven: midheaven ?? { longitude: 0, signIndex: 0, signDegree: 0 },
    bodies,
    // Houses come from a separate endpoint; we leave empty here and let
    // local computation fill them in if needed by the caller.
    houses: [],
  };
}
