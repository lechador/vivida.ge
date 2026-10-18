/**
 * Generate Georgian copy for synastry aspect detail modals via OpenRouter
 * (Gemini 3.5 Flash Lite). Produces a `positive` paragraph + `negative`
 * paragraph + `takeaway` for every (aspect-kind × body-pair) combo,
 * 5 aspects × 91 unique body pairs = 455 entries.
 *
 * Idempotent + resumable: skips keys already present in
 * lib/seo/synastry-aspects.json unless --force is passed.
 *
 * Usage:
 *   node scripts/generate-synastry-aspects.mjs           # fill missing
 *   node scripts/generate-synastry-aspects.mjs --force   # regenerate all
 *   node scripts/generate-synastry-aspects.mjs --aspect square   # one aspect kind
 *   node scripts/generate-synastry-aspects.mjs --concurrency 6   # default 6
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

const OUT = resolve("lib/seo/synastry-aspects.json");
mkdirSync(dirname(OUT), { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");
function arg(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}
const aspectFilter = arg("--aspect");
const CONCURRENCY = Number(arg("--concurrency") ?? 6);

const BODY_ORDER = [
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
  "chiron",
  "ascendant",
  "midheaven",
];

const BODY_LABEL = {
  sun: "მზე",
  moon: "მთვარე",
  mercury: "მერკური",
  venus: "ვენერა",
  mars: "მარსი",
  jupiter: "იუპიტერი",
  saturn: "სატურნი",
  uranus: "ურანი",
  neptune: "ნეპტუნი",
  pluto: "პლუტონი",
  chiron: "ქირონი",
  ascendant: "ამომავალი",
  midheaven: "ზენიტი",
};

const BODY_DESC = {
  sun: "ბირთვი, ვინ ხარ ცხოვრების ცენტრში",
  moon: "ემოციური სამყარო, როგორ გრძნობ თავს და გჭირდება სიახლოვე",
  mercury: "აზროვნება და სიტყვა, როგორ ფიქრობ და როგორ ეუბნები",
  venus: "სიყვარული, ფასეულობა, ეფერებას როგორ უდგები",
  mars: "ენერგია, მოქმედება, რა გცეცხლავს",
  jupiter: "ზრდა, რწმენა, რა აფართოებს ცხოვრებას",
  saturn: "სიმწიფე, ვალდებულება, ხანგრძლივი მშენებლობა",
  uranus: "თავისუფლება, მოულოდნელობა, თვითობის ცვლა",
  neptune: "ოცნებები, ინტუიცია, ხელშეუხებელი მგრძნობელობა",
  pluto: "გარდასახვა, ფუნდამენტური ცვლა, ძველის სიკვდილი",
  chiron: "ჭრილი და კურნება, სადაც ცემო და სადაც სხვებს ეხმარები",
  ascendant: "თვითგამოხატვა, პირველი შთაბეჭდილება, „ნიღაბი“",
  midheaven: "მიზანი, საქვეყნო წარმოჩენა, სოციალური მიმართულება",
};

const ASPECT_META = {
  conjunction: {
    labelKa: "კონიუნქცია",
    glyph: "☌",
    valence: "neutral",
    desc: "ენერგიები ერთ წერტილში იყრება, ფუნდამენტური შერწყმა.",
  },
  trine: {
    labelKa: "ტრინი",
    glyph: "△",
    valence: "harmonious",
    desc: "ჰარმონიული ნაკადი, ენერგიები ცდის გარეშე მიედინება.",
  },
  sextile: {
    labelKa: "სექსტილი",
    glyph: "✶",
    valence: "harmonious",
    desc: "მეგობრული თანამშრომლობა, მცირე, მაგრამ თბილი შეთავაზებები.",
  },
  square: {
    labelKa: "კვადრატი",
    glyph: "□",
    valence: "tense",
    desc: "დაძაბულობა, რომელიც მოქმედებას იძულებს, ზრდის ძრავა.",
  },
  opposition: {
    labelKa: "ოპოზიცია",
    glyph: "☍",
    valence: "tense",
    desc: "ორი სარკული მხარის გადაცილება, ბალანსისა და ანარეკლის გაკვეთილი.",
  },
};

function pairKey(kind, a, b) {
  const ia = BODY_ORDER.indexOf(a);
  const ib = BODY_ORDER.indexOf(b);
  const [first, second] = ia <= ib ? [a, b] : [b, a];
  return `${kind}:${first}-${second}`;
}

function buildJobs() {
  const jobs = [];
  const aspects = aspectFilter
    ? [aspectFilter].filter((k) => ASPECT_META[k])
    : Object.keys(ASPECT_META);
  for (const kind of aspects) {
    for (let i = 0; i < BODY_ORDER.length; i++) {
      for (let j = i; j < BODY_ORDER.length; j++) {
        jobs.push({
          key: pairKey(kind, BODY_ORDER[i], BODY_ORDER[j]),
          kind,
          a: BODY_ORDER[i],
          b: BODY_ORDER[j],
        });
      }
    }
  }
  return jobs;
}

const SYSTEM_PROMPT = `შენ ხარ თბილი, გამოცდილი ქართველი ასტროლოგი, რომელიც წერს თანამედროვე ახალგაზრდა აუდიტორიისთვის. ენა, სუფთა, ნათელი, გრამატიკულად სრულიად სწორი ქართული. არანაირი არქაიზმი, არც „თქვენ"-ის ფორმალურობა.

წესები:
- პასუხი მხოლოდ ვალიდური JSON ობიექტი ამ სქემით:
  {
    "positive": string,   // 2-3 წინადადება, რას აძლევს ეს ენერგია წყვილს, რა მუშაობს, სად არის საჩუქარი
    "negative": string,   // 2-3 წინადადება, რა არის გამოწვევა, სადაა ხახუნი, რა შეიძლება დაიკარგოს
    "takeaway": string    // 1-2 წინადადება, კონკრეტული, ცნობიერი მოქმედება ამ ენერგიასთან
  }
- ორივე, positive და negative, სავალდებულოა, ჰარმონიული ასპექტისთვისაც კი (ჰარმონიას ჩვევად ქცევის რისკი აქვს), დაძაბული ასპექტისთვისაც (დაძაბულობა ცოცხალ ენერგიას ქმნის).
- აღწერე ენერგია, რა ხდება ორ ადამიანს შორის ამ კონკრეტულ თემაში. არ ისაუბრო ბუნდოვნად, არ გამოიყენო კლიშე ფრაზები ("ეს კავშირი მაგიური იქნება" და მსგავსი).
- არ გამოიყენო ემოჯი, მარკდაუნი, ციტატის ნიშნები.
- გრამატიკა აბსოლუტურად სუფთა იყოს, ზმნის ფორმები, ბრუნვები (განსაკუთრებით დატივი), თანდებულები ყველა შესწორებული.
- არ გაიმეორო თემის სახელი ("ენერგია", "გრძნობები" და სხვა) ერთსა და იმავე წინადადებაში.
- არ ახსენო ვებსაიტი, ბრენდი, „Vivida", „ჩვენ".
- არ დაამატო JSON-ის გარე ტექსტი (no preamble, no code fences).`;

function userPrompt(kind, a, b) {
  const meta = ASPECT_META[kind];
  return `დაწერე ქართულად სინასტრიის ასპექტის დეტალური აღწერა.

ასპექტი: ${meta.labelKa} (${meta.glyph}), ${meta.desc}
ვალენტობა: ${meta.valence === "harmonious" ? "ჰარმონიული" : meta.valence === "tense" ? "დაძაბული" : "ნეიტრალური (კონიუნქცია)"}

პირველი წერტილი: ${BODY_LABEL[a]}, ${BODY_DESC[a]}
მეორე წერტილი: ${BODY_LABEL[b]}, ${BODY_DESC[b]}

დაწერე როგორ ერთვება ეს ორი ენერგია ერთმანეთში წყვილში, როცა ${meta.labelKa}-ით არიან დაკავშირებული. მოგვეცი:

1. positive: 2-3 წინადადება, რა საჩუქარი არის აქ. რა გესმით ერთად. რა იოლდება. რა ცოცხლდება.
2. negative: 2-3 წინადადება, რა არის ბნელი მხარე. სად ვუჩვევრდებით ერთმანეთს. რას გამოეპარეთ. რა დაგროვდება, თუ ცნობიერებაში არ დადგება.
3. takeaway: 1-2 წინადადება, კონკრეტული რჩევა, რომ ცოცხლდეს და არ დაიკარგოს ეს ენერგია.

დააბრუნე მხოლოდ JSON ობიექტი. გრამატიკა იყოს უნაკლო, ყურადღება მიაქციე ბრუნვებს და ზმნის შეთანხმებას ქვემდებარესთან.`;
}

async function callOpenRouter(systemPrompt, userPromptStr) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      "HTTP-Referer": "https://www.vivida.ge",
      "X-Title": "Vivida synastry aspect generation",
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptStr },
      ],
      response_format: { type: "json_object" },
      temperature: 0.65,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response");
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}\n${content.slice(0, 300)}`);
  }
  if (
    typeof parsed.positive !== "string" ||
    typeof parsed.negative !== "string" ||
    typeof parsed.takeaway !== "string"
  ) {
    throw new Error(`Bad shape: ${Object.keys(parsed).join(",")}`);
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

function save(data) {
  writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function processOne(job) {
  let attempt = 0;
  while (attempt < 3) {
    try {
      const out = await callOpenRouter(
        SYSTEM_PROMPT,
        userPrompt(job.kind, job.a, job.b),
      );
      return {
        positive: out.positive.trim(),
        negative: out.negative.trim(),
        takeaway: out.takeaway.trim(),
      };
    } catch (err) {
      attempt += 1;
      if (attempt >= 3) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error("unreachable");
}

async function main() {
  const data = loadExisting();
  const jobs = buildJobs();
  const todo = force ? jobs : jobs.filter((j) => !data[j.key]);

  console.log(
    `→ ${todo.length}/${jobs.length} entries to generate (force=${force}, concurrency=${CONCURRENCY})`,
  );
  if (todo.length === 0) {
    console.log("nothing to do");
    return;
  }

  let done = 0;
  let failed = 0;
  let saveCounter = 0;
  const queue = todo.slice();
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const job = queue.shift();
      if (!job) return;
      try {
        const out = await processOne(job);
        data[job.key] = out;
        done += 1;
        saveCounter += 1;
        if (done % 10 === 0 || done === todo.length) {
          console.log(`  ✓ ${done}/${todo.length}`);
        }
        if (saveCounter >= 25) {
          save(data);
          saveCounter = 0;
        }
      } catch (err) {
        failed += 1;
        console.warn(`  × ${job.key}: ${err.message}`);
      }
    }
  });
  await Promise.all(workers);
  save(data);
  console.log(`done, ${done} ok, ${failed} failed (${OUT})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
