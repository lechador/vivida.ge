/**
 * Open-Meteo Geocoding API wrapper.
 * Free, no API key required. Returns timezone alongside lat/lng,
 * which is exactly what we need for accurate astrology calculations.
 *
 * Docs: https://open-meteo.com/en/docs/geocoding-api
 */

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

export type GeocodeResult = {
  id: number;
  name: string;
  displayName: string;
  country: string;
  countryCode: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
};

interface OpenMeteoRaw {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    admin1?: string;
    admin2?: string;
    timezone: string;
    population?: number;
  }>;
}

export async function searchPlaces(
  query: string,
  { count = 6, language = "en" }: { count?: number; language?: string } = {}
): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(ENDPOINT);
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    headers: { "User-Agent": "vivida.ge/0.1" },
    next: { revalidate: 60 * 60 * 24 }, // cache identical queries for a day
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as OpenMeteoRaw;
  if (!data.results) return [];

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    displayName: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    country: r.country,
    countryCode: r.country_code,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
    population: r.population,
  }));
}
