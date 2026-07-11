// Proofread the Georgian text in the IQ test (logic questions + their Georgian
// options + the per-type prompts) for grammar/orthography/style via gemini-2.5-pro
// (Vertex). STRICT: never change logic, numbers, Latin letters, names, or which
// answer is correct. Prints original → corrected; apply by hand to lib/iq/items.ts
// (kept static, and the logic items are meaning-sensitive).
//
// Usage: node scripts/proofread-iq-questions.mjs

import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

// Every Georgian string shown to the test-taker (numbers/letter/day/name options
// are left out — they need no grammar). Keyed so corrections are easy to place.
const STRINGS = [
  { key: "prompt.number-series", text: "რომელი რიცხვი აგრძელებს მიმდევრობას?" },
  { key: "prompt.matrix", text: "რომელი ფიგურა უნდა იყოს კითხვის ნიშნის ადგილას?" },
  { key: "prompt.analogy", text: "როგორც პირველი წყვილი — ისე მესამე. რომელი ფიგურაა გამოტოვებული?" },
  { key: "prompt.odd-one-out", text: "აირჩიე ზედმეტი ფიგურა." },
  { key: "l1.q", text: "თუ A > B და B > C, მაშინ რომელი მტკიცებაა ჭეშმარიტი?" },
  { key: "l1.opt.ver", text: "ვერ დავადგენთ" },
  { key: "l2.q", text: "თუ „მზე“ = 3 და „გზა“ = 3, მაშინ „ბაღი“ = ?" },
  { key: "l3.q", text: "ორშაბათი, ოთხშაბათი, პარასკევი, … — რომელი დღე მოდის შემდეგ?" },
  { key: "l4.q", text: "რომელი რიცხვია ზედმეტი? 3, 5, 7, 9, 11" },
  { key: "l5.q", text: "3 მუშა სამუშაოს ასრულებს 3 საათში. რამდენ ხანში დაასრულებს იმავე სამუშაოს 6 მუშა?" },
  { key: "l8.q", text: "ა, გ, ე, ზ, … — რომელი ასო მოდის შემდეგ?" },
  { key: "l7.q", text: "ანა უფროსია ბექოზე. გია უფროსია ანაზე. დათო უმცროსია ბექოზე. ვინ არის ყველაზე უფროსი?" },
  { key: "l6.q", text: "ყველა კატა ცხოველია. ზოგიერთი ცხოველი შავია. რომელი დასკვნაა ნამდვილად სწორი?" },
  { key: "l6.opt.a", text: "ყველა კატა შავია" },
  { key: "l6.opt.b", text: "ზოგი კატა შავია" },
  { key: "l6.opt.c", text: "ვერ დავადგენთ, არის თუ არა კატა შავი" },
  { key: "l6.opt.d", text: "ვერცერთი კატა არ არის შავი" },
  { key: "l9.q", text: "ზოგი A არის B. ყველა B არის C. ვერცერთი C არ არის D. რომელი დასკვნა აუცილებლად სწორია?" },
  { key: "l9.opt.a", text: "ყველა A არის D" },
  { key: "l9.opt.b", text: "ზოგი A არ არის D" },
  { key: "l9.opt.c", text: "ვერცერთი A არ არის C" },
  { key: "l9.opt.d", text: "ყველა D არის B" },
];

const SYSTEM =
  "შენ ხარ ქართული ენის პროფესიონალი კორექტორი. ასწორებ IQ ტესტის ტექსტებს მხოლოდ " +
  "გრამატიკულად, ორთოგრაფიულად და სტილისტურად. მკაცრი წესები: (1) არ შეცვალო აზრი, " +
  "ლოგიკა და ის, თუ რომელი პასუხია სწორი; (2) არ შეცვალო რიცხვები, ლათინური ასოები " +
  "(A, B, C, D), სახელები, კვირის დღეები და ქართული ანბანის ცალკეული ასოები; " +
  "(3) გახადე ბუნებრივი და გამართული, მაგრამ მოკლე და ტესტისთვის შესაფერისი; " +
  "(4) თუ ტექსტი უკვე გამართულია, დააბრუნე უცვლელად. დააბრუნე მხოლოდ ვალიდური JSON " +
  'მასივი: [{"key": string, "text": string}].';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
});

async function main() {
  if (!process.env.GOOGLE_CLOUD_PROJECT) throw new Error("GOOGLE_CLOUD_PROJECT missing");
  const res = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: "გაასწორე ეს ტექსტები:\n" + JSON.stringify(STRINGS, null, 2),
    config: {
      systemInstruction: SYSTEM,
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
  const raw = (res.text ?? "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const corrected = JSON.parse(raw);
  const byKey = new Map(corrected.map((c) => [c.key, String(c.text).trim()]));

  let changed = 0;
  for (const s of STRINGS) {
    const fixed = byKey.get(s.key);
    if (!fixed || fixed === s.text) continue;
    changed++;
    console.log(`\n[${s.key}]`);
    console.log(`  - ${s.text}`);
    console.log(`  + ${fixed}`);
  }
  console.log(`\n${changed} of ${STRINGS.length} suggested changes (review before applying).`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
