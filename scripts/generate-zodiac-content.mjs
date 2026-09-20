/**
 * Generate Georgian SEO copy for the public zodiac pages via OpenRouter
 * (Gemini 3.5 Flash Lite). Idempotent + resumable: skips slugs already present
 * in lib/seo/zodiac-content.json unless --force is passed.
 *
 * Usage:
 *   node scripts/generate-zodiac-content.mjs           # fill in missing
 *   node scripts/generate-zodiac-content.mjs --force   # regenerate all
 *   node scripts/generate-zodiac-content.mjs aries     # specific slug(s)
 *
 * Output is written to lib/seo/zodiac-content.json — commit it after a
 * good run so build-time pages don't depend on the API key being set.
 */

import { config } from "dotenv";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

config({ path: ".env.local" });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const OUT = resolve("lib/seo/zodiac-content.json");
mkdirSync(dirname(OUT), { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");
const explicit = args.filter((a) => !a.startsWith("--"));

const SIGN_INPUTS = [
  {
    slug: "aries",
    labelKa: "ვერძი",
    symbol: "♈",
    element: "ცეცხლი",
    modality: "კარდინალური",
    ruler: "მარსი",
    dates: "21 მარტი – 19 აპრილი",
  },
  {
    slug: "taurus",
    labelKa: "კურო",
    symbol: "♉",
    element: "მიწა",
    modality: "ფიქსირებული",
    ruler: "ვენერა",
    dates: "20 აპრილი – 20 მაისი",
  },
  {
    slug: "gemini",
    labelKa: "ტყუპები",
    symbol: "♊",
    element: "ჰაერი",
    modality: "მუტაბელური",
    ruler: "მერკური",
    dates: "21 მაისი – 20 ივნისი",
  },
  {
    slug: "cancer",
    labelKa: "კირჩხიბი",
    symbol: "♋",
    element: "წყალი",
    modality: "კარდინალური",
    ruler: "მთვარე",
    dates: "21 ივნისი – 22 ივლისი",
  },
  {
    slug: "leo",
    labelKa: "ლომი",
    symbol: "♌",
    element: "ცეცხლი",
    modality: "ფიქსირებული",
    ruler: "მზე",
    dates: "23 ივლისი – 22 აგვისტო",
  },
  {
    slug: "virgo",
    labelKa: "ქალწული",
    symbol: "♍",
    element: "მიწა",
    modality: "მუტაბელური",
    ruler: "მერკური",
    dates: "23 აგვისტო – 22 სექტემბერი",
  },
  {
    slug: "libra",
    labelKa: "სასწორი",
    symbol: "♎",
    element: "ჰაერი",
    modality: "კარდინალური",
    ruler: "ვენერა",
    dates: "23 სექტემბერი – 22 ოქტომბერი",
  },
  {
    slug: "scorpio",
    labelKa: "მორიელი",
    symbol: "♏",
    element: "წყალი",
    modality: "ფიქსირებული",
    ruler: "პლუტონი",
    dates: "23 ოქტომბერი – 21 ნოემბერი",
  },
  {
    slug: "sagittarius",
    labelKa: "მშვილდოსანი",
    symbol: "♐",
    element: "ცეცხლი",
    modality: "მუტაბელური",
    ruler: "იუპიტერი",
    dates: "22 ნოემბერი – 21 დეკემბერი",
  },
  {
    slug: "capricorn",
    labelKa: "თხის რქა",
    symbol: "♑",
    element: "მიწა",
    modality: "კარდინალური",
    ruler: "სატურნი",
    dates: "22 დეკემბერი – 19 იანვარი",
  },
  {
    slug: "aquarius",
    labelKa: "მერწყული",
    symbol: "♒",
    element: "ჰაერი",
    modality: "ფიქსირებული",
    ruler: "ურანი",
    dates: "20 იანვარი – 18 თებერვალი",
  },
  {
    slug: "pisces",
    labelKa: "თევზები",
    symbol: "♓",
    element: "წყალი",
    modality: "მუტაბელური",
    ruler: "ნეპტუნი",
    dates: "19 თებერვალი – 20 მარტი",
  },
];

const SIGN_SYSTEM_PROMPT = `შენ ხარ თბილი, გამოცდილი ქართველი ასტროლოგი/რედაქტორი. წერ ქართულად, თანამედროვე ახალგაზრდა აუდიტორიისთვის. ენა — სუფთა, პოეტური, მაგრამ მკაფიო და გრამატიკულად სწორი. SEO ფოკუსით.

წესები:
- პასუხი მხოლოდ ვალიდური JSON ობიექტი, ზუსტად ამ სქემით:
  {
    "pageTitle": string,         // <title> ტეგი — ~50-60 სიმბოლო, მოიცავდეს ნიშნის სახელს ქართულად + "თარიღი" ან "თავსებადობა"
    "metaDescription": string,   // ~140-155 სიმბოლო, აქცევდეს დაკლიკვისკენ
    "tagline": string,           // 6-12 სიტყვა, ემოციური მოკლე ფრაზა
    "intro": string,             // 2-3 წინადადება, ზოგადი დახასიათება
    "personality": string,       // 2 აბზაცი, ცარიელი ხაზით გაყოფილი (\\n\\n) — ნიშნის ხასიათი დეტალურად
    "strengths": string[],       // ზუსტად 6 ბულეტი, თითო — ერთი მოკლე ფრაზა (3-7 სიტყვა)
    "weaknesses": string[],      // ზუსტად 4 ბულეტი, თითო — ერთი მოკლე ფრაზა
    "love": string,              // 2 აბზაცი (\\n\\n) — სიყვარული, ემოციური სტილი
    "career": string,            // 2 აბზაცი (\\n\\n) — კარიერა, ფული, ბიზნესის სტილი
    "compatibility": [           // ზუსტად 4 ჩანაწერი, ყველაზე ძლიერი თავსებადობით დაწყებული
      { "signKa": string, "level": "ძლიერი"|"ჰარმონიული"|"გამომწვევი", "note": string }
    ],
    "famous": string[],          // 4-5 ცნობილი ადამიანი (ნებისმიერი ეროვნება) — მხოლოდ ნამდვილი, შემოწმებული პიროვნებები; ფორმატი: "სახელი გვარი — პროფესია"
    "faq": [                     // 5 კითხვა-პასუხი, SEO-ფოკუსით (პოპულარული Google კითხვები)
      { "q": string, "a": string }
    ]
  }
- პასუხი მხოლოდ JSON. ფენსები (\`\`\`) აკრძალულია.
- "შენ"-ის ფორმა (არა "თქვენ").
- აცილე კლიშეები ("სამყარო შენთვისაა", "ვარსკვლავები გელაპარაკებიან").
- იყავი კონკრეტული, არა აბსტრაქტული. მოიყვანე ყოველდღიური მაგალითები.
- famous სიაში — ნამდვილი, აქტიური ან ისტორიული ცნობილი ადამიანები. თუ დარწმუნებული არ ხარ — ცარიელი მასივი დააბრუნე ([]).
- ქართული გრამატიკა, მართლწერა და კალკები აუცილებლად გადაამოწმე.`;

const HUB_SYSTEM_PROMPT = `შენ ხარ ქართველი ასტროლოგი/რედაქტორი, წერ თანამედროვე SEO-ფოკუსიანი მთავარ ცის ნიშნების გვერდისთვის. ენა — სუფთა, ცოცხალი, გრამატიკულად სწორი ქართული.

დააბრუნე მხოლოდ ვალიდური JSON ამ სქემით:
{
  "pageTitle": string,            // <title> — "ზოდიაქოს ნიშნები" ფრაზა + Vivida
  "metaDescription": string,      // ~140-155 სიმბოლო
  "h1": string,                   // მთავარი სათაური, 4-7 სიტყვა
  "tagline": string,              // 1 წინადადება, ჰერო-ქვეთაური
  "intro": string,                // 1 აბზაცი, 80-120 სიტყვა — რა არის ზოდიაქო, რატომ აინტერესებთ მას ხალხს
  "whatIsZodiac": { "title": string, "body": string },        // body 120-150 სიტყვა — ზოდიაქოს ისტორია+არსი
  "elements": { "title": string, "body": string },            // body 120-150 სიტყვა — ცეცხლი/მიწა/ჰაერი/წყალი მოკლე ახსნა
  "modalities": { "title": string, "body": string },          // body 80-120 სიტყვა — კარდინალური/ფიქსირებული/მუტაბელური
  "faq": [                                                    // ზუსტად 5 SEO-ფოკუსიანი კითხვა
    { "q": string, "a": string }
  ]
}

წესები:
- "შენ"-ის ფორმა.
- აცილე ეზოთერული ჟარგონი; ახსენი ყველა ტერმინი.
- პასუხი მხოლოდ JSON, ფენსების გარეშე.`;

const BY_DATE_SYSTEM_PROMPT = `ქართველი ასტროლოგი/რედაქტორი ხარ. გვერდი — "ცის ნიშნები თარიღების მიხედვით", მომხმარებელი წერს დაბადების თარიღს და ხედავს თავის მზის ნიშანს.

დააბრუნე მხოლოდ ვალიდური JSON ამ სქემით:
{
  "pageTitle": string,            // <title>, "ცის ნიშანი დაბადების თარიღით" ფრაზით
  "metaDescription": string,      // ~140-155 სიმბოლო
  "h1": string,                   // 4-7 სიტყვა
  "tagline": string,              // 1 წინადადება
  "intro": string,                // 80-120 სიტყვა — როგორ მუშაობს მზის ნიშანი
  "howItWorks": { "title": string, "body": string },         // body 100-150 სიტყვა — როგორ ეხება დაბადების თარიღს ნიშანი
  "cusp": { "title": string, "body": string },               // body 80-120 სიტყვა — "cusp" / ზღვარი დღეები: რა ხდება, თუ შენი თარიღი ორ ნიშანს შორისაა
  "beyondSun": { "title": string, "body": string },          // body 100-130 სიტყვა — რატომ არ კმარა მზის ნიშანი მარტო (ნატალური რუკის CTA-ის წინ)
  "faq": [                                                    // 5 SEO-ფოკუსიანი კითხვა
    { "q": string, "a": string }
  ]
}

წესები:
- "შენ"-ის ფორმა.
- პასუხი მხოლოდ JSON, ფენსების გარეშე.`;

async function callOpenRouter(systemPrompt, userPrompt, label) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": `Vivida zodiac SEO (${label})`,
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
      max_tokens: 8000,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response");
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch (err) {
    throw new Error(
      `Invalid JSON for ${label}: ${err.message}\n--- raw head ---\n${raw.slice(0, 600)}`,
    );
  }
}

async function generateSign(input) {
  const userPrompt = `ნიშანი: ${input.labelKa} (${input.slug})
სიმბოლო: ${input.symbol}
ელემენტი: ${input.element}
მოდალურობა: ${input.modality}
მმართველი პლანეტა: ${input.ruler}
თარიღები: ${input.dates}

დააწერე ქართულენოვანი SEO გვერდი ამ ნიშნისთვის. დააბრუნე JSON.`;
  return callOpenRouter(SIGN_SYSTEM_PROMPT, userPrompt, input.slug);
}

async function generateHub() {
  return callOpenRouter(
    HUB_SYSTEM_PROMPT,
    "დააწერე SEO ჰაბი 12 ცის ნიშნისთვის. JSON-ად დააბრუნე.",
    "hub",
  );
}

async function generateByDate() {
  return callOpenRouter(
    BY_DATE_SYSTEM_PROMPT,
    "დააწერე SEO გვერდი 'ცის ნიშანი დაბადების თარიღის მიხედვით'-სთვის. JSON-ად დააბრუნე.",
    "byDate",
  );
}

const data = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, "utf8"))
  : { signs: {}, hub: null, byDate: null };

async function withRetry(fn, label, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`  ! ${label} attempt ${i + 1} failed: ${err.message}`);
      if (i < retries) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function run() {
  const targets =
    explicit.length > 0
      ? explicit
      : ["hub", "byDate", ...SIGN_INPUTS.map((s) => s.slug)];

  // Generate signs concurrently in batches of 3 to be polite to rate limits
  const signTargets = targets.filter((t) =>
    SIGN_INPUTS.some((s) => s.slug === t),
  );
  const wantHub = targets.includes("hub");
  const wantByDate = targets.includes("byDate");

  const concurrency = 3;
  for (let i = 0; i < signTargets.length; i += concurrency) {
    const batch = signTargets.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (slug) => {
        if (!force && data.signs[slug]) {
          console.log(`✓ skip ${slug} (already present)`);
          return;
        }
        const input = SIGN_INPUTS.find((s) => s.slug === slug);
        console.log(`→ generating ${slug}…`);
        const t0 = Date.now();
        const content = await withRetry(() => generateSign(input), slug);
        data.signs[slug] = {
          slug,
          labelKa: input.labelKa,
          symbol: input.symbol,
          element: input.element,
          modality: input.modality,
          ruler: input.ruler,
          dates: input.dates,
          ...content,
        };
        writeFileSync(OUT, JSON.stringify(data, null, 2));
        console.log(`  ✓ ${slug} done in ${(Date.now() - t0) / 1000}s`);
      }),
    );
  }

  if (wantHub && (force || !data.hub)) {
    console.log("→ generating hub…");
    const t0 = Date.now();
    data.hub = await withRetry(generateHub, "hub");
    writeFileSync(OUT, JSON.stringify(data, null, 2));
    console.log(`  ✓ hub done in ${(Date.now() - t0) / 1000}s`);
  } else if (wantHub) {
    console.log("✓ skip hub (already present)");
  }

  if (wantByDate && (force || !data.byDate)) {
    console.log("→ generating byDate…");
    const t0 = Date.now();
    data.byDate = await withRetry(generateByDate, "byDate");
    writeFileSync(OUT, JSON.stringify(data, null, 2));
    console.log(`  ✓ byDate done in ${(Date.now() - t0) / 1000}s`);
  } else if (wantByDate) {
    console.log("✓ skip byDate (already present)");
  }

  console.log(`\nWrote ${OUT}`);
}

run().catch((err) => {
  console.error("✗ failed:", err);
  process.exit(1);
});
