/**
 * Open-Meteo Geocoding API wrapper.
 * Free, no API key required. Returns timezone alongside lat/lng,
 * which is exactly what we need for accurate astrology calculations.
 *
 * Docs: https://open-meteo.com/en/docs/geocoding-api
 *
 * Open-Meteo's index doesn't have most cities labeled in Georgian script —
 * passing language=ka returns weird matches (e.g. "თბილისი" → Tbilisi
 * International Airport instead of the city). To support Georgian input we
 * detect Georgian text and translate it to Latin before searching: dictionary
 * first for the cities our users actually type, generic transliteration as
 * fallback. Results display the original Georgian name back to the user
 * when we have a known mapping.
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

// ─── Georgian & Armenian script support ─────────────────────────────────

/** Range covers Mkhedruli (U+10A0–U+10FF) and extensions. */
const GEORGIAN_RE = /[Ⴀ-ჿⴀ-⴯Ა-Ჿ]/;

/** Range covers Armenian (U+0530–U+058F, U+FB13–U+FB17). */
const ARMENIAN_RE = /[\u0530-\u058F\uFB13-\uFB17]/;

export function hasGeorgianScript(s: string): boolean {
  return GEORGIAN_RE.test(s);
}

export function hasArmenianScript(s: string): boolean {
  return ARMENIAN_RE.test(s);
}

const KA_TO_EN_CITY: Record<string, string> = {
  // Georgia — major
  "თბილისი": "Tbilisi",
  "ბათუმი": "Batumi",
  "ქუთაისი": "Kutaisi",
  "რუსთავი": "Rustavi",
  "გორი": "Gori",
  "ზუგდიდი": "Zugdidi",
  "ფოთი": "Poti",
  "სამტრედია": "Samtredia",
  "ხაშური": "Khashuri",
  "სენაკი": "Senaki",
  "ზესტაფონი": "Zestaponi",
  "მარნეული": "Marneuli",
  "ახალციხე": "Akhaltsikhe",
  "თელავი": "Telavi",
  "ქობულეთი": "Kobuleti",
  "ოზურგეთი": "Ozurgeti",
  "კასპი": "Kaspi",
  "ჭიათურა": "Chiatura",
  "წყალტუბო": "Tskaltubo",
  "სიღნაღი": "Sighnaghi",
  "ბორჯომი": "Borjomi",
  "ბაკურიანი": "Bakuriani",
  "მცხეთა": "Mtskheta",
  "გუდაური": "Gudauri",
  "სტეფანწმინდა": "Stepantsminda",
  "ყაზბეგი": "Kazbegi",
  "ყვარელი": "Kvareli",
  "ლაგოდეხი": "Lagodekhi",
  "ცაგერი": "Tsageri",
  "ამბროლაური": "Ambrolauri",
  "მესტია": "Mestia",
  "ხონი": "Khoni",
  "ხობი": "Khobi",
  "აბაშა": "Abasha",
  "ახალქალაქი": "Akhalkalaki",
  "ნინოწმინდა": "Ninotsminda",
  "დმანისი": "Dmanisi",
  "ბოლნისი": "Bolnisi",
  "გარდაბანი": "Gardabani",
  "თეთრიწყარო": "Tetritskaro",
  "წალკა": "Tsalka",
  "დუშეთი": "Dusheti",
  "თიანეთი": "Tianeti",
  "ცხინვალი": "Tskhinvali",
  "სოხუმი": "Sukhumi",
  // International — frequently typed
  "მოსკოვი": "Moscow",
  "სანქტ-პეტერბურგი": "Saint Petersburg",
  "ერევანი": "Yerevan",
  "ბაქო": "Baku",
  "სტამბული": "Istanbul",
  "ანკარა": "Ankara",
  "კიევი": "Kyiv",
  "მინსკი": "Minsk",
  "ნიუ-იორკი": "New York",
  "ლოს-ანჯელესი": "Los Angeles",
  "ჩიკაგო": "Chicago",
  "ვაშინგტონი": "Washington",
  "ლონდონი": "London",
  "პარიზი": "Paris",
  "ბერლინი": "Berlin",
  "მიუნხენი": "Munich",
  "მადრიდი": "Madrid",
  "ბარსელონა": "Barcelona",
  "რომი": "Rome",
  "მილანი": "Milan",
  "ვენა": "Vienna",
  "ამსტერდამი": "Amsterdam",
  "ბრიუსელი": "Brussels",
  "სტოკჰოლმი": "Stockholm",
  "ჰელსინკი": "Helsinki",
  "კოპენჰაგენი": "Copenhagen",
  "ოსლო": "Oslo",
  "ვარშავა": "Warsaw",
  "პრაღა": "Prague",
  "ბუდაპეშტი": "Budapest",
  "ბუქარესტი": "Bucharest",
  "სოფია": "Sofia",
  "ათენი": "Athens",
  "თელ-ავივი": "Tel Aviv",
  "იერუსალიმი": "Jerusalem",
  "კაირო": "Cairo",
  "დუბაი": "Dubai",
  "დოჰა": "Doha",
  "ტოკიო": "Tokyo",
  "სეული": "Seoul",
  "პეკინი": "Beijing",
  "შანხაი": "Shanghai",
  "ჰონგ-კონგი": "Hong Kong",
  "სინგაპური": "Singapore",
  "ბანგკოკი": "Bangkok",
  "მუმბაი": "Mumbai",
  "დელი": "Delhi",
  "ტორონტო": "Toronto",
  "მონრეალი": "Montreal",
  "მექსიკო": "Mexico City",
  "ბუენოს-აირესი": "Buenos Aires",
  "სან-პაულუ": "São Paulo",
  "რიო-დე-ჟანეირო": "Rio de Janeiro",
  "სიდნეი": "Sydney",
  "მელბურნი": "Melbourne",
};

/** Armenian city mapping */
const AM_TO_EN_CITY: Record<string, string> = {
  // Armenia — major
  "երևան": "Yerevan",
  "գյումրի": "Gyumri",
  "վանաձոր": "Vanadzor",
  "վաղարշապատ": "Vagharshapat",
  "էջմիածին": "Echmiadzin",
  "աբովյան": "Abovyan",
  "հրազդան": "Hrazdan",
  "կապան": "Kapan",
  "արմավիր": "Armavir",
  "գավառ": "Gavar",
  "արտաշատ": "Artashat",
  "իջևան": "Ijevan",
  "դիլիջան": "Dilijan",
  "գորիս": "Goris",
  "սևան": "Sevan",
  "չարենցավան": "Charentsavan",
  "սիսիան": "Sisian",
  "աշտարակ": "Ashtarak",
  "արարատ": "Ararat",
  "մասիս": "Masis",
  "սպիտակ": "Spitak",
  "ստեփանավան": "Stepanavan",
  "ալավերդի": "Alaverdi",
  "ջերմուկ": "Jermuk",
  "քաջարան": "Kajaran",
  "մարտունի": "Martuni",
  "վարդենիս": "Vardenis",
  "եղեգնաձոր": "Yeghegnadzor",
  "բերդ": "Berd",
  "նոյեմբերյան": "Noyemberyan",
  "մեղրի": "Meghri",
  "ծաղկաձոր": "Tsaghkadzor",
  // International & Diaspora
  "թբիլիսի": "Tbilisi",
  "բաթումի": "Batumi",
  "քութայիսի": "Kutaisi",
  "ახալქალაქի": "Akhalkalaki",
  "ախալքալաք": "Akhalkalaki",
  "նինոծմինդա": "Ninotsminda",
  "մոսկվա": "Moscow",
  "սանկտ պետերբուրգ": "Saint Petersburg",
  "կրասնոդար": "Krasnodar",
  "սոչի": "Sochi",
  "դոնի ռոստով": "Rostov-on-Don",
  "լոս անջելես": "Los Angeles",
  "գլենդել": "Glendale",
  "բըրբանք": "Burbank",
  "փարիզ": "Paris",
  "մարսել": "Marseille",
  "լիոն": "Lyon",
  "լոնդոն": "London",
  "բեյրութ": "Beirut",
  "թեհրան": "Tehran",
  "ստամբուլ": "Istanbul",
  "դուբայ": "Dubai",
  "նյու յորք": "New York",
  "բոստոն": "Boston",
  "տորոնտո": "Toronto",
  "մոնրեալ": "Montreal",
  "բուենոս այրես": "Buenos Aires",
  "սիդնեյ": "Sydney",
  "բեռլին": "Berlin",
  "վիեննա": "Vienna",
  "հռոմ": "Rome",
  "աթենք": "Athens",
  "կիև": "Kyiv",
};

const EN_TO_KA_CITY: Record<string, string> = Object.fromEntries(
  Object.entries(KA_TO_EN_CITY).map(([ka, en]) => [en.toLowerCase(), ka])
);

const EN_TO_AM_CITY: Record<string, string> = Object.fromEntries(
  Object.entries(AM_TO_EN_CITY).map(([am, en]) => [en.toLowerCase(), am])
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

const EN_TO_AM_COUNTRY: Record<string, string> = {
  armenia: "Հայաստան",
  georgia: "Վրաստան",
  russia: "Ռուսաստան",
  "united states": "ԱՄՆ",
  "united kingdom": "Միացյալ Թագավորություն",
  france: "Ֆրանսիա",
  germany: "Գերմանիա",
  italy: "Իտալիա",
  spain: "Իսպանիա",
  greece: "Հունաստան",
  iran: "Իրան",
  lebanon: "Լիբանան",
  turkey: "Թուրքիա",
  ukraine: "Ուկրաինա",
  israel: "Իսրայել",
  canada: "Կանադա",
  australia: "Ավստրալիա",
  argentina: "Արգենտինա",
  cyprus: "Կիպրոս",
  uae: "ԱՄԷ",
  "united arab emirates": "Արաբական Միացյալ Էմիրություններ",
};

const KA_LETTER_TO_LATIN: Record<string, string> = {
  "ა": "a",  "ბ": "b",  "გ": "g",  "დ": "d",  "ე": "e",
  "ვ": "v",  "ზ": "z",  "თ": "t",  "ი": "i",  "კ": "k",
  "ლ": "l",  "მ": "m",  "ნ": "n",  "ო": "o",  "პ": "p",
  "ჟ": "zh", "რ": "r",  "ს": "s",  "ტ": "t",  "უ": "u",
  "ფ": "p",  "ქ": "k",  "ღ": "gh", "ყ": "q",  "შ": "sh",
  "ჩ": "ch", "ც": "ts", "ძ": "dz", "წ": "ts", "ჭ": "ch",
  "ხ": "kh", "ჯ": "j",  "ჰ": "h",
  "ჱ": "e",  "ჲ": "y",  "ჳ": "w",  "ჴ": "kh", "ჵ": "h",  "ჶ": "f",
};

const AM_LETTER_TO_LATIN: Record<string, string> = {
  "ա": "a",  "բ": "b",  "գ": "g",  "դ": "d",  "ե": "e",
  "զ": "z",  "է": "e",  "ը": "y",  "թ": "t",  "ժ": "zh",
  "ի": "i",  "լ": "l",  "խ": "kh", "ծ": "ts", "կ": "k",
  "հ": "h",  "ձ": "dz", "ղ": "gh", "ճ": "ch", "մ": "m",
  "յ": "y",  "ն": "n",  "շ": "sh", "ո": "o",  "չ": "ch",
  "պ": "p",  "ջ": "j",  "ռ": "r",  "ս": "s",  "վ": "v",
  "տ": "t",  "ր": "r",  "ց": "ts", "ու": "u", "փ": "p",
  "ք": "k",  "և": "ev", "օ": "o",  "ֆ": "f",
};

/** Letter-by-letter Georgian → Latin */
function transliterateKa(s: string): string {
  return s.replace(/./gu, (c) => KA_LETTER_TO_LATIN[c.toLowerCase()] ?? c);
}

/** Letter-by-letter Armenian → Latin */
function transliterateAm(s: string): string {
  return s.replace(/./gu, (c) => AM_LETTER_TO_LATIN[c.toLowerCase()] ?? c);
}

function toSearchQuery(input: string): string {
  const trimmed = input.trim();
  if (hasArmenianScript(trimmed)) {
    const lower = trimmed.toLowerCase();
    if (AM_TO_EN_CITY[lower]) return AM_TO_EN_CITY[lower];
    const head = lower.split(/[,،]/)[0]?.trim();
    if (head && AM_TO_EN_CITY[head]) return AM_TO_EN_CITY[head];
    return transliterateAm(trimmed);
  }

  if (hasGeorgianScript(trimmed)) {
    const lower = trimmed.toLowerCase();
    if (KA_TO_EN_CITY[lower]) return KA_TO_EN_CITY[lower];
    const head = lower.split(/[,،]/)[0]?.trim();
    if (head && KA_TO_EN_CITY[head]) return KA_TO_EN_CITY[head];
    return transliterateKa(trimmed);
  }

  return trimmed;
}

function localizeForKa(name: string, country: string): { name: string; country: string } {
  const ka = EN_TO_KA_CITY[name.toLowerCase()];
  const kaCountry = EN_TO_KA_COUNTRY[country.toLowerCase()];
  return {
    name: ka ?? name,
    country: kaCountry ?? country,
  };
}

function localizeForAm(name: string, country: string): { name: string; country: string } {
  const am = EN_TO_AM_CITY[name.toLowerCase()];
  const amCountry = EN_TO_AM_COUNTRY[country.toLowerCase()];
  return {
    name: am ? am.charAt(0).toUpperCase() + am.slice(1) : name,
    country: amCountry ?? country,
  };
}

// ─── API ────────────────────────────────────────────────────────────────

export async function searchPlaces(
  query: string,
  { count = 6, language = "en" }: { count?: number; language?: string } = {}
): Promise<GeocodeResult[]> {
  const original = query.trim();
  if (original.length < 2) return [];

  const wasGeorgian = hasGeorgianScript(original);
  const wasArmenian = hasArmenianScript(original);
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
    if (wasArmenian) {
      localized = localizeForAm(r.name, r.country);
    } else if (wasGeorgian) {
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

