/**
 * Builds the system prompt for "chat with your chart", grounds the AI
 * astrologer in the user's actual computed natal chart so answers reference
 * their real placements rather than generic astrology.
 */
import { bodyMeta, formatDegree, signByIndex } from "@/lib/zodiac";
import type { ChartSalience } from "@/lib/report-salience";
import type { NatalChartJson } from "@/db/schema";
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
];

/** Compact, factual Georgian summary of the chart for the model to reason on. */
export function buildChartContext(
  chart: NatalChartJson,
  salience: ChartSalience,
  locale: UserLocale = "ka",
): string {
  const en = locale === "en";
  const lines: string[] = [];

  const sun = chart.bodies.sun;
  const moon = chart.bodies.moon;
  const asc = chart.ascendant;
  lines.push(
    en
      ? `Big three: Sun in ${signByIndex(sun.signIndex).labelEn} ${formatDegree(sun.signDegree)}, ` +
          `Moon in ${signByIndex(moon.signIndex).labelEn} ${formatDegree(moon.signDegree)}, ` +
          `Ascendant in ${signByIndex(asc.signIndex).labelEn} ${formatDegree(asc.signDegree)}`
      : `დიდი სამეული: მზე ${signByIndex(sun.signIndex).labelKa} ${formatDegree(sun.signDegree)}, ` +
          `მთვარე ${signByIndex(moon.signIndex).labelKa} ${formatDegree(moon.signDegree)}, ` +
          `ამომავალი ${signByIndex(asc.signIndex).labelKa} ${formatDegree(asc.signDegree)}`,
  );

  lines.push(en ? "Planets:" : "პლანეტები:");
  for (const key of PLANET_ORDER) {
    const p = chart.bodies[key];
    if (!p) continue;
    const label = en
      ? key[0].toUpperCase() + key.slice(1)
      : (bodyMeta(key)?.labelKa ?? key);
    const house = p.house
      ? en
        ? `, house ${p.house}`
        : `, მე-${p.house} სახლი`
      : "";
    const retro = p.retrograde ? (en ? ", retrograde" : ", რეტროგრადი") : "";
    const sign = signByIndex(p.signIndex);
    lines.push(
      `- ${label}: ${en ? sign.labelEn : sign.labelKa}${house}${retro}`,
    );
  }

  const houses = [...chart.houses].sort((a, b) => a.number - b.number);
  lines.push(
    (en ? "House signs: " : "სახლების ნიშნები: ") +
      houses
        .map(
          (h) =>
            `${h.number}-${en ? signByIndex(h.signIndex).labelEn : signByIndex(h.signIndex).labelKa}`,
        )
        .join(", "),
  );

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
    for (const a of salience.tightestAspects.slice(0, 6)) {
      lines.push(
        `- ${a.aLabel} ${en ? a.kind : (ASPECT_KA[a.kind] ?? a.kind)} ${a.bLabel} (${en ? "orb" : "ორბი"} ${a.orb.toFixed(1)}°)`,
      );
    }
  }

  return lines.join("\n");
}

/** Full system prompt: persona + rules + memory + the user's chart context. */
export function buildChartChatSystem(
  firstName: string | null,
  chart: NatalChartJson,
  salience: ChartSalience,
  locale: UserLocale = "ka",
  memoryBlock = "",
  opts: { depth?: AskDepth; distress?: DistressLevel } = {},
): string {
  const extras = [
    depthInstruction(opts.depth ?? "auto", locale),
    distressInstruction(opts.distress ?? "none", locale),
  ]
    .filter(Boolean)
    .join("\n");
  const extraBlock = extras ? `\n${extras}\n` : "";
  if (locale === "en") {
    const name = firstName || "the user";
    const memory = memoryBlock.trim()
      ? `\n${memoryBlock.trim()}\nUse it naturally, refer back to earlier topics by name, never recite it verbatim.\n`
      : "";
    return `You are ${name}'s personal astrologer on Vivida. You have their exact natal chart data below. Answer questions about personality, emotions, relationships, career, timing and self-understanding using this specific chart.
${memory}${extraBlock}
Rules:
- Rely only on the supplied chart data. Never invent placements. If the data does not support something, say so.
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
${buildChartContext(chart, salience, "en")}`;
  }
  const name = firstName || "მომხმარებლის";
  const memory = memoryBlock.trim()
    ? `\n${memoryBlock.trim()}\nგამოიყენე ბუნებრივად, ძველი თემები სახელით ახსენე, სიტყვა-სიტყვით ნუ ჩამოთვლი.\n`
    : "";
  return `შენ ხარ ${name}-ის პერსონალური ასტროლოგი Vivida-ზე. გაქვს მისი ნატალური რუკის ზუსტი მონაცემები (ქვემოთ). უპასუხე მის შეკითხვებს ხასიათზე, ემოციებზე, ურთიერთობებზე, კარიერაზე, დროსა და თვითშემეცნებაზე, ყველაფერი ამ კონკრეტულ რუკაზე დაყრდნობით.
${memory}${extraBlock}
წესები:
- დაეყრდენი მხოლოდ მოცემულ მონაცემებს. ნუ მოიგონებ პოზიციებს, რომლებიც აქ არ წერია. თუ რაღაც არ იცი, თქვი გულახდილად.
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
${buildChartContext(chart, salience, "ka")}`;
}
