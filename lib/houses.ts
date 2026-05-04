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
  themeKa: string;           // short theme line, e.g. "კომუნიკაცია, ძმები"
  meaningKa: string;         // one-sentence descriptor of the area of life
};

export const HOUSES: Record<number, HouseDef> = {
  1: {
    number: 1,
    labelKa: "1-ლი სახლი",
    themeKa: "გარეგნობა, იდენტობა",
    meaningKa: "ის, თუ როგორ შემოდიხარ ოთახში — შენი თვითპრეზენტაცია და პირველი შთაბეჭდილება.",
  },
  2: {
    number: 2,
    labelKa: "მე-2 სახლი",
    themeKa: "ფული, ღირებულებები",
    meaningKa: "შენი რესურსები, თვითშეფასება და ის, რაც ცხოვრებაში ფასობს.",
  },
  3: {
    number: 3,
    labelKa: "მე-3 სახლი",
    themeKa: "კომუნიკაცია, ძმები",
    meaningKa: "ყოველდღიური აზროვნება, საუბრები, უახლოესი გარემო და სწავლა.",
  },
  4: {
    number: 4,
    labelKa: "მე-4 სახლი",
    themeKa: "სახლი, ფესვები",
    meaningKa: "ემოციური საფუძველი, ოჯახი, ფესვები და პირადი სივრცე.",
  },
  5: {
    number: 5,
    labelKa: "მე-5 სახლი",
    themeKa: "შემოქმედება, რომანი",
    meaningKa: "სიხარული, თვითგამოხატვა, რომანტიკული თამაში და შემოქმედებითი პროექტები.",
  },
  6: {
    number: 6,
    labelKa: "მე-6 სახლი",
    themeKa: "სამუშაო, ჯანმრთელობა",
    meaningKa: "ყოველდღიური რუტინა, სამსახური, ჯანმრთელობა და სხვებისთვის სამსახური.",
  },
  7: {
    number: 7,
    labelKa: "მე-7 სახლი",
    themeKa: "პარტნიორობა",
    meaningKa: "ერთ-ერთი ადამიანი, ვისთანაც ცხოვრობ — სასიყვარულო, საქმიანი ან მოწინააღმდეგე.",
  },
  8: {
    number: 8,
    labelKa: "მე-8 სახლი",
    themeKa: "ტრანსფორმაცია, ინტიმი",
    meaningKa: "ღრმა ცვლილებები, საერთო რესურსები, ფსიქოლოგიური სიღრმე და ინტიმი.",
  },
  9: {
    number: 9,
    labelKa: "მე-9 სახლი",
    themeKa: "ფილოსოფია, მოგზაურობა",
    meaningKa: "უმაღლესი სწავლა, შორი მოგზაურობა, რწმენა და ცხოვრებისეული შეხედულებები.",
  },
  10: {
    number: 10,
    labelKa: "მე-10 სახლი",
    themeKa: "კარიერა, რეპუტაცია",
    meaningKa: "ის, რითაც გცნობენ საზოგადოებაში — კარიერა, ავტორიტეტი, წარმატება.",
  },
  11: {
    number: 11,
    labelKa: "მე-11 სახლი",
    themeKa: "მეგობრები, მომავალი",
    meaningKa: "შენი წრე, თემი, იმედები მომავლისადმი და გრძელვადიანი მიზნები.",
  },
  12: {
    number: 12,
    labelKa: "მე-12 სახლი",
    themeKa: "ქვეცნობიერი, სულიერი",
    meaningKa: "ფარული სამყარო, ოცნებები, სულიერება, ის, რასაც ღიად ვერ ვაჩვენებთ.",
  },
};

export function houseDef(number: number): HouseDef {
  return HOUSES[number];
}

export const HOUSE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
