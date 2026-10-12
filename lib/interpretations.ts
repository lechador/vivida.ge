/**
 * Curated Georgian interpretations for the natal chart "big three":
 * Sun (core identity), Moon (emotional inner world), Ascendant (social mask).
 *
 * Polished by Gemini 2.5 Pro (see scripts/translate-interpretations.ts) for
 * natural Georgian phrasing. Used as the offline fallback and as the seed
 * passed into the AI augmentation prompt.
 */

import { SIGNS } from "./zodiac";
import type { UserLocale } from "@/lib/i18n/user-locale";

type BigThreeKind = "sun" | "moon" | "ascendant";

const SUN_KA: Record<string, string> = {
  aries:
    "შენი მზე ვერძშია, შენ ხარ პიონერი, რომელიც არასდროს ყოვნდება. მოქმედება შენი ენაა; შენი შემოსვლისთანავე ოთახის ენერგია იცვლება.",
  taurus:
    "მზე კუროში, შენთვის მთავარია მუდმივობა და სიმშვიდე. აფასებ იმას, რასაც ხელით ეხები: ხელშესახებ სილამაზეს, კომფორტს და იმას, რაც დროს უძლებს.",
  gemini:
    "მზე ტყუპებში, ცნობისმოყვარეობა შენი საწვავია. მრავალფეროვანი საუბარი, სწრაფი აზროვნება და ცოცხალი დიალოგი შენი სტიქიაა.",
  cancer:
    "მზე კირჩხიბში, შენი ბირთვი ზრუნვა და დაცულობის შექმნაა. სახლს იქაც ქმნი, სადაც სხვები მხოლოდ ოთახს ხედავენ.",
  leo: "მზე ლომში, შენი არსი გულუხვი მზის სხივია. ცხოვრობ ისე, თითქოს სცენაზე იდგე, და ეს ცარიელი ბრწყინვალება კი არა, გულის სითბოა.",
  virgo:
    "მზე ქალწულში, დეტალებისადმი სიყვარული შენი ხელწერაა. გინდა, რომ ყველაფერი, რასაც აკეთებ, იდეალურად იყოს შესრულებული და ამ უნარს სხვებსაც უზიარებ.",
  libra:
    "მზე სასწორში, სილამაზე და ბალანსი შენი მთავარი ღირებულებებია. შენი ყოველი მოძრაობაც კი თითქოს ერთიანი კომპოზიციის ნაწილია.",
  scorpio:
    "მზე მორიელში, შენი ძალა იქ იღვიძებს, სადაც სხვები ფიქრსაც კი ერიდებიან. შეუპოვარი მზერით, ცხოვრების სიღრმეებს გაბედულად ეთამაშები.",
  sagittarius:
    "მზე მშვილდოსანში, სიმართლე და თავისუფლება შენი მთავარი ცეცხლია. გინდა, მუდმივად აფართოებდე ჰორიზონტს და შენი ნაპოვნი ჭეშმარიტება ცხოვრების წესად აქციო.",
  capricorn:
    "მზე თხის რქაში, შენი ძალა მოთმინებასა და გრძელვადიან მიზნებშია. ნაბიჯ-ნაბიჯ, წლების განმავლობაში აშენებ იმას, რაზეც სხვები მხოლოდ ოცნებობენ.",
  aquarius:
    "მზე მერწყულში, განსხვავებულობა შენი ხელწერაა. შენი გონება მომავლის ფანჯარას ჰგავს, ამიტომაც ხედავ ყოველთვის ერთი ნაბიჯით წინ.",
  pisces:
    "მზე თევზებში, შენი შინაგანი სამყარო მრავალფეროვანი და ცვალებადია. უმეტესობაზე ბევრად მგრძნობიარე ხარ და შენი მეშვეობით სამყარო უფრო თანამგრძნობი ხდება.",
};

const SUN_EN: Record<string, string> = {
  aries:
    "Your Sun is in Aries, you are a trailblazer who never hesitates. Action is your native language; your presence immediately shifts the room's momentum.",
  taurus:
    "Sun in Taurus, stability and grounded calm are your core. You value what is tangible: lasting beauty, comfort, and enduring strength.",
  gemini:
    "Sun in Gemini, curiosity is your engine. Versatile conversations, fast associative thinking, and vibrant dialogue are your natural element.",
  cancer:
    "Sun in Cancer, your core is protection and emotional sheltering. You create a sense of home wherever you go.",
  leo: "Sun in Leo, your essence is radiant warmth and generosity. You show up with genuine heart and joyful creative expression.",
  virgo:
    "Sun in Virgo, devotion to craft and thoughtful refinement are your hallmarks. You bring order and helpful clarity to everything you touch.",
  libra:
    "Sun in Libra, balance, aesthetic grace, and harmonious connection define your path. You seek beauty and fair proportion.",
  scorpio:
    "Sun in Scorpio, your strength awakens where others look away. With penetrating insight, you navigate life's deeper currents.",
  sagittarius:
    "Sun in Sagittarius, truth and expansive freedom are your inner flame. You seek to broaden horizons and turn discoveries into wisdom.",
  capricorn:
    "Sun in Capricorn, your mastery lies in patience and sustained achievement. Step by step, you build what endures.",
  aquarius:
    "Sun in Aquarius, originality and visionary clarity are your signature. Your mind naturally looks toward tomorrow.",
  pisces:
    "Sun in Pisces, your inner world is rich, fluid, and empathetic. You bring deep compassion and imaginative depth to life.",
};

const MOON_KA: Record<string, string> = {
  aries:
    "მთვარე ვერძში, შენი გრძნობები მძაფრი და იმპულსურია. სიმშვიდეს პოულობ, როცა ემოციას მოქმედებაში თარგმნი. ყოყმანი და უმოქმედობა კი გაღიზიანებს.",
  taurus:
    "მთვარე კუროში, სიმშვიდეს გაძლევს სტაბილურობა, სასიამოვნო შეხება და ნაცნობი ბგერები. შენი ემოციური სამყარო მყარია და მისი შერყევა რთულია.",
  gemini:
    "მთვარე ტყუპებში, ემოციურ სიმშვიდეს პოულობ, როცა გრძნობებს სიტყვებით გამოხატავ. სიჩუმე გთრგუნავს, დიალოგი კი, გხსნის.",
  cancer:
    "მთვარე კირჩხიბში, შენი გრძნობები ღრმა და ცვალებადია, როგორც ზღვის ტალღები. სიმშვიდეს გჩუქნის ოჯახური სითბო, წყლის ხმა და ნაცნობი სურნელი.",
  leo: "მთვარე ლომში, აღიარება ფუფუნება კი არა, ჰაერივით გჭირდება. როცა გიყვარს, გიყვარს დიდად, ან საერთოდ არა.",
  virgo:
    "მთვარე ქალწულში, წესრიგი სიმშვიდეს განიჭებს. ემოციებში ანალიზით ერკვევი, ხანდახან ჯანსაღად, ხანდახან კი ცოტა ზედმეტად.",
  libra:
    "მთვარე სასწორში, ემოციურ სიმშვიდეს მაშინ გრძნობ, როცა ურთიერთობები ჰარმონიულია. კონფლიქტი კი იმაზე ბევრად მძიმედ გადაგაქვს, ვიდრე ჩანს.",
  scorpio:
    "მთვარე მორიელში, შენი ემოციები ინტენსიური და დაფარულია. ცოტას ენდობი, მაგრამ ვისაც ენდობი, ბოლომდე.",
  sagittarius:
    "მთვარე მშვილდოსანში, სიმშვიდეს განიჭებს მოძრაობა, ახალი იდეები და შორეული ჰორიზონტები. ერთ ადგილას დიდხანს გაჩერება ემოციურად გფიტავს.",
  capricorn:
    "მთვარე თხის რქაში, სიმშვიდეს განიჭებს კონტროლის შეგრძნება, პასუხისმგებლობა და კონკრეტული მიღწევები. ემოციურად, ხშირად ნაადრევად ზრდასრულდები.",
  aquarius:
    "მთვარე მერწყულში, ემოციური თავისუფლება გჭირდება. გრძნობებს ხშირად გონებით აანალიზებ და სწორედ ეს ლოგიკა გეხმარება ემოციური ბურუსიდან გამოსვლაში.",
  pisces:
    "მთვარე თევზებში, შენი ემოციები ღრმა და უსაზღვროა, ზოგჯერ კი, უკონტროლოდ მძაფრი. სიმშვიდეს ხელოვნებაში, წყალთან და სიჩუმეში პოულობ.",
};

const MOON_EN: Record<string, string> = {
  aries:
    "Moon in Aries, your feelings are direct, fiery, and immediate. You find inner peace by translating emotions into purposeful action.",
  taurus:
    "Moon in Taurus, emotional safety comes through stability, tactile warmth, and steady routines. Your feelings are steady and rooted.",
  gemini:
    "Moon in Gemini, you process emotions through language, questions, and open dialogue. Quiet containment feels stifling.",
  cancer:
    "Moon in Cancer, your feelings ebb and flow with deep intuitive sensitivity. You thrive in environments of warmth, memory, and heartfelt care.",
  leo: "Moon in Leo, emotional validation and heartfelt appreciation are essential to your spirit. When you love, you give generously.",
  virgo:
    "Moon in Virgo, order, helpful service, and thoughtful structure soothe your mind. You process feelings by finding practical solutions.",
  libra:
    "Moon in Libra, harmony in your connections is vital to your emotional equilibrium. You absorb relational friction deeply.",
  scorpio:
    "Moon in Scorpio, your emotional depth is intense, private, and fiercely loyal. You trust deeply once true safety is proven.",
  sagittarius:
    "Moon in Sagittarius, space, exploration, and philosophical perspective keep your spirit buoyant. Restriction depletes you.",
  capricorn:
    "Moon in Capricorn, emotional security is anchored in self-discipline, tangible accomplishments, and reliable boundaries.",
  aquarius:
    "Moon in Aquarius, you need emotional breathing room and rational clarity to understand what you feel.",
  pisces:
    "Moon in Pisces, your empathy is oceanic and boundaryless. You replenish in quiet contemplation, music, and imaginative space.",
};

const ASC_KA: Record<string, string> = {
  aries:
    "სხვების თვალში გაბედული და პირდაპირი ხარ, ადამიანი, რომელიც ყოყმანის ნაცვლად ყოველთვის მოქმედებას ირჩევს.",
  taurus:
    "პირველივე შეხვედრისას მშვიდი, საფუძვლიანი და ცოტათი ჯიუტი ადამიანის შთაბეჭდილებას ტოვებ. სხვებს უჩნდებათ განცდა, რომ შენი ნდობა შეიძლება.",
  gemini:
    "ცოცხალი, მსუბუქი და კომუნიკაბელური ჩანხარ, ის, ვინც ნებისმიერ გარემოში ადვილად იწყებს საუბარს და ყველას ღიმილს გვრის.",
  cancer:
    "გარეგნულად ნაზი და ფრთხილი ჩანხარ, ამიტომ სხვები შენ გვერდით უფრო თამამად იხსნებიან ემოციურად.",
  leo: "ღირსეული და სიცოცხლით სავსე ჩანხარ. შენი შემოსვლა, ხმაურის გარეშეც კი, ოთახის ენერგიას ცვლის.",
  virgo:
    "მართალია, ნელა იხსნები, მაგრამ შენი დაკვირვებულობა და სიფაქიზე მაშინვე შესამჩნევია. მშვიდი გონება შენი მთავარი ნიშანია.",
  libra:
    "ხიბლი, თავაზიანობა, გაწონასწორებული ხასიათი, ასეთ შთაბეჭდილებას ტოვებ პირველივე შეხვედრაზე.",
  scorpio:
    "ღრმა, გამჭოლი მზერა და მშვიდი დაკვირვება, სხვებს აქვთ განცდა, რომ შენ ისინი მანამდე „წაიკითხე“, სანამ ერთმანეთს გაეცნობოდით.",
  sagittarius:
    "ღია, კეთილგანწყობილი და თავგადასავლების მოყვარული ადამიანის შთაბეჭდილებას ტოვებ. სხვები გრძნობენ, რომ შენთან საუბარი თავისუფლებაა.",
  capricorn:
    "სერიოზული, თავშეკავებული და ღირსეული ჩანხარ. სხვებს აქვთ განცდა, რომ შენს სიტყვას ყოველთვის ფასი აქვს.",
  aquarius:
    "პირველივე შეხედვით უცნაური, მაგრამ ამავდროულად მიმზიდველი ხარ. შენნაირები სასიამოვნოდ არღვევენ სტანდარტულ ჩარჩოებს.",
  pisces:
    "ნაზი, ცოტა მისტიური ჩანხარ, ხალხი გრძნობს, რომ შენთან საუბარი სიტყვებზე ღრმად მიდის.",
};

const ASC_EN: Record<string, string> = {
  aries:
    "In the eyes of others, you come across as courageous, decisive, and forthright, someone who leads with action.",
  taurus:
    "At first glance, you project calm presence, grounded patience, and reliability that others intuitively trust.",
  gemini:
    "You appear lively, quick-witted, and naturally engaging, someone who sparks conversations effortlessly.",
  cancer:
    "Your outer presence carries gentle empathy, inviting others to let their emotional guard down with ease.",
  leo: "You project radiant dignity and vibrant charisma. Your entrance naturally warms the room.",
  virgo:
    "Though measured at first, your keen observation and tasteful precision are immediately felt.",
  libra:
    "Grace, charm, and balanced tact define the first impression you make in any setting.",
  scorpio:
    "A perceptive, intense presence, people sense you perceive motives well before words are exchanged.",
  sagittarius:
    "You project openness, optimism, and an adventurous spirit that makes others feel free in your company.",
  capricorn:
    "You project grounded competence, poise, and authority. People respect your words instinctively.",
  aquarius:
    "Unconventional yet magnetic, you refreshingly step outside standard expectations.",
  pisces:
    "You carry a gentle, imaginative aura that invites conversations beyond the superficial surface.",
};

const SIGN_BLURBS_KA: Record<string, string> = {
  aries: "ცეცხლის კარდინალური ნიშანი, დაწყების ენერგია და გაბედული ინიციატივა.",
  taurus:
    "მიწის ფიქსირებული ნიშანი, სიმშვიდე, სიმყარე და ხელშესახები სილამაზე.",
  gemini: "ჰაერის მუტაბელური ნიშანი, ცნობისმოყვარეობა და უწყვეტი კომუნიკაცია.",
  cancer: "წყლის კარდინალური ნიშანი, ემოციური ბირთვი, სახლი და ზრუნვა.",
  leo: "ცეცხლის ფიქსირებული ნიშანი, სიამაყე, გულუხვობა და შემოქმედებითი ენერგია.",
  virgo: "მიწის მუტაბელური ნიშანი, დეტალები, წესრიგი და სხვების დახმარება.",
  libra: "ჰაერის კარდინალური ნიშანი, ბალანსი, ურთიერთობები, ესთეტიკა.",
  scorpio: "წყლის ფიქსირებული ნიშანი, სიღრმე, ტრანსფორმაცია, ერთგულება.",
  sagittarius:
    "ცეცხლის მუტაბელური ნიშანი, სიმართლე, თავისუფლება, ახალი ჰორიზონტები.",
  capricorn:
    "მიწის კარდინალური ნიშანი, დისციპლინა, მოთმინება, გრძელვადიანი მიზნები.",
  aquarius:
    "ჰაერის ფიქსირებული ნიშანი, ინოვაცია, ინდივიდუალიზმი, ორიგინალურობა.",
  pisces: "წყლის მუტაბელური ნიშანი, მგრძნობელობა, წარმოსახვა, მისტიკა.",
};

const SIGN_BLURBS_EN: Record<string, string> = {
  aries: "Cardinal Fire sign, initiative, drive, and courageous beginnings.",
  taurus: "Fixed Earth sign, stability, endurance, and tactile beauty.",
  gemini: "Mutable Air sign, curiosity, communication, and versatile thought.",
  cancer: "Cardinal Water sign, emotional depth, protective care, and home.",
  leo: "Fixed Fire sign, radiant creativity, warmth, and generous expression.",
  virgo: "Mutable Earth sign, precision, helpful craft, and grounded clarity.",
  libra:
    "Cardinal Air sign, harmony, aesthetic grace, and balanced partnerships.",
  scorpio:
    "Fixed Water sign, transformative depth, insight, and loyal devotion.",
  sagittarius:
    "Mutable Fire sign, truth, expansive horizons, and free exploration.",
  capricorn:
    "Cardinal Earth sign, disciplined patience, mastery, and enduring ambition.",
  aquarius:
    "Fixed Air sign, innovative foresight, uniqueness, and community ideals.",
  pisces:
    "Mutable Water sign, intuitive empathy, artistic vision, and mysticism.",
};

/**
 * Get an interpretation paragraph for a single big-three placement in the target locale.
 * Falls back to a generic sign blurb if the specific key is unknown.
 */
export function staticInterpretation(
  kind: BigThreeKind,
  signKey: string,
  locale: UserLocale = "ka",
): string {
  let dict: Record<string, string>;
  let blurbs: Record<string, string>;
  let label: string | undefined;

  const sign = SIGNS.find((s) => s.key === signKey);

  if (locale === "en") {
    dict = kind === "sun" ? SUN_EN : kind === "moon" ? MOON_EN : ASC_EN;
    blurbs = SIGN_BLURBS_EN;
    label = sign?.labelEn;
  } else {
    dict = kind === "sun" ? SUN_KA : kind === "moon" ? MOON_KA : ASC_KA;
    blurbs = SIGN_BLURBS_KA;
    label = sign?.labelKa;
  }

  return (
    dict[signKey] ??
    `${label ?? signKey}, ${
      blurbs[signKey] ??
      (locale === "en"
        ? "Unique energy of your sign."
        : "შენი ნიშნის უნიკალური ენერგია.")
    }`
  );
}

export function signBlurb(signKey: string, locale: UserLocale = "ka"): string {
  if (locale === "en") return SIGN_BLURBS_EN[signKey] ?? "";
  return SIGN_BLURBS_KA[signKey] ?? "";
}
