/**
 * The 12 astrological houses with Georgian labels and one-line descriptors.
 * Each house represents an "area of life" — where the planet's energy plays out.
 *
 * Names follow the convention used in modern Georgian astrology blogs:
 *   "1-ლი სახლი", "მე-2 სახლი", … "მე-12 სახლი".
 */

export type HouseDef = {
  number: number;            // 1..12
  labelKa: string;           // "მე-3 სახლი"
  labelEn: string;
  themeKa: string;           // short theme line, e.g. "კომუნიკაცია, ძმები"
  themeEn: string;
  meaningKa: string;         // one-sentence descriptor of the area of life
  meaningEn: string;
};

export const HOUSES: Record<number, HouseDef> = {
  1: {
    number: 1,
    labelKa: "1-ლი სახლი",
    labelEn: "1st house",
    themeKa: "ჩემი თავი",
    themeEn: "Self and identity",
    meaningKa: "ის, თუ როგორ შემოდიხარ ოთახში — შენი თვითპრეზენტაცია და პირველი შთაბეჭდილება.",
    meaningEn: "How you enter the room—your self-presentation, identity and first impression.",
  },
  2: {
    number: 2,
    labelKa: "მე-2 სახლი",
    labelEn: "2nd house",
    themeKa: "ჩემი რესურსები",
    themeEn: "Resources and values",
    meaningKa: "შენი რესურსები, თვითშეფასება და ის, რაც ცხოვრებაში ფასობს.",
    meaningEn: "Your resources, self-worth and what you value in life.",
  },
  3: {
    number: 3,
    labelKa: "მე-3 სახლი",
    labelEn: "3rd house",
    themeKa: "კომუნიკაცია",
    themeEn: "Communication",
    meaningKa: "ყოველდღიური აზროვნება, საუბრები, უახლოესი გარემო და სწავლა.",
    meaningEn: "Everyday thinking, conversations, your immediate environment and learning.",
  },
  4: {
    number: 4,
    labelKa: "მე-4 სახლი",
    labelEn: "4th house",
    themeKa: "სახლი, ოჯახი",
    themeEn: "Home and family",
    meaningKa: "ემოციური საფუძველი, ოჯახი, ფესვები და პირადი სივრცე.",
    meaningEn: "Your emotional foundation, family, roots and private life.",
  },
  5: {
    number: 5,
    labelKa: "მე-5 სახლი",
    labelEn: "5th house",
    themeKa: "სიხარული, რომანი",
    themeEn: "Joy and creativity",
    meaningKa: "სიხარული, თვითგამოხატვა, რომანტიკული თამაში და შემოქმედებითი პროექტები.",
    meaningEn: "Joy, self-expression, romance and creative projects.",
  },
  6: {
    number: 6,
    labelKa: "მე-6 სახლი",
    labelEn: "6th house",
    themeKa: "საქმე, სხეული",
    themeEn: "Work and wellbeing",
    meaningKa: "ყოველდღიური რუტინა, სამსახური, ჯანმრთელობა და სხვებისთვის სამსახური.",
    meaningEn: "Daily routines, work, wellbeing and service to others.",
  },
  7: {
    number: 7,
    labelKa: "მე-7 სახლი",
    labelEn: "7th house",
    themeKa: "მე და შენ",
    themeEn: "Partnerships",
    meaningKa: "ერთ-ერთი ადამიანი, ვისთანაც ცხოვრობ — სასიყვარულო, საქმიანი ან მოწინააღმდეგე.",
    meaningEn: "One-to-one relationships: romantic, professional and openly adversarial.",
  },
  8: {
    number: 8,
    labelKa: "მე-8 სახლი",
    labelEn: "8th house",
    themeKa: "ტრანსფორმაცია",
    themeEn: "Transformation",
    meaningKa: "ღრმა ცვლილებები, საერთო რესურსები, ფსიქოლოგიური სიღრმე და ინტიმი.",
    meaningEn: "Deep change, shared resources, psychological depth and intimacy.",
  },
  9: {
    number: 9,
    labelKa: "მე-9 სახლი",
    labelEn: "9th house",
    themeKa: "მსოფლმხედველობა",
    themeEn: "Meaning and exploration",
    meaningKa: "უმაღლესი სწავლა, შორი მოგზაურობა, რწმენა და ცხოვრებისეული შეხედულებები.",
    meaningEn: "Higher learning, long-distance travel, belief and your wider worldview.",
  },
  10: {
    number: 10,
    labelKa: "მე-10 სახლი",
    labelEn: "10th house",
    themeKa: "კარიერა, სტატუსი",
    themeEn: "Career and status",
    meaningKa: "ის, რითაც გცნობენ საზოგადოებაში — კარიერა, ავტორიტეტი, წარმატება.",
    meaningEn: "How the world knows you—career, authority, reputation and achievement.",
  },
  11: {
    number: 11,
    labelKa: "მე-11 სახლი",
    labelEn: "11th house",
    themeKa: "თემი, მიზნები",
    themeEn: "Community and goals",
    meaningKa: "შენი წრე, თემი, იმედები მომავლისადმი და გრძელვადიანი მიზნები.",
    meaningEn: "Your network, community, hopes for the future and long-term goals.",
  },
  12: {
    number: 12,
    labelKa: "მე-12 სახლი",
    labelEn: "12th house",
    themeKa: "ფარული სამყარო",
    themeEn: "Inner world",
    meaningKa: "ფარული სამყარო, ოცნებები, სულიერება, ის, რასაც ღიად ვერ ვაჩვენებთ.",
    meaningEn: "The hidden world, dreams, spirituality and what stays outside public view.",
  },
};

export function houseDef(number: number): HouseDef {
  return HOUSES[number];
}

/** "პირველ სახლში" / "მე-5 სახლში" — locative phrase for "in your Nth house". */
export function houseLocativeKa(n: number): string {
  return n === 1 ? "პირველ სახლში" : `მე-${n} სახლში`;
}

export const HOUSE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
