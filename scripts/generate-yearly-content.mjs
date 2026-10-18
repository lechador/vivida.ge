/**
 * Generate Georgian SEO copy for the yearly horoscope pages
 * (/zodiac/[sign]/[year]) via OpenRouter (Gemini 3.5 Flash Lite).
 *
 * Idempotent + resumable: skips entries already present in
 * lib/seo/zodiac-content.json under `yearly[year][slug]` unless --force
 * is passed.
 *
 * Usage:
 *   node scripts/generate-yearly-content.mjs                   # fill 2026 missing
 *   node scripts/generate-yearly-content.mjs --year 2027       # different year
 *   node scripts/generate-yearly-content.mjs --force           # regenerate all
 *   node scripts/generate-yearly-content.mjs aries leo         # specific signs only
 */

import { config } from "dotenv";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

config({ path: ".env.local" });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local, aborting.");
  process.exit(1);
}

const OUT = resolve("lib/seo/zodiac-content.json");
mkdirSync(dirname(OUT), { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");
function arg(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}
const YEAR = Number(arg("--year") ?? 2026);
const explicit = args.filter(
  (a, i) => !a.startsWith("--") && args[i - 1] !== "--year",
);

const SIGN_INPUTS = [
  { slug: "aries", labelKa: "ვერძი", element: "ცეცხლი", ruler: "მარსი" },
  { slug: "taurus", labelKa: "კურო", element: "მიწა", ruler: "ვენერა" },
  { slug: "gemini", labelKa: "ტყუპები", element: "ჰაერი", ruler: "მერკური" },
  { slug: "cancer", labelKa: "კირჩხიბი", element: "წყალი", ruler: "მთვარე" },
  { slug: "leo", labelKa: "ლომი", element: "ცეცხლი", ruler: "მზე" },
  { slug: "virgo", labelKa: "ქალწული", element: "მიწა", ruler: "მერკური" },
  { slug: "libra", labelKa: "სასწორი", element: "ჰაერი", ruler: "ვენერა" },
  { slug: "scorpio", labelKa: "მორიელი", element: "წყალი", ruler: "პლუტონი" },
  {
    slug: "sagittarius",
    labelKa: "მშვილდოსანი",
    element: "ცეცხლი",
    ruler: "იუპიტერი",
  },
  { slug: "capricorn", labelKa: "თხის რქა", element: "მიწა", ruler: "სატურნი" },
  { slug: "aquarius", labelKa: "მერწყული", element: "ჰაერი", ruler: "ურანი" },
  { slug: "pisces", labelKa: "თევზები", element: "წყალი", ruler: "ნეპტუნი" },
];

const SYSTEM_PROMPT = `შენ ხარ თბილი, გამოცდილი ქართველი ასტროლოგი/რედაქტორი. წერ ქართულად, თანამედროვე ახალგაზრდა აუდიტორიისთვის. ენა, სუფთა, პოეტური, მაგრამ მკაფიო და გრამატიკულად სწორი. SEO ფოკუსით, წლიური ჰოროსკოპის გვერდი.

წესები:
- პასუხი მხოლოდ ვალიდური JSON ობიექტი, ზუსტად ამ სქემით:
  {
    "pageTitle": string,           // <title> ტეგი, ~50-60 სიმბოლო, აუცილებლად ახსენო ნიშანი + წელი + "ჰოროსკოპი"
    "metaDescription": string,     // ~140-155 სიმბოლო, აქცევდეს დაკლიკვისკენ
    "tagline": string,             // 6-12 სიტყვა, მთლიანი წლის მოკლე განცდა
    "overview": string,            // 2-3 აბზაცი (\\n\\n-ით გაყოფილი), წლის ზოგადი მიმოხილვა
    "love": { "title": string, "body": string },     // body 1-2 აბზაცი
    "career": { "title": string, "body": string },
    "money": { "title": string, "body": string },
    "health": { "title": string, "body": string },
    "growth": { "title": string, "body": string },   // პიროვნული/სულიერი ზრდა
    "bestMonths": string[],        // 2-4 ქართული თვის სახელი (მაგ. "მარტი", "ივნისი")
    "hardMonths": string[],        // 1-3 ქართული თვის სახელი
    "keyDates": [{"date": string, "note": string}], // 3-5 მნიშვნელოვანი ასტროლოგიური მოვლენა (მაგ. "12 აპრილი" / "ივლისის შუა"), თითოეული 1-2 წინადადება
    "advice": string,              // 1 აბზაცი, წლის რჩევა, თბილი, კონკრეტული
    "faq": [{"q": string, "a": string}]   // ზუსტად 4-5 FAQ
  }
- არ გამოიყენო ძველი ცრურწმენები ან წინასწარმეტყველებები. ფოკუსი, ემოციური ტონი, რეალური თემები (კარიერა, სიყვარული, თვით-განვითარება).
- bestMonths/hardMonths, ქართული თვის სახელები (იანვარი, თებერვალი, მარტი, აპრილი, მაისი, ივნისი, ივლისი, აგვისტო, სექტემბერი, ოქტომბერი, ნოემბერი, დეკემბერი).
- keyDates ფორმატი: ან "12 აპრილი", ან "მაისის დასაწყისი", ან "ოქტომბრის ბოლო". კონკრეტულობა > ბუნდოვნობა.
- არ გამოიყენო ემოჯი ან მარკდაუნი body-ში.
- გრამატიკა, დახვეწილი, ბუნებრივი თანამედროვე ქართული.
- არ ახსენო ვებსაიტი, ბრენდი, "ვივიდა", "Vivida", "ჩვენ".
- არ დაამატო JSON-ის გარე ტექსტი (no preamble, no code fences).`;

function userPrompt(sign, year) {
  return `დაწერე ქართულად სრული წლიური ჰოროსკოპი ${year} წლისთვის ${sign.labelKa}-ისთვის (slug: ${sign.slug}, ელემენტი: ${sign.element}, მმართველი პლანეტა: ${sign.ruler}).

ცილოფი:
- ფოკუსი ახალგაზრდა (20-35 წლის) ქართულენოვან აუდიტორიაზე.
- pageTitle ფორმატი: "${sign.labelKa} ${year}, წლიური ჰოროსკოპი | Vivida" ან მსგავსი (50-60 სიმბოლო).
- metaDescription მოიცავდეს ნიშნის სახელს, წელს, და კონკრეტულ ემოციურ კაუჭს.
- overview-ში გადმოეცი როგორი იქნება მთლიანად ${year} ${sign.labelKa}-ისთვის, სად იქნება ფოკუსი, რა გამოწვევები, რა შესაძლებლობები.
- სიყვარული, კარიერა, ფული, ჯანმრთელობა, ზრდა, თითოეულ სექციაში 1-2 აბზაცი, კონკრეტული რჩევებით.
- keyDates, 3-5 მოვლენა წელიწადში, კონკრეტული თარიღით ან თვის ნაწილით.
- faq, 4-5 ხშირი კითხვა მაგ. "რა იქნება ${sign.labelKa}-ის ${year}-ის მთავარი თემა?", "${sign.labelKa}-ის სიყვარულის ცხოვრება ${year}-ში?", "როდის მოხდება მნიშვნელოვანი ცვლილება?", "რა უნდა აიცილოს ${sign.labelKa}-მა ${year}-ში?".

დააბრუნე მხოლოდ JSON ობიექტი.`;
}

async function callOpenRouter(systemPrompt, userPrompt) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      "HTTP-Referer": "https://www.vivida.ge",
      "X-Title": "Vivida SEO content generation",
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 500)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from model");
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error(
      `Model returned invalid JSON: ${err.message}\n${content.slice(0, 400)}`,
    );
  }
  return parsed;
}

function loadExisting() {
  if (!existsSync(OUT)) return {};
  try {
    return JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    return {};
  }
}

function saveData(data) {
  writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function main() {
  const data = loadExisting();
  data.yearly ??= {};
  data.yearly[String(YEAR)] ??= {};
  const yearMap = data.yearly[String(YEAR)];

  const targets =
    explicit.length > 0
      ? SIGN_INPUTS.filter((s) => explicit.includes(s.slug))
      : SIGN_INPUTS;

  console.log(
    `→ generating yearly content for ${YEAR}, ${targets.length} signs (force=${force})`,
  );

  for (const sign of targets) {
    if (yearMap[sign.slug] && !force) {
      console.log(`  · ${sign.slug} already present, skipping`);
      continue;
    }
    console.log(`  · ${sign.slug} ${sign.labelKa} ${YEAR} …`);
    let attempt = 0;
    while (attempt < 3) {
      try {
        const out = await callOpenRouter(SYSTEM_PROMPT, userPrompt(sign, YEAR));
        yearMap[sign.slug] = {
          slug: sign.slug,
          year: YEAR,
          labelKa: sign.labelKa,
          ...out,
        };
        saveData(data);
        console.log(`    ✓ saved`);
        break;
      } catch (err) {
        attempt += 1;
        console.warn(`    × attempt ${attempt} failed: ${err.message}`);
        if (attempt >= 3) {
          console.error(`    !! giving up on ${sign.slug}`);
        } else {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
        }
      }
    }
  }

  console.log(`done, wrote to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
