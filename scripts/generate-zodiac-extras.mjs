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
const onlyMoon = arg("--moon");
const onlyRising = arg("--rising");
const explicit = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    args[i - 1] !== "--pair" &&
    args[i - 1] !== "--element" &&
    args[i - 1] !== "--moon" &&
    args[i - 1] !== "--rising"
);

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

const MOON_HUB_PROMPT = `ქართველი ასტროლოგი/რედაქტორი ხარ. დაწერე SEO ჰაბი მთვარის ნიშანზე.

დააბრუნე მხოლოდ ვალიდური JSON:
{
  "pageTitle": string,                                       // ~50-60 სიმბოლო, "მთვარის ნიშანი" შემავალი
  "metaDescription": string,                                 // ~140-155 სიმბოლო
  "h1": string,
  "tagline": string,                                         // 1 წინადადება
  "intro": string,                                           // 100-130 სიტყვა — რა არის მთვარის ნიშანი
  "whatItMeans": { "title": string, "body": string },        // body 110-140 სიტყვა — რას გვიჩვენებს მთვარის ნიშანი (ემოციური სამყარო, შინაგანი ბავშვი, ოჯახური ხატი)
  "vsSun": { "title": string, "body": string },              // body 100-130 სიტყვა — განსხვავება მზის ნიშანსა და მთვარის ნიშანს შორის
  "howToFind": { "title": string, "body": string },          // body 100-130 სიტყვა — როგორ გავიგო ჩემი მთვარის ნიშანი (Vivida-ს ნატალური რუკა — CTA-ზე საუბარი)
  "faq": [{ "q": string, "a": string }]                      // ზუსტად 5 კითხვა
}

"შენ"-ის ფორმა, კონკრეტული, ცოცხალი ენა. მხოლოდ JSON.`;

const MOON_DETAIL_PROMPT = `ქართველი ასტროლოგი/რედაქტორი. SEO გვერდი ერთი ნიშანში მდგომარე მთვარის შესახებ — ანუ "მთვარე [ნიშანი]-ში".

დააბრუნე მხოლოდ JSON:
{
  "pageTitle": string,                       // ~50-60 სიმბოლო, "მთვარე [ნიშანი]-ში" ან მსგავსი
  "metaDescription": string,                 // ~140-155 სიმბოლო
  "tagline": string,                         // 1 წინადადება
  "intro": string,                           // 90-120 სიტყვა — საერთო სურათი
  "emotionalCore": string,                   // 2 აბზაცი (\\n\\n) — ემოციური ბირთვი, შინაგანი სამყარო, რა აწყობებს ან აწუხებს
  "love": string,                            // 2 აბზაცი (\\n\\n) — როგორ უყვარს, რა სჭირდება სიყვარულში
  "shadow": string,                          // 1 აბზაცი — ჩრდილოვანი მხარე, ემოციური წყლული, თავდაცვის რეფლექსი
  "compatibility": string,                   // 1 აბზაცი — რომელი მთვარის ნიშნებთან მოდის ყველაზე კარგად
  "famous": string[],                        // 4-5 მსოფლიოში ცნობილი ადამიანი ამ მთვარის ნიშნით
  "faq": [{ "q": string, "a": string }]      // ზუსტად 3 კითხვა
}

წესები: "შენ"-ის ფორმა, კონკრეტული მაგალითები, ცოცხალი ენა, აცილე კლიშეები. მხოლოდ JSON.`;

const RISING_HUB_PROMPT = `ქართველი ასტროლოგი/რედაქტორი ხარ. დაწერე SEO ჰაბი ამომავალ ნიშანზე (ასცენდენტი).

დააბრუნე მხოლოდ ვალიდური JSON:
{
  "pageTitle": string,                                       // ~50-60 სიმბოლო, "ამომავალი ნიშანი" ან "ასცენდენტი" შემავალი
  "metaDescription": string,                                 // ~140-155 სიმბოლო
  "h1": string,
  "tagline": string,
  "intro": string,                                           // 100-130 სიტყვა
  "whatItMeans": { "title": string, "body": string },        // body 110-140 სიტყვა — რას ნიშნავს ამომავალი (გარეგანი ხატი, ნიღაბი, პირველი შთაბეჭდილება)
  "vsSun": { "title": string, "body": string },              // body 100-130 სიტყვა — როგორ აფერადებს ამომავალი მზის ნიშანს
  "howToFind": { "title": string, "body": string },          // body 100-130 სიტყვა — როგორ გავიგო ჩემი ამომავალი (დაბადების ზუსტი დრო და ადგილი — Vivida-ს ნატალური რუკის CTA)
  "faq": [{ "q": string, "a": string }]                      // ზუსტად 5 კითხვა
}

"შენ"-ის ფორმა, მხოლოდ JSON.`;

const RISING_DETAIL_PROMPT = `ქართველი ასტროლოგი/რედაქტორი. SEO გვერდი ერთი ნიშანში მდგომარე ამომავალის შესახებ — ანუ "[ნიშანი] ამომავალი" / ასცენდენტი.

დააბრუნე მხოლოდ JSON:
{
  "pageTitle": string,                       // ~50-60 სიმბოლო, "[ნიშანი] ამომავალი" ან მსგავსი
  "metaDescription": string,                 // ~140-155 სიმბოლო
  "tagline": string,                         // 1 წინადადება
  "intro": string,                           // 90-120 სიტყვა — როგორ ამძიმებს/აღაფრთოვანებს ეს ამომავალი მთლიან პიროვნებას
  "firstImpression": string,                 // 2 აბზაცი (\\n\\n) — პირველი შთაბეჭდილება, ენერგიის რომელი ფერი დარბის ოთახში
  "appearance": string,                      // 1 აბზაცი — ფიზიკური ვაიბი, სტილი, სხეულის სიგნალები (აცილე ვიზუალური სტერეოტიპი)
  "approach": string,                        // 2 აბზაცი (\\n\\n) — როგორ უდგება ცხოვრებას, რა არის მისი ბუნებრივი მოქმედება
  "bestPaired": string,                      // 1 აბზაცი — რა მზის/მთვარის ნიშნებთან აკეთებს ყველაზე საინტერესო კომბინაციას
  "famous": string[],                        // 4-5 ცნობილი ადამიანი ამ ამომავალი ნიშნით
  "faq": [{ "q": string, "a": string }]      // ზუსტად 3 კითხვა
}

წესები: "შენ"-ის ფორმა, კონკრეტული, ცოცხალი ენა. მხოლოდ JSON.`;

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

async function generateMoonHub() {
  return callOpenRouter(
    MOON_HUB_PROMPT,
    "დააწერე SEO ჰაბი მთვარის ნიშანზე ქართულად. JSON-ად დააბრუნე.",
    "moonHub"
  );
}

async function generateMoon(slug) {
  const m = SIGN_META[slug];
  const userPrompt = `ნიშანი: ${m.labelKa} (${m.elementKa})
დაწერე SEO გვერდი მთვარის ${m.labelKa}-ში მდგომარეობის შესახებ.
JSON-ად დააბრუნე.`;
  return callOpenRouter(MOON_DETAIL_PROMPT, userPrompt, `moon:${slug}`);
}

async function generateRisingHub() {
  return callOpenRouter(
    RISING_HUB_PROMPT,
    "დააწერე SEO ჰაბი ამომავალ ნიშანზე (ასცენდენტი) ქართულად. JSON-ად დააბრუნე.",
    "risingHub"
  );
}

async function generateRising(slug) {
  const m = SIGN_META[slug];
  const userPrompt = `ნიშანი: ${m.labelKa} (${m.elementKa})
დაწერე SEO გვერდი ${m.labelKa} ამომავალი (ასცენდენტი)-ის შესახებ.
JSON-ად დააბრუნე.`;
  return callOpenRouter(RISING_DETAIL_PROMPT, userPrompt, `rising:${slug}`);
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
data.moons ??= {};
data.risings ??= {};

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
  if (onlyMoon) {
    if (!SIGN_META[onlyMoon]) throw new Error(`bad sign: ${onlyMoon}`);
    console.log(`→ moon ${onlyMoon}`);
    const t0 = Date.now();
    data.moons[onlyMoon] = {
      slug: onlyMoon,
      labelKa: SIGN_META[onlyMoon].labelKa,
      symbol: SIGN_META[onlyMoon].symbol,
      ...(await generateMoon(onlyMoon)),
    };
    save();
    console.log(`  ✓ moon:${onlyMoon} ${(Date.now() - t0) / 1000}s`);
    return;
  }
  if (onlyRising) {
    if (!SIGN_META[onlyRising]) throw new Error(`bad sign: ${onlyRising}`);
    console.log(`→ rising ${onlyRising}`);
    const t0 = Date.now();
    data.risings[onlyRising] = {
      slug: onlyRising,
      labelKa: SIGN_META[onlyRising].labelKa,
      symbol: SIGN_META[onlyRising].symbol,
      ...(await generateRising(onlyRising)),
    };
    save();
    console.log(`  ✓ rising:${onlyRising} ${(Date.now() - t0) / 1000}s`);
    return;
  }

  const targets =
    explicit.length > 0
      ? explicit
      : [
          "elementsHub",
          "elements",
          "compatibilityHub",
          "pairs",
          "moonHub",
          "moons",
          "risingHub",
          "risings",
        ];

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

  if (targets.includes("moonHub")) {
    if (!force && data.moonHub) {
      console.log("✓ skip moonHub");
    } else {
      console.log("→ moonHub…");
      const t0 = Date.now();
      data.moonHub = await generateMoonHub();
      save();
      console.log(`  ✓ moonHub ${(Date.now() - t0) / 1000}s`);
    }
  }

  if (targets.includes("moons")) {
    await runWithConcurrency(ALL_SLUGS, 3, async (slug) => {
      if (!force && data.moons[slug]) {
        console.log(`✓ skip moon ${slug}`);
        return;
      }
      console.log(`→ moon ${slug}…`);
      const t0 = Date.now();
      const content = await generateMoon(slug);
      data.moons[slug] = {
        slug,
        labelKa: SIGN_META[slug].labelKa,
        symbol: SIGN_META[slug].symbol,
        ...content,
      };
      save();
      console.log(`  ✓ moon:${slug} ${(Date.now() - t0) / 1000}s`);
    });
  }

  if (targets.includes("risingHub")) {
    if (!force && data.risingHub) {
      console.log("✓ skip risingHub");
    } else {
      console.log("→ risingHub…");
      const t0 = Date.now();
      data.risingHub = await generateRisingHub();
      save();
      console.log(`  ✓ risingHub ${(Date.now() - t0) / 1000}s`);
    }
  }

  if (targets.includes("risings")) {
    await runWithConcurrency(ALL_SLUGS, 3, async (slug) => {
      if (!force && data.risings[slug]) {
        console.log(`✓ skip rising ${slug}`);
        return;
      }
      console.log(`→ rising ${slug}…`);
      const t0 = Date.now();
      const content = await generateRising(slug);
      data.risings[slug] = {
        slug,
        labelKa: SIGN_META[slug].labelKa,
        symbol: SIGN_META[slug].symbol,
        ...content,
      };
      save();
      console.log(`  ✓ rising:${slug} ${(Date.now() - t0) / 1000}s`);
    });
  }

  console.log(`\nWrote ${OUT}`);
}

run().catch((err) => {
  console.error("✗ failed:", err);
  process.exit(1);
});
