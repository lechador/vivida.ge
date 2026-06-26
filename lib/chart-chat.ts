/**
 * Builds the system prompt for "chat with your chart" — grounds the AI
 * astrologer in the user's actual computed natal chart so answers reference
 * their real placements rather than generic astrology.
 */
import { bodyMeta, formatDegree, signByIndex } from "@/lib/zodiac";
import type { ChartSalience } from "@/lib/report-salience";
import type { NatalChartJson } from "@/db/schema";

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
  salience: ChartSalience
): string {
  const lines: string[] = [];

  const sun = chart.bodies.sun;
  const moon = chart.bodies.moon;
  const asc = chart.ascendant;
  lines.push(
    `დიდი სამეული: მზე ${signByIndex(sun.signIndex).labelKa} ${formatDegree(sun.signDegree)}, ` +
      `მთვარე ${signByIndex(moon.signIndex).labelKa} ${formatDegree(moon.signDegree)}, ` +
      `ამომავალი ${signByIndex(asc.signIndex).labelKa} ${formatDegree(asc.signDegree)}`
  );

  lines.push("პლანეტები:");
  for (const key of PLANET_ORDER) {
    const p = chart.bodies[key];
    if (!p) continue;
    const label = bodyMeta(key)?.labelKa ?? key;
    const house = p.house ? `, მე-${p.house} სახლი` : "";
    const retro = p.retrograde ? ", რეტროგრადი" : "";
    lines.push(`- ${label}: ${signByIndex(p.signIndex).labelKa}${house}${retro}`);
  }

  const houses = [...chart.houses].sort((a, b) => a.number - b.number);
  lines.push(
    "სახლების ნიშნები: " +
      houses
        .map((h) => `${h.number}-${signByIndex(h.signIndex).labelKa}`)
        .join(", ")
  );

  const ep = salience.elements.percentages;
  lines.push(
    `ელემენტები: ცეცხლი ${Math.round(ep["ცეცხლი"])}%, მიწა ${Math.round(ep["მიწა"])}%, ` +
      `ჰაერი ${Math.round(ep["ჰაერი"])}%, წყალი ${Math.round(ep["წყალი"])}% ` +
      `(დომინანტი: ${salience.elements.dominant})`
  );
  const mp = salience.modality.percentages;
  lines.push(
    `მოდალობა: კარდინალური ${Math.round(mp["კარდინალური"])}%, ` +
      `ფიქსირებული ${Math.round(mp["ფიქსირებული"])}%, ` +
      `მუტაბელური ${Math.round(mp["მუტაბელური"])}% (დომინანტი: ${salience.modality.dominant})`
  );

  if (salience.tightestAspects.length > 0) {
    lines.push("მთავარი ასპექტები (ყველაზე მჭიდრო):");
    for (const a of salience.tightestAspects.slice(0, 6)) {
      lines.push(
        `- ${a.aLabel} ${ASPECT_KA[a.kind] ?? a.kind} ${a.bLabel} (ორბი ${a.orb.toFixed(1)}°)`
      );
    }
  }

  return lines.join("\n");
}

/** Full system prompt: persona + rules + the user's chart context. */
export function buildChartChatSystem(
  firstName: string | null,
  chart: NatalChartJson,
  salience: ChartSalience
): string {
  const name = firstName || "მომხმარებლის";
  return `შენ ხარ ${name}-ის პერსონალური ასტროლოგი Vivida-ზე. გაქვს მისი ნატალური რუკის ზუსტი მონაცემები (ქვემოთ). უპასუხე მის შეკითხვებს ხასიათზე, ემოციებზე, ურთიერთობებზე, კარიერაზე, დროსა და თვითშემეცნებაზე — ყველაფერი ამ კონკრეტულ რუკაზე დაყრდნობით.

წესები:
- დაეყრდენი მხოლოდ მოცემულ მონაცემებს. ნუ მოიგონებ პოზიციებს, რომლებიც აქ არ წერია. თუ რაღაც არ იცი, თქვი გულახდილად.
- თბილი, კონკრეტული, თანამედროვე ქართული. არა ბუნდოვანი მისტიკა, არა კლიშეები ("ვარსკვლავები გელიან").
- მოკლე, საქმიანი პასუხები — 2-4 აბზაცი მაქსიმუმ. დაასახელე კონკრეტული პლანეტა/ნიშანი/სახლი, რომელსაც ეყრდნობი.
- მიმართე "შენ"-ით, თბილი და თანასწორი ტონით.
- თუ შეკითხვა ბუნდოვანია — დააზუსტე ერთი მოკლე კითხვით.
- თუ შეკითხვა საერთოდ არ ეხება ასტროლოგიას, რუკას ან ცხოვრებას — თავაზიანად დააბრუნე თემაზე.
- ნუ მისცემ სამედიცინო, იურიდიულ ან ფინანსურ დირექტივებს. ასტროლოგია თვითშემეცნებისა და რეფლექსიის ხელსაწყოა, არა წინასწარმეტყველება.

${name}-ის ნატალური რუკა:
${buildChartContext(chart, salience)}`;
}
