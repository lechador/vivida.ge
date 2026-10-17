/**
 * Open-Meteo Geocoding API wrapper.
 * Free, no API key required. Returns timezone alongside lat/lng,
 * which is exactly what we need for accurate astrology calculations.
 *
 * Docs: https://open-meteo.com/en/docs/geocoding-api
 *
 * Open-Meteo's index doesn't have most cities labeled in Georgian script,
 * passing language=ka returns weird matches (e.g. "თბილისი" → Tbilisi
 * International Airport instead of the city). To support Georgian input we
 * detect Georgian text and translate it to Latin before searching: dictionary
 * first for the cities our users actually type, generic transliteration as
 * fallback. Results display the original Georgian name back to the user
 * when we have a known mapping.
 */

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
/**
 * Open-Meteo resolves a timezone from coordinates. Used by the manual
 * coordinate fallback in onboarding, because a birth chart needs a timezone and
 * there is no way to derive one correctly in the browser.
 */
const TIMEZONE_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

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

// ─── Georgian script support ────────────────────────────────────────────

/** Range covers Mkhedruli (U+10A0–U+10FF) and extensions. */
const GEORGIAN_RE = /[Ⴀ-ჿⴀ-⴯Ა-Ჿ]/;

export function hasGeorgianScript(s: string): boolean {
  return GEORGIAN_RE.test(s);
}

const KA_TO_EN_CITY: Record<string, string> = {
  // Georgia, major
  თბილისი: "Tbilisi",
  ბათუმი: "Batumi",
  ქუთაისი: "Kutaisi",
  რუსთავი: "Rustavi",
  გორი: "Gori",
  ზუგდიდი: "Zugdidi",
  ფოთი: "Poti",
  სამტრედია: "Samtredia",
  ხაშური: "Khashuri",
  სენაკი: "Senaki",
  ზესტაფონი: "Zestaponi",
  მარნეული: "Marneuli",
  ახალციხე: "Akhaltsikhe",
  თელავი: "Telavi",
  ქობულეთი: "Kobuleti",
  ოზურგეთი: "Ozurgeti",
  კასპი: "Kaspi",
  ჭიათურა: "Chiatura",
  წყალტუბო: "Tskaltubo",
  სიღნაღი: "Sighnaghi",
  ბორჯომი: "Borjomi",
  ბაკურიანი: "Bakuriani",
  მცხეთა: "Mtskheta",
  გუდაური: "Gudauri",
  სტეფანწმინდა: "Stepantsminda",
  ყაზბეგი: "Kazbegi",
  ყვარელი: "Kvareli",
  ლაგოდეხი: "Lagodekhi",
  ცაგერი: "Tsageri",
  ამბროლაური: "Ambrolauri",
  მესტია: "Mestia",
  ხონი: "Khoni",
  ხობი: "Khobi",
  აბაშა: "Abasha",
  ახალქალაქი: "Akhalkalaki",
  ნინოწმინდა: "Ninotsminda",
  დმანისი: "Dmanisi",
  ბოლნისი: "Bolnisi",
  გარდაბანი: "Gardabani",
  თეთრიწყარო: "Tetritskaro",
  წალკა: "Tsalka",
  დუშეთი: "Dusheti",
  თიანეთი: "Tianeti",
  ცხინვალი: "Tskhinvali",
  სოხუმი: "Sukhumi",
  // International, frequently typed
  მოსკოვი: "Moscow",
  "სანქტ-პეტერბურგი": "Saint Petersburg",
  ერევანი: "Yerevan",
  ბაქო: "Baku",
  სტამბული: "Istanbul",
  ანკარა: "Ankara",
  კიევი: "Kyiv",
  მინსკი: "Minsk",
  "ნიუ-იორკი": "New York",
  "ლოს-ანჯელესი": "Los Angeles",
  ჩიკაგო: "Chicago",
  ვაშინგტონი: "Washington",
  ლონდონი: "London",
  პარიზი: "Paris",
  ბერლინი: "Berlin",
  მიუნხენი: "Munich",
  მადრიდი: "Madrid",
  ბარსელონა: "Barcelona",
  რომი: "Rome",
  მილანი: "Milan",
  ვენა: "Vienna",
  ამსტერდამი: "Amsterdam",
  ბრიუსელი: "Brussels",
  სტოკჰოლმი: "Stockholm",
  ჰელსინკი: "Helsinki",
  კოპენჰაგენი: "Copenhagen",
  ოსლო: "Oslo",
  ვარშავა: "Warsaw",
  პრაღა: "Prague",
  ბუდაპეშტი: "Budapest",
  ბუქარესტი: "Bucharest",
  სოფია: "Sofia",
  ათენი: "Athens",
  "თელ-ავივი": "Tel Aviv",
  იერუსალიმი: "Jerusalem",
  კაირო: "Cairo",
  დუბაი: "Dubai",
  დოჰა: "Doha",
  ტოკიო: "Tokyo",
  სეული: "Seoul",
  პეკინი: "Beijing",
  შანხაი: "Shanghai",
  "ჰონგ-კონგი": "Hong Kong",
  სინგაპური: "Singapore",
  ბანგკოკი: "Bangkok",
  მუმბაი: "Mumbai",
  დელი: "Delhi",
  ტორონტო: "Toronto",
  მონრეალი: "Montreal",
  მექსიკო: "Mexico City",
  "ბუენოს-აირესი": "Buenos Aires",
  "სან-პაულუ": "São Paulo",
  "რიო-დე-ჟანეირო": "Rio de Janeiro",
  სიდნეი: "Sydney",
  მელბურნი: "Melbourne",
};

const EN_TO_KA_CITY: Record<string, string> = Object.fromEntries(
  Object.entries(KA_TO_EN_CITY).map(([ka, en]) => [en.toLowerCase(), ka]),
);

const EN_TO_KA_COUNTRY: Record<string, string> = {
  georgia: "საქართველო",
  russia: "რუსეთი",
  armenia: "სომხეთი",
  azerbaijan: "აზერბაიჯანი",
  turkey: "თურქეთი",
  ukraine: "უკრაინა",
  "united states": "აშშ",
  "united kingdom": "გაერთიანებული სამეფო",
  germany: "გერმანია",
  france: "საფრანგეთი",
  italy: "იტალია",
  spain: "ესპანეთი",
  greece: "საბერძნეთი",
  israel: "ისრაელი",
  japan: "იაპონია",
  china: "ჩინეთი",
};

const KA_LETTER_TO_LATIN: Record<string, string> = {
  ა: "a",
  ბ: "b",
  გ: "g",
  დ: "d",
  ე: "e",
  ვ: "v",
  ზ: "z",
  თ: "t",
  ი: "i",
  კ: "k",
  ლ: "l",
  მ: "m",
  ნ: "n",
  ო: "o",
  პ: "p",
  ჟ: "zh",
  რ: "r",
  ს: "s",
  ტ: "t",
  უ: "u",
  ფ: "p",
  ქ: "k",
  ღ: "gh",
  ყ: "q",
  შ: "sh",
  ჩ: "ch",
  ც: "ts",
  ძ: "dz",
  წ: "ts",
  ჭ: "ch",
  ხ: "kh",
  ჯ: "j",
  ჰ: "h",
  ჱ: "e",
  ჲ: "y",
  ჳ: "w",
  ჴ: "kh",
  ჵ: "h",
  ჶ: "f",
};

/** Letter-by-letter Georgian → Latin */
function transliterateKa(s: string): string {
  return s.replace(/./gu, (c) => KA_LETTER_TO_LATIN[c.toLowerCase()] ?? c);
}

function toSearchQuery(input: string): string {
  const trimmed = input.trim();
  if (hasGeorgianScript(trimmed)) {
    const lower = trimmed.toLowerCase();
    if (KA_TO_EN_CITY[lower]) return KA_TO_EN_CITY[lower];
    const head = lower.split(/[,،]/)[0]?.trim();
    if (head && KA_TO_EN_CITY[head]) return KA_TO_EN_CITY[head];
    return transliterateKa(trimmed);
  }

  return trimmed;
}

function localizeForKa(
  name: string,
  country: string,
): { name: string; country: string } {
  const ka = EN_TO_KA_CITY[name.toLowerCase()];
  const kaCountry = EN_TO_KA_COUNTRY[country.toLowerCase()];
  return {
    name: ka ?? name,
    country: kaCountry ?? country,
  };
}

// ─── API ────────────────────────────────────────────────────────────────

export async function searchPlaces(
  query: string,
  { count = 6, language = "en" }: { count?: number; language?: string } = {},
): Promise<GeocodeResult[]> {
  const original = query.trim();
  if (original.length < 2) return [];

  const wasGeorgian = hasGeorgianScript(original);
  const searchQuery = toSearchQuery(original);

  const url = new URL(ENDPOINT);
  url.searchParams.set("name", searchQuery);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    headers: { "User-Agent": "vivida.ge/0.1" },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as OpenMeteoRaw;
  if (!data.results) return [];

  return data.results.map((r) => {
    let localized: { name: string; country: string };
    if (wasGeorgian) {
      localized = localizeForKa(r.name, r.country);
    } else {
      localized = { name: r.name, country: r.country };
    }

    return {
      id: r.id,
      name: localized.name,
      displayName: [localized.name, r.admin1, localized.country]
        .filter(Boolean)
        .join(", "),
      country: localized.country,
      countryCode: r.country_code,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      population: r.population,
    };
  });
}

/**
 * Validate manually entered coordinates.
 *
 * Pure and total so the onboarding fallback can run it on every keystroke
 * without a network round trip. Returns a normalised value or a reason code,
 * never throws.
 */
export type CoordinateCheck =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: "empty" | "not_a_number" | "out_of_range" };

export function validateCoordinates(
  rawLat: string,
  rawLon: string,
): CoordinateCheck {
  const latText = rawLat.trim();
  const lonText = rawLon.trim();
  if (!latText || !lonText) return { ok: false, reason: "empty" };

  // Accept a comma decimal separator, which Georgian/Russian/European users
  // type by habit ("41,69").
  const parse = (v: string) => Number(v.replace(",", "."));
  const latitude = parse(latText);
  const longitude = parse(lonText);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { ok: false, reason: "not_a_number" };
  }
  if (latitude < -90 || latitude > 90)
    return { ok: false, reason: "out_of_range" };
  if (longitude < -180 || longitude > 180) {
    return { ok: false, reason: "out_of_range" };
  }
  return { ok: true, latitude, longitude };
}

interface OpenMeteoTimezoneRaw {
  timezone?: string;
  utc_offset_seconds?: number;
}

/**
 * Resolve a timezone for coordinates the user typed by hand.
 *
 * This is the safety valve for onboarding: the primary path is a geocoded
 * birthplace search, but that is a network dependency, and a birthplace that
 * simply is not in the geocoder used to be a hard dead end on the last step
 * before the user would see their chart. A birth chart needs a real timezone,
 * so the fallback asks Open-Meteo rather than guessing an offset.
 *
 * Returns null when the lookup fails; the caller surfaces a retry.
 */
export async function timezoneForCoordinates(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const url = new URL(TIMEZONE_ENDPOINT);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  // No forecast variables: this call exists only to resolve `timezone`.
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("timezone", "auto");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "vivida.ge/0.1" },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OpenMeteoTimezoneRaw;
    const tz = data.timezone?.trim();
    return tz ? tz : null;
  } catch {
    return null;
  }
}
