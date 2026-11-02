/**
 * The 12 astrological houses with Georgian labels and one-line descriptors.
 * Each house represents an "area of life", where the planet's energy plays out.
 *
 * Names follow the convention used in modern Georgian astrology blogs:
 *   "1-ლი სახლი", "მე-2 სახლი", … "მე-12 სახლი".
 */

export type HouseDef = {
  number: number; // 1..12
  labelKa: string; // "მე-3 სახლი"
  labelEn: string;
  labelPl: string;
  themeKa: string; // short theme line, e.g. "კომუნიკაცია, ძმები"
  themeEn: string;
  themePl: string;
  meaningKa: string; // one-sentence descriptor of the area of life
  meaningEn: string;
  meaningPl: string;
};

export const HOUSES: Record<number, HouseDef> = {
  1: {
    number: 1,
    labelKa: "1-ლი სახლი",
    labelEn: "1st house",
    labelPl: "1. dom",
    themeKa: "ჩემი თავი",
    themeEn: "Self and identity",
    themePl: "Ja i tożsamość",
    meaningKa:
      "ის, თუ როგორ შემოდიხარ ოთახში, შენი თვითპრეზენტაცია და პირველი შთაბეჭდილება.",
    meaningEn:
      "How you enter the room, your self-presentation, identity and first impression.",
    meaningPl:
      "Twoje pierwsze wrażenie, autoprezentacja, tożsamość i sposób, w jaki wchodzisz do pomieszczenia.",
  },
  2: {
    number: 2,
    labelKa: "მე-2 სახლი",
    labelEn: "2nd house",
    labelPl: "2. dom",
    themeKa: "ჩემი რესურსები",
    themeEn: "Resources and values",
    themePl: "Zasoby i wartości",
    meaningKa: "შენი რესურსები, თვითშეფასება და ის, რაც ცხოვრებაში ფასობს.",
    meaningEn: "Your resources, self-worth and what you value in life.",
    meaningPl:
      "Twoje zasoby materialne, poczucie własnej wartości i to, co najbardziej cenisz w życiu.",
  },
  3: {
    number: 3,
    labelKa: "მე-3 სახლი",
    labelEn: "3rd house",
    labelPl: "3. dom",
    themeKa: "კომუნიკაცია",
    themeEn: "Communication",
    themePl: "Komunikacja i myślenie",
    meaningKa: "ყოველდღიური აზროვნება, საუბრები, უახლოესი გარემო და სწავლა.",
    meaningEn:
      "Everyday thinking, conversations, your immediate environment and learning.",
    meaningPl: "Codzienne myślenie, rozmowy, najbliższe otoczenie i nauka.",
  },
  4: {
    number: 4,
    labelKa: "მე-4 სახლი",
    labelEn: "4th house",
    labelPl: "4. dom",
    themeKa: "სახლი, ოჯახი",
    themeEn: "Home and family",
    themePl: "Dom i korzenie",
    meaningKa: "ემოციური საფუძველი, ოჯახი, ფესვები და პირადი სივრცე.",
    meaningEn: "Your emotional foundation, family, roots and private life.",
    meaningPl:
      "Twój emocjonalny fundament, rodzina, pochodzenie i życie prywatne.",
  },
  5: {
    number: 5,
    labelKa: "მე-5 სახლი",
    labelEn: "5th house",
    labelPl: "5. dom",
    themeKa: "სიხარული, რომანი",
    themeEn: "Joy and creativity",
    themePl: "Radość i kreatywność",
    meaningKa:
      "სიხარული, თვითგამოხატვა, რომანტიკული თამაში და შემოქმედებითი პროექტები.",
    meaningEn: "Joy, self-expression, romance and creative projects.",
    meaningPl: "Radość, ekspresja twórcza, romans i projekty płynące z serca.",
  },
  6: {
    number: 6,
    labelKa: "მე-6 სახლი",
    labelEn: "6th house",
    labelPl: "6. dom",
    themeKa: "საქმე, სხეული",
    themeEn: "Work and wellbeing",
    themePl: "Praca i zdrowie",
    meaningKa:
      "ყოველდღიური რუტინა, სამსახური, ჯანმრთელობა და სხვებისთვის სამსახური.",
    meaningEn: "Daily routines, work, wellbeing and service to others.",
    meaningPl: "Codzienna rutyna, obowiązki, zdrowie, nawyki i służba innym.",
  },
  7: {
    number: 7,
    labelKa: "მე-7 სახლი",
    labelEn: "7th house",
    labelPl: "7. dom",
    themeKa: "მე და შენ",
    themeEn: "Partnerships",
    themePl: "Relacje i partnerstwo",
    meaningKa:
      "ერთ-ერთი ადამიანი, ვისთანაც ცხოვრობ, სასიყვარულო, საქმიანი ან მოწინააღმდეგე.",
    meaningEn:
      "One-to-one relationships: romantic, professional and openly adversarial.",
    meaningPl:
      "Relacje jeden na jeden: miłosne, biznesowe oraz jawni przeciwnicy.",
  },
  8: {
    number: 8,
    labelKa: "მე-8 სახლი",
    labelEn: "8th house",
    labelPl: "8. dom",
    themeKa: "ტრანსფორმაცია",
    themeEn: "Transformation",
    themePl: "Transformacja i intymność",
    meaningKa:
      "ღრმა ცვლილებები, საერთო რესურსები, ფსიქოლოგიური სიღრმე და ინტიმი.",
    meaningEn:
      "Deep change, shared resources, psychological depth and intimacy.",
    meaningPl: "Głębokie przemiany, wspólne zasoby, psychologia i intymność.",
  },
  9: {
    number: 9,
    labelKa: "მე-9 სახლი",
    labelEn: "9th house",
    labelPl: "9. dom",
    themeKa: "მსოფლმხედველობა",
    themeEn: "Meaning and exploration",
    themePl: "Światopogląd i rozwój",
    meaningKa:
      "უმაღლესი სწავლა, შორი მოგზაურობა, რწმენა და ცხოვრებისეული შეხედულებები.",
    meaningEn:
      "Higher learning, long-distance travel, belief and your wider worldview.",
    meaningPl:
      "Wyższa edukacja, dalekie podróże, filozofia i poszukiwanie sensu.",
  },
  10: {
    number: 10,
    labelKa: "მე-10 სახლი",
    labelEn: "10th house",
    labelPl: "10. dom",
    themeKa: "კარიერა, სტატუსი",
    themeEn: "Career and status",
    themePl: "Kariera i status",
    meaningKa:
      "ის, რითაც გცნობენ საზოგადოებაში, კარიერა, ავტორიტეტი, წარმატება.",
    meaningEn:
      "How the world knows you, career, authority, reputation and achievement.",
    meaningPl:
      "Twoje miejsce w świecie, kariera, reputacja, autorytet i osiągnięcia.",
  },
  11: {
    number: 11,
    labelKa: "მე-11 სახლი",
    labelEn: "11th house",
    labelPl: "11. dom",
    themeKa: "თემი, მიზნები",
    themeEn: "Community and goals",
    themePl: "Społeczność i plany",
    meaningKa: "შენი წრე, თემი, იმედები მომავლისადმი და გრძელვადიანი მიზნები.",
    meaningEn:
      "Your network, community, hopes for the future and long-term goals.",
    meaningPl:
      "Twoje kręgi znajomych, społeczność, plany na przyszłość i wielkie cele.",
  },
  12: {
    number: 12,
    labelKa: "მე-12 სახლი",
    labelEn: "12th house",
    labelPl: "12. dom",
    themeKa: "ფარული სამყარო",
    themeEn: "Inner world",
    themePl: "Życie wewnętrzne",
    meaningKa:
      "ფარული სამყარო, ოცნებები, სულიერება, ის, რასაც ღიად ვერ ვაჩვენებთ.",
    meaningEn:
      "The hidden world, dreams, spirituality and what stays outside public view.",
    meaningPl:
      "Świat ukryty, podświadomość, sny, duchowość i to, co niewidoczne dla świata.",
  },
};

export function houseDef(number: number): HouseDef {
  return HOUSES[number];
}

/** "პირველ სახლში" / "მე-5 სახლში", locative phrase for "in your Nth house". */
export function houseLocativeKa(n: number): string {
  return n === 1 ? "პირველ სახლში" : `მე-${n} სახლში`;
}

export function houseLocativePl(n: number): string {
  return `${n}. domu`;
}

export function houseLabel(n: number, locale?: string): string {
  if (locale === "pl") return HOUSES[n]?.labelPl ?? `${n}. dom`;
  if (locale === "ka") return HOUSES[n]?.labelKa ?? `მე-${n} სახლი`;
  return HOUSES[n]?.labelEn ?? `${n}th house`;
}

export function houseTheme(n: number, locale?: string): string {
  if (locale === "pl") return HOUSES[n]?.themePl ?? "";
  if (locale === "ka") return HOUSES[n]?.themeKa ?? "";
  return HOUSES[n]?.themeEn ?? "";
}

export const HOUSE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
