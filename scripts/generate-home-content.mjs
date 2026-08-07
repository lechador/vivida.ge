/**
 * Generate Georgian marketing copy for the public home page (/). One-shot
 * Gemini Flash call, idempotent — skips if the output file exists unless
 * --force is passed. Vivida's landing copy is conversion-critical, so we
 * lean on Gemini for tone instead of hand-translating.
 *
 * Usage:
 *   node scripts/generate-home-content.mjs
 *   node scripts/generate-home-content.mjs --force
 */

import { config } from "dotenv";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

config({ path: ".env.local" });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const OUT = resolve("lib/seo/home-content.json");
mkdirSync(dirname(OUT), { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");

if (!force && existsSync(OUT)) {
  console.log(`✓ ${OUT} exists; pass --force to regenerate`);
  process.exit(0);
}

const SYSTEM_PROMPT = `შენ ხარ თბილი, კონკრეტული ქართველი copywriter — Vivida-ს მთავარი გვერდისთვის (B2C ასტროლოგიური ვებ-აპლიკაცია vivida.ge-ზე). გვერდის მიზანი: 18-35 წლის ქართველმა, რომელიც FB/IG რეკლამიდან მოდის, 60 წამში გაიგოს რას სთავაზობ და დარეგისტრირდეს.

ფაქტები პროდუქტზე — გამოიყენე ეს კონკრეტული ცნებები:
- ვებ-აპი (vivida.ge), არა სატელეფონო აპი — არასოდეს თქვა "გადმოწერე", "App Store", "მაღაზია"
- რეგისტრაცია Google-ით ან ელფოსტით (60 წამში)
- ნატალური რუკა — ცის სრული ფოტოგრაფია შენი დაბადების მომენტიდან: 10 პლანეტა, 12 სახლი, ასპექტები
- მზის + მთვარის + ამომავალი ნიშანი ("დიდი სამეული") — სამივე გამოთვლილი
- ყოველდღიური ჰოროსკოპი — გენერირდება AI-ით (Gemini), ემყარება დღევანდელ ტრანზიტებს შენი რუკის წინააღმდეგ, არა ზოგად მზის-ნიშნის ჰოროსკოპს
- სინასტრიული თავსებადობა — 5 კატეგორია (სიყვარული, მეგობრობა, კომუნიკაცია, ზრდა, ქიმია), მოდელირებული აქცენტებზე
- აღმოჩენა (/discover) — Vivida პოულობს შენთვის თავსებად ხალხს ცის რუკის მიხედვით
- 78 წყვილი თავსებადობის გვერდი (პროექტში, SEO-სთვის)

ტონი:
- "შენ"-ის ფორმა, არა "თქვენ"
- კონკრეტული, არა ბუნდოვანი (მაგ. "მთვარე შენს მე-7 სახლში" ჯობია "უფრო ღრმა გაგებას")
- თბილი, თანასწორი, არა მენტორი
- სიტყვები, რომლებიც ნამდვილ ადამიანებს წერენ — არა LinkedIn copy

მკაცრად აკრძალულია (განზრახ ეცადე ვერ დაწერო):
- "აღმოაჩინე საკუთარი თავი / შენი პოტენციალი / შენი ნამდვილი მე"
- "მოგზაურობა საკუთარი თავისკენ"
- "სამყარო გელის / გელოდება"
- "ბედი / განგება"
- "კოსმიური ID / პასპორტი"
- "გადმოწერე / app store"
- "ცხოვრებისეული მიზნები"
- "ღრმა პოტენციალი"
- "გადმოწერე / აპლიკაცია" (გამოიყენე "შემოდი" ან "გახსენი")
- ცარიელი metaphor-ები ("ცას შეეხე", "კარი გაიღო")
- ემოჯი (გადასცემს კოპი-ში)

დააბრუნე მხოლოდ ვალიდური JSON ამ ზუსტი სქემით:
{
  "hero": {
    "kicker": string,                    // 50-70 სიმბოლო, "ახალი · ..."-ის სტილში
    "headlinePre": string,               // 1-2 სიტყვა (გრადიენტამდე), მაგ. "შენი"
    "headlineGradient": string,          // 2-3 სიტყვა (გრადიენტი), მაგ. "კოსმიური რუკა"
    "headlinePost": string,              // 2-4 სიტყვა (გრადიენტის შემდეგ), მაგ. "ცოცხალი ყოველდღე."
    "subhead": string,                   // 25-35 სიტყვა — რას უწყობს Vivida
    "ctaPrimary": string,                // 4-6 სიტყვა, action-oriented, "Google"-ის ცნება შემავალი
    "ctaPrimaryLoading": string,         // 2-3 სიტყვა, ცოცხალი loading state
    "microNotes": [string, string, string],  // 3 ერთსიტყვიანი/ფრაზა (უფასო, ბარათი არ სჭირდება, 60 წამში)
    "secondary": string                  // 5-8 სიტყვა, "ან ელფოსტით · შესვლა"-ს ალტერნატივა (links injected by template)
  },
  "pillars": [
    { "title": string, "body": string }, // ზუსტად 3 ერთეული
    // titleები: 2-3 სიტყვა, bodyები: 18-25 სიტყვა, კონკრეტული benefit
  ],
  "whatIsSection": {
    "kicker": string,                    // 1 ფრაზა, label
    "title": string,                     // 4-6 სიტყვა — რა არის ნატალური რუკა
    "body": string                       // 2 აბზაცი (\\n\\n), 60-80 სიტყვა მთლიანობაში
  },
  "howItWorks": {
    "title": string,                     // 3-5 სიტყვა
    "steps": [
      { "n": 1, "title": string, "body": string }, // ზუსტად 3 ნაბიჯი
      // titleები: 3-5 სიტყვა, bodyები: 15-22 სიტყვა
    ]
  },
  "features": [
    { "title": string, "body": string }, // ზუსტად 6 feature
    // titleები: 2-4 სიტყვა, bodyები: 12-18 სიტყვა
  ],
  "faq": [
    { "q": string, "a": string }, // ზუსტად 5 კითხვა
    // q: საინტერესო, რეალური (არა generic), a: 25-40 სიტყვა
  ],
  "finalCta": {
    "title": string,                     // 6-9 სიტყვა, ცოცხალი
    "body": string,                      // 18-25 სიტყვა
    "ctaText": string,                   // 3-5 სიტყვა, action
    "subtext": string                    // 6-10 სიტყვა, micro-trust ქვეშ
  }
}

წესები:
- "შენ"-ის ფორმა
- კონკრეტული მაგალითი/ფრაზა ნათლად ჯობია ზოგად ფრაზას
- pillars: თითო pillar უნდა მიუთითებდეს კონკრეტულ ფუნქციაზე (ნატალური რუკა, ყოველდღიური ჰოროსკოპი, თავსებადობა) — არა აბსტრაქტულ ცნებაზე
- features: 6 კონკრეტული ფუნქცია (გადახედე ფაქტებს — დიდი სამეული, ტრანზიტები, AI ჰოროსკოპი, სინასტრია, /discover, 78 თავსებადობის გვერდი)
- howItWorks: უნდა იყოს რეალური workflow (Google-ით შესვლა → დაბადების მონაცემები → რუკა + ჰოროსკოპი)
- faq: რეალური კითხვები ("რატომ მჭირდება ზუსტი დრო", "უფასოა?", "ჩემი მონაცემები საიდუმლოა?", "ვინ ხედავს ჩემს რუკას?")
- finalCta: "გახსენი" ან "შემოდი" — არა "გადმოწერე"
- მხოლოდ JSON, ფენსების გარეშე`;

const USER_PROMPT = `დააწერე Vivida-ს მთავარი გვერდის სრული ქართული copy. JSON-ად დააბრუნე, ზუსტად მოცემული სქემით.`;

async function callOpenRouter(retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KEY}`,
          "HTTP-Referer": "https://vivida.ge",
          "X-Title": "Vivida home copy",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: USER_PROMPT },
          ],
          response_format: { type: "json_object" },
          temperature: 0.85,
          max_tokens: 6000,
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
      console.warn(`  ! attempt ${attempt + 1}: ${err.message}`);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

async function run() {
  console.log("→ generating home page copy…");
  const t0 = Date.now();
  const content = await callOpenRouter();
  writeFileSync(OUT, JSON.stringify(content, null, 2));
  console.log(`  ✓ wrote ${OUT} in ${(Date.now() - t0) / 1000}s`);
}

run().catch((err) => {
  console.error("✗ failed:", err);
  process.exit(1);
});
