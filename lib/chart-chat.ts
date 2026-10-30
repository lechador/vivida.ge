/**
 * Builds the system prompt for "chat with your chart", grounds the AI
 * astrologer in the user's actual computed natal chart, live sky transits,
 * and verified tropical ephemeris so answers reference real astronomical
 * placements rather than LLM guesswork.
 */
import {
  bodyMeta,
  formatDegree,
  signByIndex,
  signFromLongitude,
} from "@/lib/zodiac";
import { computeNatalLocally } from "@/lib/astrology-local";
import {
  computeTransits,
  detectCrossAspects,
  houseOfLongitude,
} from "@/lib/transits";
import type { ChartSalience } from "@/lib/report-salience";
import type { HouseJson, NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  depthInstruction,
  distressInstruction,
  type AskDepth,
  type DistressLevel,
} from "@/lib/ask-memory-pure";

const ASPECT_KA: Record<string, string> = {
  conjunction: "კონიუნქცია",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრინი",
  opposition: "ოპოზიცია",
};

const PLANET_ORDER = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
];

const TRANSIT_PLANET_ORDER = [
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
] as const;

/**
 * Verified Western Tropical ephemeris sign ingresses (2024–2030) computed via
 * circular-natal-horoscope-js so the AI never guesses outer-planet signs/years.
 */
const OUTER_EPHEMERIS_SEGMENTS: ReadonlyArray<{
  body: "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";
  signIndex: number;
  start: string;
  end: string;
}> = [
  // Jupiter
  { body: "jupiter", signIndex: 2, start: "2024-05-26", end: "2025-06-09" },
  { body: "jupiter", signIndex: 3, start: "2025-06-10", end: "2026-06-29" },
  { body: "jupiter", signIndex: 4, start: "2026-06-30", end: "2027-07-25" },
  { body: "jupiter", signIndex: 5, start: "2027-07-26", end: "2028-08-23" },
  { body: "jupiter", signIndex: 6, start: "2028-08-24", end: "2029-09-23" },
  { body: "jupiter", signIndex: 7, start: "2029-09-24", end: "2030-10-22" },
  // Saturn
  { body: "saturn", signIndex: 11, start: "2023-03-07", end: "2025-05-24" },
  { body: "saturn", signIndex: 0, start: "2025-05-25", end: "2025-08-31" },
  { body: "saturn", signIndex: 11, start: "2025-09-01", end: "2026-02-13" },
  { body: "saturn", signIndex: 0, start: "2026-02-14", end: "2028-04-12" },
  { body: "saturn", signIndex: 1, start: "2028-04-13", end: "2030-05-31" },
  // Uranus
  { body: "uranus", signIndex: 1, start: "2019-03-06", end: "2025-07-06" },
  { body: "uranus", signIndex: 2, start: "2025-07-07", end: "2025-11-07" },
  { body: "uranus", signIndex: 1, start: "2025-11-08", end: "2026-04-25" },
  { body: "uranus", signIndex: 2, start: "2026-04-26", end: "2032-08-03" },
  // Neptune
  { body: "neptune", signIndex: 11, start: "2012-02-03", end: "2025-03-29" },
  { body: "neptune", signIndex: 0, start: "2025-03-30", end: "2025-10-21" },
  { body: "neptune", signIndex: 11, start: "2025-10-22", end: "2026-01-26" },
  { body: "neptune", signIndex: 0, start: "2026-01-27", end: "2038-05-21" },
  // Pluto
  { body: "pluto", signIndex: 10, start: "2024-11-19", end: "2043-03-08" },
];

function bodyLabel(key: string, en: boolean): string {
  if (en) return key[0].toUpperCase() + key.slice(1);
  if (key === "ascendant") return "ასცენდენტი";
  if (key === "midheaven") return "მედიუმ ცელი (MC)";
  return bodyMeta(key)?.labelKa ?? key;
}

/** Which natal houses (in order) a 30° zodiac sign overlaps in a Placidus chart. */
function housesForSign(signIndex: number, houses: HouseJson[]): number[] {
  if (!houses || houses.length < 12) return [];
  const seen: number[] = [];
  for (const offset of [1, 10, 20, 29]) {
    const h = houseOfLongitude(signIndex * 30 + offset, houses);
    if (h != null && !seen.includes(h)) seen.push(h);
  }
  return seen;
}

/** Detect any full 30° sign intercepted strictly inside a Placidus house arc. */
function interceptedSignsInHouse(
  startLng: number,
  endLng: number,
  en: boolean,
): string[] {
  const norm = (x: number) => ((x % 360) + 360) % 360;
  const a = norm(startLng);
  const b = norm(endLng);
  const arcLen = a <= b ? b - a : 360 - a + b;
  if (arcLen <= 30) return [];
  const out: string[] = [];
  for (let s = 0; s < 12; s++) {
    const sStart = s * 30;
    const sEnd = s * 30 + 30;
    const dStart = (sStart - a + 360) % 360;
    const dEnd = (sEnd - a + 360) % 360;
    if (dStart > 0 && dEnd > dStart && dEnd < arcLen) {
      const meta = signByIndex(s);
      out.push(en ? meta.labelEn : meta.labelKa);
    }
  }
  return out;
}

function formatHousesBlock(chart: NatalChartJson, en: boolean): string[] {
  const houses = [...chart.houses].sort((a, b) => a.number - b.number);
  if (houses.length === 0) return [];
  const occupants: Record<number, string[]> = {};
  for (const [k, body] of Object.entries(chart.bodies)) {
    if (body?.house) {
      (occupants[body.house] ??= []).push(bodyLabel(k, en));
    }
  }
  const lines: string[] = [
    en
      ? "House cusps (Placidus, exact spans & occupants):"
      : "სახლების კუსპიდები (Placidus, ზუსტი საზღვრები და პლანეტები სახლებში):",
  ];
  for (let i = 0; i < houses.length; i++) {
    const h = houses[i];
    const next = houses[(i + 1) % houses.length];
    const startSign = signByIndex(h.signIndex);
    const startDeg = formatDegree(
      (((h.cuspLongitude % 360) + 360) % 360) - h.signIndex * 30,
    );
    const endSign = next ? signByIndex(next.signIndex) : startSign;
    const endDeg = next
      ? formatDegree(
          (((next.cuspLongitude % 360) + 360) % 360) - next.signIndex * 30,
        )
      : "";
    const intercepted = next
      ? interceptedSignsInHouse(h.cuspLongitude, next.cuspLongitude, en)
      : [];
    const interceptedNote =
      intercepted.length > 0
        ? en
          ? ` (intercepted sign inside house ${h.number}: ${intercepted.join(", ")})`
          : ` (ჩართული ნიშანი მე-${h.number} სახლში: ${intercepted.join(", ")})`
        : "";
    const occ = occupants[h.number]?.length
      ? en
        ? ` — planets: ${occupants[h.number].join(", ")}`
        : ` — პლანეტები: ${occupants[h.number].join(", ")}`
      : "";
    lines.push(
      en
        ? `- House ${h.number}: ${startSign.labelEn} ${startDeg} → ${endSign.labelEn} ${endDeg}${interceptedNote}${occ}`
        : `- მე-${h.number} სახლი: ${startSign.labelKa} ${startDeg} → ${endSign.labelKa} ${endDeg}${interceptedNote}${occ}`,
    );
  }
  // Keep the compact single-line summary too so existing substring checks stay happy.
  lines.push(
    (en ? "House signs: " : "სახლების ნიშნები: ") +
      houses
        .map(
          (h) =>
            `${h.number}-${en ? signByIndex(h.signIndex).labelEn : signByIndex(h.signIndex).labelKa}`,
        )
        .join(", "),
  );
  return lines;
}

function buildTransitsAndEphemerisBlock(
  chart: NatalChartJson,
  en: boolean,
  now: Date = new Date(),
): string[] {
  const lines: string[] = [];
  const todayIso = now.toISOString().slice(0, 10);
  lines.push(
    en
      ? `\nCurrent date (UTC): ${todayIso}`
      : `\nდღევანდელი თარიღი: ${todayIso}`,
  );

  try {
    const transits = computeTransits(now);
    lines.push(
      en
        ? "Today's live sky transits (with the user's natal house):"
        : "დღევანდელი ცის ტრანზიტები (მომხმარებლის ნატალურ სახლებში):",
    );
    for (const key of TRANSIT_PLANET_ORDER) {
      const t = transits[key];
      if (!t) continue;
      const sign = signFromLongitude(t.longitude);
      const deg = formatDegree(t.longitude - sign.index * 30);
      const h = houseOfLongitude(t.longitude, chart.houses);
      const hNote = h
        ? en
          ? `, in natal house ${h}`
          : `, ნატალურ მე-${h} სახლში`
        : "";
      lines.push(
        `- ${bodyLabel(key, en)}: ${en ? sign.labelEn : sign.labelKa} ${deg}${hNote}`,
      );
    }

    const natalPoints: Record<string, { longitude: number }> = {};
    for (const [k, v] of Object.entries(chart.bodies)) {
      if (v) natalPoints[k] = { longitude: v.longitude };
    }
    if (chart.ascendant) {
      natalPoints.ascendant = { longitude: chart.ascendant.longitude };
    }
    if (chart.midheaven) {
      natalPoints.midheaven = { longitude: chart.midheaven.longitude };
    }
    const cross = detectCrossAspects(transits, natalPoints).slice(0, 6);
    if (cross.length > 0) {
      lines.push(
        en
          ? "Active transit-to-natal aspects today:"
          : "დღეს აქტიური ტრანზიტული ასპექტები ნატალურ რუკასთან:",
      );
      for (const c of cross) {
        const aspectName = en ? c.kind : (ASPECT_KA[c.kind] ?? c.kind);
        lines.push(
          en
            ? `- Transiting ${bodyLabel(c.transit, true)} ${aspectName} natal ${bodyLabel(c.natal, true)} (orb ${c.orb.toFixed(1)}°)`
            : `- ტრანზიტული ${bodyLabel(c.transit, false)} ${aspectName} ნატალურ ${bodyLabel(c.natal, false)}-თან (ორბი ${c.orb.toFixed(1)}°)`,
        );
      }
    }
  } catch {
    /* ignore transit computation errors */
  }

  lines.push(
    en
      ? "Verified Tropical Ephemeris calendar (2024–2030) for outer planets & which natal houses they transit:"
      : "უზუსტესი ტროპიკული ეფემერიდების კალენდარი (2024–2030) ნელი პლანეტებისთვის და რომელ ნატალურ სახლს გადიან:",
  );
  for (const seg of OUTER_EPHEMERIS_SEGMENTS) {
    const sign = signByIndex(seg.signIndex);
    const hs = housesForSign(seg.signIndex, chart.houses);
    const houseNote =
      hs.length > 0
        ? en
          ? ` → transits natal house ${hs.join("/")}`
          : ` → გადის ნატალურ მე-${hs.join("/მე-")} სახლს`
        : "";
    lines.push(
      `- ${bodyLabel(seg.body, en)}: ${en ? sign.labelEn : sign.labelKa} (${seg.start} .. ${seg.end})${houseNote}`,
    );
  }

  return lines;
}

const KNOWN_CITIES: ReadonlyArray<{
  patterns: string[];
  labelKa: string;
  labelEn: string;
  lat: number;
  lng: number;
  tz: string;
}> = [
  {
    patterns: ["თბილის", "tbilisi"],
    labelKa: "თბილისი",
    labelEn: "Tbilisi",
    lat: 41.6914,
    lng: 44.8341,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["ქუთაის", "kutaisi"],
    labelKa: "ქუთაისი",
    labelEn: "Kutaisi",
    lat: 42.2679,
    lng: 42.718,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["ბათუმ", "batumi"],
    labelKa: "ბათუმი",
    labelEn: "Batumi",
    lat: 41.6168,
    lng: 41.6367,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["რუსთავ", "rustavi"],
    labelKa: "რუსთავი",
    labelEn: "Rustavi",
    lat: 41.5495,
    lng: 44.9932,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["გორ", "gori"],
    labelKa: "გორი",
    labelEn: "Gori",
    lat: 41.9842,
    lng: 44.1158,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["ზუგდიდ", "zugdidi"],
    labelKa: "ზუგდიდი",
    labelEn: "Zugdidi",
    lat: 42.5088,
    lng: 41.8709,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["ფოთ", "poti"],
    labelKa: "ფოთი",
    labelEn: "Poti",
    lat: 42.1462,
    lng: 41.672,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["თელავ", "telavi"],
    labelKa: "თელავი",
    labelEn: "Telavi",
    lat: 41.9198,
    lng: 45.4731,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["ახალციხ", "akhaltsikhe"],
    labelKa: "ახალციხე",
    labelEn: "Akhaltsikhe",
    lat: 41.639,
    lng: 42.9826,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["სამტრედი", "samtredia"],
    labelKa: "სამტრედია",
    labelEn: "Samtredia",
    lat: 42.1537,
    lng: 42.3352,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["სენაკ", "senaki"],
    labelKa: "სენაკი",
    labelEn: "Senaki",
    lat: 42.2704,
    lng: 42.0675,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["ზესტაფონ", "zestafoni"],
    labelKa: "ზესტაფონი",
    labelEn: "Zestafoni",
    lat: 42.11,
    lng: 43.0525,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["მარნეულ", "marneuli"],
    labelKa: "მარნეული",
    labelEn: "Marneuli",
    lat: 41.4759,
    lng: 44.8089,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["ქობულეთ", "kobuleti"],
    labelKa: "ქობულეთი",
    labelEn: "Kobuleti",
    lat: 41.8214,
    lng: 41.7753,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["ოზურგეთ", "ozurgeti"],
    labelKa: "ოზურგეთი",
    labelEn: "Ozurgeti",
    lat: 41.9244,
    lng: 42.0068,
    tz: "Asia/Tbilisi",
  },
  {
    patterns: ["სოხუმ", "sukhumi"],
    labelKa: "სოხუმი",
    labelEn: "Sukhumi",
    lat: 43.0015,
    lng: 41.0234,
    tz: "Asia/Tbilisi",
  },
];

/**
 * When a user pastes another person's birth date/time in chat (e.g. partner or
 * child: "24/09/1988 11:00 თბილისი"), compute their real natal chart with the
 * ephemeris engine so the AI never guesses their Ascendant, Moon or houses.
 */
export function buildMentionedChartsContext(
  messages: string[],
  locale: UserLocale = "ka",
): string {
  if (!messages || messages.length === 0) return "";
  const en = locale === "en";
  const found = new Map<
    string,
    { date: string; time: string | null; cityIdx: number }
  >();

  let lastDateKey: string | null = null;

  for (const raw of messages) {
    if (!raw) continue;
    const lower = raw.toLowerCase();

    let cityIdx = 0; // default Tbilisi
    for (let i = 0; i < KNOWN_CITIES.length; i++) {
      if (KNOWN_CITIES[i].patterns.some((p) => lower.includes(p))) {
        cityIdx = i;
        break;
      }
    }

    // Extract time like "11:00", "15:30", "11:00 PM", "დილის 11:00", "საღამოს 11:00"
    let parsedTime: string | null = null;
    const timeMatch =
      /(?:(დილის|საღამოს|ღამის)\s*)?\b([01]?\d|2[0-3]):([0-5]\d)(?:\s*(am|pm))?\b/i.exec(
        raw,
      );
    if (timeMatch) {
      const periodKa = (timeMatch[1] ?? "").toLowerCase();
      let hh = Number(timeMatch[2]);
      const mm = Number(timeMatch[3]);
      const ampm = (timeMatch[4] ?? "").toLowerCase();
      if (
        (ampm === "pm" || periodKa === "საღამოს" || periodKa === "ღამის") &&
        hh < 12
      ) {
        hh += 12;
      } else if ((ampm === "am" || periodKa === "დილის") && hh === 12) {
        hh = 0;
      }
      parsedTime = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }

    // Match DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY or YYYY-MM-DD
    const dmyRegex =
      /\b(0?[1-9]|[12]\d|3[01])[./-](0?[1-9]|1[0-2])[./-](19\d\d|20[0-2]\d)\b/g;
    const ymdRegex =
      /\b(19\d\d|20[0-2]\d)-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])\b/g;

    let matchedDateInTurn = false;
    for (const m of raw.matchAll(dmyRegex)) {
      const dd = String(Number(m[1])).padStart(2, "0");
      const mm = String(Number(m[2])).padStart(2, "0");
      const yyyy = m[3];
      const iso = `${yyyy}-${mm}-${dd}`;
      matchedDateInTurn = true;
      lastDateKey = iso;
      const prev = found.get(iso);
      found.set(iso, {
        date: iso,
        time: parsedTime ?? prev?.time ?? null,
        cityIdx: cityIdx || prev?.cityIdx || 0,
      });
    }
    for (const m of raw.matchAll(ymdRegex)) {
      const yyyy = m[1];
      const mm = String(Number(m[2])).padStart(2, "0");
      const dd = String(Number(m[3])).padStart(2, "0");
      const iso = `${yyyy}-${mm}-${dd}`;
      matchedDateInTurn = true;
      lastDateKey = iso;
      const prev = found.get(iso);
      found.set(iso, {
        date: iso,
        time: parsedTime ?? prev?.time ?? null,
        cityIdx: cityIdx || prev?.cityIdx || 0,
      });
    }

    // If a follow-up turn clarifies the time for the previously mentioned date
    if (
      !matchedDateInTurn &&
      parsedTime &&
      lastDateKey &&
      found.has(lastDateKey)
    ) {
      const prev = found.get(lastDateKey)!;
      found.set(lastDateKey, {
        ...prev,
        time: parsedTime,
        cityIdx: cityIdx || prev.cityIdx,
      });
    }
  }

  if (found.size === 0) return "";

  const blocks: string[] = [
    en
      ? "\nComputed ephemeris chart(s) for birth date(s) mentioned in the conversation (use these exact positions, never guess):"
      : "\nჩატში ნახსენები სხვა ადამიან(ებ)ის ზუსტი გამოთვლილი რუკა ეფემერიდებით (გამოიყენე მხოლოდ ეს ზუსტი მონაცემები):",
  ];

  for (const item of Array.from(found.values()).slice(-3)) {
    try {
      const city = KNOWN_CITIES[item.cityIdx] ?? KNOWN_CITIES[0];
      const computed = computeNatalLocally({
        date: item.date,
        time: item.time,
        latitude: city.lat,
        longitude: city.lng,
        timezone: city.tz,
      });
      const sun = computed.bodies.sun;
      const moon = computed.bodies.moon;
      const asc = computed.ascendant;
      const timeLabel = item.time
        ? item.time
        : en
          ? "time unknown (noon used; Ascendant/houses approximate)"
          : "დრო უცნობია (12:00 გამოყენებულია; ასცენდენტი/სახლები პირობითია)";
      blocks.push(
        en
          ? `• Birth data: ${item.date}, ${timeLabel}, ${city.labelEn}`
          : `• მონაცემები: ${item.date}, ${timeLabel}, ${city.labelKa}`,
      );
      const sunHouse = sun.house
        ? en
          ? ` (house ${sun.house})`
          : ` (მე-${sun.house} სახლი)`
        : "";
      const moonHouse = moon.house
        ? en
          ? ` (house ${moon.house})`
          : ` (მე-${moon.house} სახლი)`
        : "";
      blocks.push(
        en
          ? `  Big three: Sun ${signByIndex(sun.signIndex).labelEn} ${formatDegree(sun.signDegree)}${sunHouse}, Moon ${signByIndex(moon.signIndex).labelEn} ${formatDegree(moon.signDegree)}${moonHouse}, Ascendant ${signByIndex(asc.signIndex).labelEn} ${formatDegree(asc.signDegree)}`
          : `  დიდი სამეული: მზე ${signByIndex(sun.signIndex).labelKa} ${formatDegree(sun.signDegree)}${sunHouse}, მთვარე ${signByIndex(moon.signIndex).labelKa} ${formatDegree(moon.signDegree)}${moonHouse}, ამომავალი ${signByIndex(asc.signIndex).labelKa} ${formatDegree(asc.signDegree)}`,
      );
      const planetParts: string[] = [];
      for (const k of PLANET_ORDER) {
        const p = computed.bodies[k];
        if (!p) continue;
        const sign = signByIndex(p.signIndex);
        const h = p.house ? (en ? ` H${p.house}` : ` მე-${p.house} სახლი`) : "";
        const r = p.retrograde ? " (R)" : "";
        planetParts.push(
          `${bodyLabel(k, en)}: ${en ? sign.labelEn : sign.labelKa} ${formatDegree(p.signDegree)}${h}${r}`,
        );
      }
      blocks.push(
        `  ${en ? "Planets" : "პლანეტები"}: ${planetParts.join("; ")}`,
      );
      const sortedH = [...computed.houses].sort((a, b) => a.number - b.number);
      blocks.push(
        `  ${en ? "Houses" : "სახლები"}: ` +
          sortedH
            .map((h) => {
              const s = signByIndex(h.signIndex);
              const deg = formatDegree(
                (((h.cuspLongitude % 360) + 360) % 360) - h.signIndex * 30,
              );
              return `${h.number}-${en ? s.labelEn : s.labelKa} ${deg}`;
            })
            .join(", "),
      );
    } catch {
      /* ignore invalid date */
    }
  }

  return blocks.length > 1 ? blocks.join("\n") : "";
}

/** Compact, factual summary of the chart + live transits + verified ephemeris. */
export function buildChartContext(
  chart: NatalChartJson,
  salience: ChartSalience,
  locale: UserLocale = "ka",
  now: Date = new Date(),
): string {
  const en = locale === "en";
  const lines: string[] = [];

  const sun = chart.bodies.sun;
  const moon = chart.bodies.moon;
  const asc = chart.ascendant;
  const mc = chart.midheaven;
  const sunHouse = sun.house
    ? en
      ? ` (house ${sun.house})`
      : ` (მე-${sun.house} სახლი)`
    : "";
  const moonHouse = moon.house
    ? en
      ? ` (house ${moon.house})`
      : ` (მე-${moon.house} სახლი)`
    : "";
  const mcNote = mc
    ? en
      ? `, Midheaven (MC) in ${signByIndex(mc.signIndex).labelEn} ${formatDegree(mc.signDegree)} (house 10)`
      : `, მედიუმ ცელი (MC) ${signByIndex(mc.signIndex).labelKa} ${formatDegree(mc.signDegree)} (მე-10 სახლი)`
    : "";
  lines.push(
    en
      ? `Big three: Sun in ${signByIndex(sun.signIndex).labelEn} ${formatDegree(sun.signDegree)}${sunHouse}, ` +
          `Moon in ${signByIndex(moon.signIndex).labelEn} ${formatDegree(moon.signDegree)}${moonHouse}, ` +
          `Ascendant in ${signByIndex(asc.signIndex).labelEn} ${formatDegree(asc.signDegree)} (house 1)${mcNote}`
      : `დიდი სამეული: მზე ${signByIndex(sun.signIndex).labelKa} ${formatDegree(sun.signDegree)}${sunHouse}, ` +
          `მთვარე ${signByIndex(moon.signIndex).labelKa} ${formatDegree(moon.signDegree)}${moonHouse}, ` +
          `ამომავალი ${signByIndex(asc.signIndex).labelKa} ${formatDegree(asc.signDegree)} (1-ლი სახლი)${mcNote}`,
  );

  lines.push(en ? "Planets:" : "პლანეტები:");
  for (const key of PLANET_ORDER) {
    const p = chart.bodies[key];
    if (!p) continue;
    const label = bodyLabel(key, en);
    const house = p.house
      ? en
        ? `, house ${p.house}`
        : `, მე-${p.house} სახლი`
      : "";
    const retro = p.retrograde ? (en ? ", retrograde" : ", რეტროგრადი") : "";
    const sign = signByIndex(p.signIndex);
    lines.push(
      `- ${label}: ${en ? sign.labelEn : sign.labelKa} ${formatDegree(p.signDegree)}${house}${retro}`,
    );
  }

  lines.push(...formatHousesBlock(chart, en));

  const ep = salience.elements.percentages;
  lines.push(
    en
      ? `Elements: fire ${Math.round(ep["ცეცხლი"])}%, earth ${Math.round(ep["მიწა"])}%, ` +
          `air ${Math.round(ep["ჰაერი"])}%, water ${Math.round(ep["წყალი"])}%`
      : `ელემენტები: ცეცხლი ${Math.round(ep["ცეცხლი"])}%, მიწა ${Math.round(ep["მიწა"])}%, ` +
          `ჰაერი ${Math.round(ep["ჰაერი"])}%, წყალი ${Math.round(ep["წყალი"])}% ` +
          `(დომინანტი: ${salience.elements.dominant})`,
  );
  const mp = salience.modality.percentages;
  lines.push(
    en
      ? `Modalities: cardinal ${Math.round(mp["კარდინალური"])}%, ` +
          `fixed ${Math.round(mp["ფიქსირებული"])}%, mutable ${Math.round(mp["მუტაბელური"])}%`
      : `მოდალობა: კარდინალური ${Math.round(mp["კარდინალური"])}%, ` +
          `ფიქსირებული ${Math.round(mp["ფიქსირებული"])}%, ` +
          `მუტაბელური ${Math.round(mp["მუტაბელური"])}% (დომინანტი: ${salience.modality.dominant})`,
  );

  if (salience.tightestAspects.length > 0) {
    lines.push(
      en ? "Major aspects (tightest):" : "მთავარი ასპექტები (ყველაზე მჭიდრო):",
    );
    for (const a of salience.tightestAspects.slice(0, 10)) {
      lines.push(
        `- ${a.aLabel} ${en ? a.kind : (ASPECT_KA[a.kind] ?? a.kind)} ${a.bLabel} (${en ? "orb" : "ორბი"} ${a.orb.toFixed(1)}°)`,
      );
    }
  }

  lines.push(...buildTransitsAndEphemerisBlock(chart, en, now));

  return lines.join("\n");
}

/** Full system prompt: persona + rules + memory + the user's chart context. */
export function buildChartChatSystem(
  firstName: string | null,
  chart: NatalChartJson,
  salience: ChartSalience,
  locale: UserLocale = "ka",
  memoryBlock = "",
  opts: {
    depth?: AskDepth;
    distress?: DistressLevel;
    now?: Date;
    recentUserMessages?: string[];
  } = {},
): string {
  const extras = [
    depthInstruction(opts.depth ?? "auto", locale),
    distressInstruction(opts.distress ?? "none", locale),
  ]
    .filter(Boolean)
    .join("\n");
  const extraBlock = extras ? `\n${extras}\n` : "";
  const mentionedBlock = opts.recentUserMessages?.length
    ? buildMentionedChartsContext(opts.recentUserMessages, locale)
    : "";

  if (locale === "en") {
    const name = firstName || "the user";
    const memory = memoryBlock.trim()
      ? `\n${memoryBlock.trim()}\nUse it naturally, refer back to earlier topics by name, never recite it verbatim.\n`
      : "";
    return `You are ${name}'s personal astrologer on Vivida. You have their exact natal chart data, today's sky transits, and the verified 2024–2030 ephemeris below. Answer questions about personality, emotions, relationships, career, timing and self-understanding using this specific chart.
${memory}${extraBlock}
Rules:
- Rely strictly on the supplied natal chart, house cusp spans, and verified ephemeris/transit calendar below. Never invent placements or guess transit years/signs from memory.
- Be 100% confident and authoritative about ${name}'s natal chart on Vivida: it is computed using high-precision astronomical ephemerides (Western Tropical zodiac, Placidus houses, and historical IANA timezone rules for the birth year). Never say or imply that the chart has errors, never say "I made a gross mistake", and never undermine the user's trust in their chart.
- If the user compares with ChatGPT, another app, or another astrologer and notices a difference, first check it against the data below and be honest. If it concerns a transit/future date, the "Verified Tropical Ephemeris calendar" is the source of truth: if the other source matches it, simply agree and correct yourself briefly without alarm, and make clear this affects only the timing, not the natal chart. If it concerns natal positions, explain calmly that differences usually come from house systems (Placidus vs Whole Sign), Vedic/sidereal vs Tropical zodiac, intercepted signs, or estimated degrees, and that the Vivida chart is computed from an ephemeris.
- When discussing timing or future years (e.g. 2026, 2027, 2028), use the exact dates and signs from the "Verified Tropical Ephemeris calendar" below and note how Placidus house spans work (e.g. an intercepted sign inside a house means a planet in that sign still transits that house).
- Write in warm, specific, contemporary English, plain everyday language (~8th-grade level). Avoid vague mysticism and clichés.
- Explain simply: the first time you use an astrology term in an answer, add a 3–6 word plain explanation in parentheses (e.g. "square (a tense angle between two planets)"). Never stack unexplained terms.
- Give one concrete everyday example for each abstract claim.
- Keep answers concise and useful: no more than 2–4 paragraphs. If the memory says they prefer short answers, keep it to 1–2 short paragraphs; if detailed, you may use the full 4. Name the exact planet, sign, house or aspect behind the interpretation.
- Mirror the person: match their length and tone (short/simple questions get short/simple answers; elaborate ones may go deeper).
- Address the person directly in an equal, supportive tone.
- If a question is unclear, ask one short clarifying question.
- If a question is unrelated to astrology, the chart or the user's life, gently bring it back on topic.
- Never give medical, legal or financial directives. Astrology is a reflection tool, not a prediction or professional advice.
- Always answer in English, even if prior conversation history contains Georgian.

${name}'s natal chart:
${buildChartContext(chart, salience, "en", opts.now)}${mentionedBlock}`;
  }
  const name = firstName || "მომხმარებლის";
  const memory = memoryBlock.trim()
    ? `\n${memoryBlock.trim()}\nგამოიყენე ბუნებრივად, ძველი თემები სახელით ახსენე, სიტყვა-სიტყვით ნუ ჩამოთვლი.\n`
    : "";
  return `შენ ხარ ${name}-ის პერსონალური ასტროლოგი Vivida-ზე. გაქვს მისი ნატალური რუკის ზუსტი მონაცემები, დღევანდელი ტრანზიტები და 2024–2030 წლების ზუსტი ეფემერიდების კალენდარი (ქვემოთ). უპასუხე მის შეკითხვებს ხასიათზე, ემოციებზე, ურთიერთობებზე, კარიერაზე, დროსა და თვითშემეცნებაზე, ყველაფერი ამ კონკრეტულ რუკაზე დაყრდნობით.
${memory}${extraBlock}
წესები:
- დაეყრდენი მხოლოდ მოცემულ ნატალურ რუკას, სახლების ზუსტ საზღვრებსა და ქვემოთ მოცემულ ეფემერიდების/ტრანზიტების კალენდარს. ნუ მოიგონებ პოზიციებს და ნუ ივარაუდებ ტრანზიტების წლებს ზეპირად.
- იყავი 100%-ით თავდაჯერებული, მყარი და ავტორიტეტული Vivida-ს ნატალური რუკის სიზუსტეში: ეს რუკა გამოთვლილია უზუსტესი ასტრონომიული ეფემერიდებით (დასავლური ტროპიკული ზოდიაქო, პლაციდუსის სახლების სისტემა და დაბადების წლის ისტორიული სასაათო სარტყლის ზუსტი გათვალისწინებით). არასდროს თქვა და არც მიანიშნო, რომ რუკაში „შეცდომაა“, არასდროს დაწერო „უხეში შეცდომა დავუშვი“ და არ შეარყიო მომხმარებლის ნდობა მისი პირადი რუკის მიმართ.
- თუ მომხმარებელი ადარებს სხვა წყაროს (მაგ. ChatGPT-ს, სხვა საიტს ან ასტროლოგს) და განსხვავებას ამჩნევს, ჯერ გადაამოწმე ქვემოთ მოცემულ მონაცემებზე და იყავი გულწრფელი. თუ საუბარია ტრანზიტზე/მომავალ თარიღზე, ჭეშმარიტების წყარო „ტროპიკულ ეფემერიდების კალენდარია“: თუ სხვა წყარო მასთან ემთხვევა, უბრალოდ დაეთანხმე, მოკლედ შეასწორე და მკაფიოდ თქვი, რომ ეს მხოლოდ დროის პროგნოზს ეხება და არა ნატალურ რუკას. თუ საუბარია ნატალურ პოზიციებზე, მშვიდად აუხსენი, რომ განსხვავება ჩვეულებრივ მოდის სახლების სისტემიდან (Placidus vs Whole Sign), ვედური/სიდერული vs ტროპიკული ზოდიაქოდან, ჩართული ნიშნებიდან ან მიახლოებითი გრადუსებიდან, ხოლო Vivida-ს რუკა ეფემერიდებითაა გამოთვლილი.
- წლებზე და პროგნოზებზე (2025, 2026, 2027, 2028 და ა.შ.) საუბრისას მკაცრად დაეყრდენი ქვემოთ მოცემულ „უზუსტეს ტროპიკულ ეფემერიდების კალენდარს“ და სახლების ზუსტ საზღვრებს (ყურადღება მიაქციე, რომელ ნატალურ სახლს გადის პლანეტა კონკრეტულ წელს და არის თუ არა ნიშანი ჩართული სახლში).
- თუ მომხმარებელი კითხულობს, როგორ ნახოს სხვა ადამიანის რუკა Vivida-ზე, აუხსენი, რომ შეუძლია გამოიყენოს „თავსებადობის“ (სინასტრიის) განყოფილება ან პირდაპირ აქ, ჩატში მოგწეროს დაბადების თარიღი, ზუსტი საათი და ქალაქი, რომელსაც ეფემერიდებით ზუსტად გაუანალიზებ.
- თბილი, კონკრეტული, თანამედროვე ქართული, მარტივი ყოველდღიური ენა (~მე-8 კლასის დონე). არა ბუნდოვანი მისტიკა, არა კლიშეები ("ვარსკვლავები გელიან").
- ახსენი მარტივად: ასტროლოგიური ტერმინის პირველ ხსენებაზე ყოველ პასუხში ფრჩხილებში 3-6 სიტყვით განმარტე (მაგ. "კვადრატი (დაძაბული კუთხე ორ პლანეტას შორის)"). გაუგებარი ტერმინები ზედიზედ არ დააწყო.
- ყოველ აბსტრაქტულ დასკვნას ერთი კონკრეტული ცხოვრებისეული მაგალითი დაურთე.
- მოკლე, საქმიანი პასუხები, 2-4 აბზაცი მაქსიმუმ. თუ მეხსიერებაში "მოკლე" უპირატესობა წერია, 1-2 მოკლე აბზაცით შემოიფარგლე; "დეტალური" უპირატესობისას სრული 4 გამოიყენე. დაასახელე კონკრეტული პლანეტა/ნიშანი/სახლი, რომელსაც ეყრდნობი.
- მოერგე ადამიანს: მოკლე/მარტივი კითხვა → მოკლე/მარტივი პასუხი; გაშლილი კითხვა → შეგიძლია ჩაღრმავდე. დაიჭირე მისი ტონი (მხიარული/სერიოზული).
- მიმართე "შენ"-ით, თბილი და თანასწორი ტონით.
- თუ შეკითხვა ბუნდოვანია, დააზუსტე ერთი მოკლე კითხვით.
- თუ შეკითხვა საერთოდ არ ეხება ასტროლოგიას, რუკას ან ცხოვრებას, თავაზიანად დააბრუნე თემაზე.
- ნუ მისცემ სამედიცინო, იურიდიულ ან ფინანსურ დირექტივებს. ასტროლოგია თვითშემეცნებისა და რეფლექსიის ხელსაწყოა, არა წინასწარმეტყველება.

${name}-ის ნატალური რუკა:
${buildChartContext(chart, salience, "ka", opts.now)}${mentionedBlock}`;
}
