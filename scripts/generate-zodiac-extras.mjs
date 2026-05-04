/**
 * Generate Georgian SEO copy for the additional zodiac layers via OpenRouter
 * (Gemini 2.5 Flash). Targets: elementsHub, 4 element detail pages,
 * compatibility hub, 78 pair pages (12 signs × 12 / 2 + same-sign).
 *
 * Idempotent + resumable: skips items already present in lib/seo/zodiac-
 * content.json unless --force is passed.
 *
 * Usage:
 *   node scripts/generate-zodiac-extras.mjs                # fill missing
 *   node scripts/generate-zodiac-extras.mjs --force        # regenerate all
 *   node scripts/generate-zodiac-extras.mjs elementsHub
 *   node scripts/generate-zodiac-extras.mjs --pair aries-leo
 *   node scripts/generate-zodiac-extras.mjs --element fire
 */

import { config } from "dotenv";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

config({ path: ".env.local" });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const OUT = resolve("lib/seo/zodiac-content.json");
mkdirSync(dirname(OUT), { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyPair = arg("--pair");
const onlyElement = arg("--element");
const explicit = args.filter((a) => !a.startsWith("--"));

function arg(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

const SIGN_META = {
  aries: { labelKa: "ვერძი", element: "fire", elementKa: "ცეცხლი", symbol: "♈" },
  taurus: { labelKa: "კურო", element: "earth", elementKa: "მიწა", symbol: "♉" },
  gemini: { labelKa: "ტყუპები", element: "air", elementKa: "ჰაერი", symbol: "♊" },
  cancer: { labelKa: "კირჩხიბი", element: "water", elementKa: "წყალი", symbol: "♋" },
  leo: { labelKa: "ლომი", element: "fire", elementKa: "ცეცხლი", symbol: "♌" },
  virgo: { labelKa: "ქალწული", element: "earth", elementKa: "მიწა", symbol: "♍" },
  libra: { labelKa: "სასწორი", element: "air", elementKa: "ჰაერი", symbol: "♎" },
  scorpio: { labelKa: "მორიელი", element: "water", elementKa: "წყალი", symbol: "♏" },
  sagittarius: { labelKa: "მშვილდოსანი", element: "fire", elementKa: "ცეცხლი", symbol: "♐" },
  capricorn: { labelKa: "თხის რქა", element: "earth", elementKa: "მიწა", symbol: "♑" },
  aquarius: { labelKa: "მერწყული", element: "air", elementKa: "ჰაერი", symbol: "♒" },
  pisces: { labelKa: "თევზები", element: "water", elementKa: "წყალი", symbol: "♓" },
};

const ALL_SLUGS = Object.keys(SIGN_META);

const ELEMENTS = [
  { slug: "fire", labelKa: "ცეცხლი", signs: ["aries", "leo", "sagittarius"] },
  { slug: "earth", labelKa: "მიწა", signs: ["taurus", "virgo", "capricorn"] },
  { slug: "air", labelKa: "ჰაერი", signs: ["gemini", "libra", "aquarius"] },
  { slug: "water", labelKa: "წყალი", signs: ["cancer", "scorpio", "pisces"] },
];

function allPairs() {
  const out = [];
  for (let i = 0; i < ALL_SLUGS.length; i++) {
    for (let j = i; j < ALL_SLUGS.length; j++) {
      out.push([ALL_SLUGS[i], ALL_SLUGS[j]]);
    }
  }
  return out;
}

// ─── Prompts ────────────────────────────────────────────────────────────

const ELEMENTS_HUB_PROMPT = `შენ ხარ თბილი, გამოცდილი ქართველი ასტროლოგი/რედაქტორი. წერ ქართულად, ცოცხალი, თანამედროვე ენით. SEO ფოკუსით.

დააბრუნე მხოლოდ ვალიდური JSON ამ სქემით:
{
  "pageTitle": string,           // <title>, ~50-60 სიმბოლო, "ცის ნიშნების ელემენტები" ან მსგავსი
  "metaDescription": string,     // ~140-155 სიმბოლო
  "h1": string,
  "tagline": string,             // 1 წინადადება
  "intro": string,               // 100-130 სიტყვა — რა არიან ელემენტები ასტროლოგიაში
  "fireBlurb": string,           // 60-80 სიტყვა — ცეცხლის ნიშნების მოკლე აღწერა (ვერძი, ლომი, მშვილდოსანი)
  "earthBlurb": string,          // 60-80 სიტყვა — მიწის ნიშნები (კურო, ქალწული, თხის რქა)
  "airBlurb": string,            // 60-80 სიტყვა — ჰაერის ნიშნები (ტყუპები, სასწორი, მერწყული)
  "waterBlurb": string,          // 60-80 სიტყვა — წყლის ნიშნები (კირჩხიბი, მორიელი, თევზები)
  "faq": [                       // ზუსტად 5 SEO კითხვა
    { "q": string, "a": string }
  ]
}

წესები: "შენ"-ის ფორმა, კონკრეტული მაგალითები, აცილე კლიშეები, მხოლოდ JSON.`;

const ELEMENT_DETAIL_PROMPT = `ქართველი ასტროლოგი/რედაქტორი ხარ. დაწერე SEO გვერდი ერთი ელემენტის შესახებ.

დააბრუნე მხოლოდ ვალიდური JSON:
{
  "pageTitle": string,           // <title>
  "metaDescription": string,     // ~140-155 სიმბოლო
  "tagline": string,             // 1 წინადადება
  "intro": string,               // 80-100 სიტყვა — ელემენტის არსი, რას წარმოადგენს
  "personality": string,         // 2 აბზაცი (\\n\\n) — ელემენტის ნიშნების ხასიათი
  "strengths": string[],         // ზუსტად 6 ბულეტი
  "weaknesses": string[],        // ზუსტად 4 ბულეტი
  "love": string,                // 2 აბზაცი (\\n\\n) — როგორ ეპყრობა ეს ელემენტი სიყვარულს
  "career": string,              // 2 აბზაცი (\\n\\n) — კარიერული მიდგომა
  "compatibility": string,       // 1 აბზაცი — რომელ ელემენტებთან აქვს ქიმია, რომელთან გამოწვევა
  "faq": [{ "q": string, "a": string }]    // 5 კითხვა
}

"შენ"-ის ფორმა, მხოლოდ JSON.`;

const COMPAT_HUB_PROMPT = `ქართველი ასტროლოგი/რედაქტორი. SEO გვერდი ცის ნიშნების თავსებადობაზე ზოგადად.

დააბრუნე მხოლოდ JSON:
{
  "pageTitle": string,
  "metaDescription": string,
  "h1": string,
  "tagline": string,
  "intro": string,                                          // 100-130 სიტყვა
  "howItWorks": { "title": string, "body": string },        // body 120-150 სიტყვა — როგორ ფასდება თავსებადობა
  "elementsRule": { "title": string, "body": string },      // body 100-130 სიტყვა — ელემენტური წესი (ცეცხლი↔ჰაერი, მიწა↔წყალი)
  "beyondSun": { "title": string, "body": string },         // body 100-130 სიტყვა — სინასტრიის მნიშვნელობა (CTA-ის წინ)
  "faq": [{ "q": string, "a": string }]                     // 5 კითხვა
}

"შენ"-ის ფორმა, მხოლოდ JSON.`;

const PAIR_PROMPT = `ქართველი ასტროლოგი/რედაქტორი. SEO გვერდი ორი ცის ნიშნის თავსებადობაზე.

დააბრუნე მხოლოდ JSON ამ სქემით:
{
  "pageTitle": string,                       // ~50-60 სიმბოლო, ორივე ნიშნის სახელით + "თავსებადობა"
  "metaDescription": string,                 // ~140-155 სიმბოლო
  "tagline": string,                         // 1 წინადადება
  "overallScore": "ძლიერი"|"ჰარმონიული"|"გამომწვევი",  // ერთ-ერთი
  "overall": string,                         // 2 აბზაცი (\\n\\n) — ზოგადი თავსებადობის სურათი
  "love": string,                            // 2 აბზაცი (\\n\\n) — სიყვარული
  "friendship": string,                      // 1 აბზაცი — მეგობრობა
  "communication": string,                   // 1 აბზაცი — კომუნიკაცია
  "strengths": string[],                     // ზუსტად 4 ბულეტი
  "challenges": string[],                    // ზუსტად 3 ბულეტი
  "verdict": string,                         // 1 აბზაცი — ბოლო სიტყვა
  "faq": [{ "q": string, "a": string }]      // 3 კითხვა
}

წესები:
- იყავი კონკრეტული, არა აბსტრაქტული.
- თუ ორივე ერთი ელემენტისაა — ხაზი გაუსვი ენერგიების გაძლიერებას + გამოწვევებს.
- თუ კომპლემენტარული ელემენტებია (ცეცხლი↔ჰაერი, მიწა↔წყალი) — ბუნებრივი ბალანსი.
- თუ "კვადრატული" ელემენტებია (ცეცხლი↔წყალი, ჰაერი↔მიწა) — დაძაბულობა, რომელიც ზრდას იწვევს.
- "შენ"-ის ფორმა.
- მხოლოდ JSON, ფენსების გარეშე.`;

// ─── HTTP ───────────────────────────────────────────────────────────────

async function callOpenRouter(systemPrompt, userPrompt, label, retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
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
      return JSON.parse(stripped);
    } catch (err) {
      lastErr = err;
      console.warn(`  ! ${label} attempt ${attempt + 1}: ${err.message}`);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

// ─── Generators ─────────────────────────────────────────────────────────

async function generateElementsHub() {
  return callOpenRouter(
    ELEMENTS_HUB_PROMPT,
    "დააწერე ცის ნიშნების ელემენტების SEO ჰაბი. JSON-ად დააბრუნე.",
    "elementsHub"
  );
}

async function generateElement(el) {
  const signsKa = el.signs.map((s) => SIGN_META[s].labelKa).join(", ");
  const userPrompt = `ელემენტი: ${el.labelKa} (${el.slug})
ამ ელემენტს ეკუთვნის: ${signsKa}.

დააწერე SEO გვერდი ამ ელემენტისთვის. JSON-ად დააბრუნე.`;
  return callOpenRouter(ELEMENT_DETAIL_PROMPT, userPrompt, `element:${el.slug}`);
}

async function generateCompatHub() {
  return callOpenRouter(
    COMPAT_HUB_PROMPT,
    "დააწერე SEO ჰაბი ცის ნიშნების თავსებადობაზე. JSON-ად დააბრუნე.",
    "compatibilityHub"
  );
}

async function generatePair(slugA, slugB) {
  const a = SIGN_META[slugA];
  const b = SIGN_META[slugB];
  const sameSign = slugA === slugB;
  const userPrompt = `ნიშანი 1: ${a.labelKa} (${a.elementKa})
ნიშანი 2: ${b.labelKa} (${b.elementKa})
${sameSign ? "ორივე ერთი და იგივე ნიშანია — დაწერე როგორც აისახება ერთნაირი ენერგიის გაორმაგება." : ""}

დააწერე SEO გვერდი ამ ნიშნების თავსებადობაზე. JSON-ად დააბრუნე.`;
  return callOpenRouter(PAIR_PROMPT, userPrompt, `pair:${slugA}-${slugB}`);
}

// ─── Runner ─────────────────────────────────────────────────────────────

const data = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, "utf8"))
  : { signs: {}, hub: null, byDate: null };
data.elements ??= {};
data.pairs ??= {};

function save() {
  writeFileSync(OUT, JSON.stringify(data, null, 2));
}

async function runWithConcurrency(items, concurrency, fn) {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.all(batch.map((it) => fn(it)));
  }
}

async function run() {
  // Specific overrides
  if (onlyPair) {
    const [a, b] = onlyPair.split("-");
    if (!SIGN_META[a] || !SIGN_META[b]) throw new Error(`bad pair: ${onlyPair}`);
    const slug = `${a}-${b}`;
    console.log(`→ pair ${slug}`);
    const t0 = Date.now();
    data.pairs[slug] = {
      slug,
      signA: a,
      signB: b,
      labelA: SIGN_META[a].labelKa,
      labelB: SIGN_META[b].labelKa,
      ...(await generatePair(a, b)),
    };
    save();
    console.log(`  ✓ ${slug} ${(Date.now() - t0) / 1000}s`);
    return;
  }
  if (onlyElement) {
    const el = ELEMENTS.find((e) => e.slug === onlyElement);
    if (!el) throw new Error(`bad element: ${onlyElement}`);
    console.log(`→ element ${el.slug}`);
    const t0 = Date.now();
    data.elements[el.slug] = {
      slug: el.slug,
      labelKa: el.labelKa,
      signs: el.signs,
      ...(await generateElement(el)),
    };
    save();
    console.log(`  ✓ ${el.slug} ${(Date.now() - t0) / 1000}s`);
    return;
  }

  const targets =
    explicit.length > 0
      ? explicit
      : ["elementsHub", "elements", "compatibilityHub", "pairs"];

  if (targets.includes("elementsHub")) {
    if (!force && data.elementsHub) {
      console.log("✓ skip elementsHub");
    } else {
      console.log("→ elementsHub…");
      const t0 = Date.now();
      data.elementsHub = await generateElementsHub();
      save();
      console.log(`  ✓ elementsHub ${(Date.now() - t0) / 1000}s`);
    }
  }

  if (targets.includes("elements")) {
    await runWithConcurrency(ELEMENTS, 2, async (el) => {
      if (!force && data.elements[el.slug]) {
        console.log(`✓ skip element ${el.slug}`);
        return;
      }
      console.log(`→ element ${el.slug}…`);
      const t0 = Date.now();
      const content = await generateElement(el);
      data.elements[el.slug] = {
        slug: el.slug,
        labelKa: el.labelKa,
        signs: el.signs,
        ...content,
      };
      save();
      console.log(`  ✓ ${el.slug} ${(Date.now() - t0) / 1000}s`);
    });
  }

  if (targets.includes("compatibilityHub")) {
    if (!force && data.compatibilityHub) {
      console.log("✓ skip compatibilityHub");
    } else {
      console.log("→ compatibilityHub…");
      const t0 = Date.now();
      data.compatibilityHub = await generateCompatHub();
      save();
      console.log(`  ✓ compatibilityHub ${(Date.now() - t0) / 1000}s`);
    }
  }

  if (targets.includes("pairs")) {
    const pairs = allPairs();
    let done = 0;
    await runWithConcurrency(pairs, 5, async ([a, b]) => {
      const slug = `${a}-${b}`;
      if (!force && data.pairs[slug]) {
        console.log(`✓ skip pair ${slug} (${++done}/${pairs.length})`);
        return;
      }
      console.log(`→ pair ${slug}…`);
      const t0 = Date.now();
      const content = await generatePair(a, b);
      data.pairs[slug] = {
        slug,
        signA: a,
        signB: b,
        labelA: SIGN_META[a].labelKa,
        labelB: SIGN_META[b].labelKa,
        ...content,
      };
      save();
      done++;
      console.log(
        `  ✓ ${slug} ${(Date.now() - t0) / 1000}s (${done}/${pairs.length})`
      );
    });
  }

  console.log(`\nWrote ${OUT}`);
}

run().catch((err) => {
  console.error("✗ failed:", err);
  process.exit(1);
});
