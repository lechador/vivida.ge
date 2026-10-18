import { MBTI_TYPES, type MbtiType } from "@/lib/mbti-library";

export type MbtiGroupKey = "analysts" | "diplomats" | "sentinels" | "explorers";

export type MbtiGroupInfo = {
  key: MbtiGroupKey;
  labelKa: string;
  labelEn: string;
};

export const MBTI_GROUP: Record<string, MbtiGroupInfo> = {
  INTJ: { key: "analysts", labelKa: "ანალიტიკოსები", labelEn: "Analysts" },
  INTP: { key: "analysts", labelKa: "ანალიტიკოსები", labelEn: "Analysts" },
  ENTJ: { key: "analysts", labelKa: "ანალიტიკოსები", labelEn: "Analysts" },
  ENTP: { key: "analysts", labelKa: "ანალიტიკოსები", labelEn: "Analysts" },
  INFJ: { key: "diplomats", labelKa: "დიპლომატები", labelEn: "Diplomats" },
  INFP: { key: "diplomats", labelKa: "დიპლომატები", labelEn: "Diplomats" },
  ENFJ: { key: "diplomats", labelKa: "დიპლომატები", labelEn: "Diplomats" },
  ENFP: { key: "diplomats", labelKa: "დიპლომატები", labelEn: "Diplomats" },
  ISTJ: { key: "sentinels", labelKa: "მცველები", labelEn: "Sentinels" },
  ISFJ: { key: "sentinels", labelKa: "მცველები", labelEn: "Sentinels" },
  ESTJ: { key: "sentinels", labelKa: "მცველები", labelEn: "Sentinels" },
  ESFJ: { key: "sentinels", labelKa: "მცველები", labelEn: "Sentinels" },
  ISTP: { key: "explorers", labelKa: "მკვლევრები", labelEn: "Explorers" },
  ISFP: { key: "explorers", labelKa: "მკვლევრები", labelEn: "Explorers" },
  ESTP: { key: "explorers", labelKa: "მკვლევრები", labelEn: "Explorers" },
  ESFP: { key: "explorers", labelKa: "მკვლევრები", labelEn: "Explorers" },
};

const ARCHETYPE_META: Record<
  string,
  { archetypeKa: string; archetypeEn: string; taglineKa: string; taglineEn: string }
> = {
  INTJ: {
    archetypeKa: "არქიტექტორი",
    archetypeEn: "The Architect",
    taglineKa: "სტრატეგიული, დამოუკიდებელი და შორსმჭვრეტელი მოაზროვნე, რომელსაც ყველაფრისთვის გეგმა აქვს.",
    taglineEn: "Strategic, independent thinkers with a long-range plan for complex systems.",
  },
  INTP: {
    archetypeKa: "ლოგიკოსი",
    archetypeEn: "The Logician",
    taglineKa: "ცნობისმოყვარე ნოვატორი, რომელიც მუდმივად ეძებს სამყაროს მუშაობის ფარულ კანონზომიერებებს.",
    taglineEn: "Inventive, analytical minds drawn to patterns, ideas, and underlying principles.",
  },
  ENTJ: {
    archetypeKa: "მეთაური",
    archetypeEn: "The Commander",
    taglineKa: "გაბედული, მიზანდასახული ლიდერი, რომელიც სირთულეებშიც პოულობს ან თავად ქმნის გზას.",
    taglineEn: "Decisive, goal-focused organizers who turn ambitious visions into structured action.",
  },
  ENTP: {
    archetypeKa: "პოლემისტი",
    archetypeEn: "The Debater",
    taglineKa: "გონებამახვილი და მოუსვენარი მოაზროვნე, რომელსაც უყვარს იდეების გამოცდა.",
    taglineEn: "Quick-thinking, curious innovators energized by intellectual challenge and new possibilities.",
  },
  INFJ: {
    archetypeKa: "ადვოკატი",
    archetypeEn: "The Advocate",
    taglineKa: "მშვიდი, ღრმა და პრინციპული იდეალისტი, რომელიც ადამიანებში პოტენციალს ხედავს.",
    taglineEn: "Insightful, values-driven idealists who seek meaning and deep human connection.",
  },
  INFP: {
    archetypeKa: "მედიატორი",
    archetypeEn: "The Mediator",
    taglineKa: "ემპათიური, შემოქმედებითი და ღირებულებების ერთგული ადამიანი ღრმა შინაგანი სამყაროთი.",
    taglineEn: "Empathetic, imaginative personalities guided by inner values and authenticity.",
  },
  ENFJ: {
    archetypeKa: "პროტაგონისტი",
    archetypeEn: "The Protagonist",
    taglineKa: "ქარიზმატული და შთამაგონებელი ლიდერი, რომელიც აერთიანებს და აძლიერებს გარშემომყოფებს.",
    taglineEn: "Warm, inspiring communicators who help people grow and work together.",
  },
  ENFP: {
    archetypeKa: "კამპანიის ავტორი",
    archetypeEn: "The Campaigner",
    taglineKa: "ენთუზიაზმით სავსე, თავისუფალი და კომუნიკაბელური სული, რომელიც ყველგან შესაძლებლობას ხედავს.",
    taglineEn: "Enthusiastic, creative connectors who bring warmth and curiosity to every idea.",
  },
  ISTJ: {
    archetypeKa: "ლოგისტიკოსი",
    archetypeEn: "The Logistician",
    taglineKa: "პრაქტიკული, ფაქტებზე დაფუძნებული და უაღრესად სანდო ადამიანი.",
    taglineEn: "Practical, dependable organizers who value accuracy, duty, and follow-through.",
  },
  ISFJ: {
    archetypeKa: "დამცველი",
    archetypeEn: "The Defender",
    taglineKa: "ერთგული, თბილი და ყურადღებიანი მზრუნველი, რომელიც სიმშვიდესა და სტაბილურობას ქმნის.",
    taglineEn: "Supportive, observant caretakers who remember details and protect what matters.",
  },
  ESTJ: {
    archetypeKa: "აღმასრულებელი",
    archetypeEn: "The Executive",
    taglineKa: "ძლიერი ორგანიზატორი, რომელიც აფასებს წესრიგს, სიცხადესა და რეალურ შედეგს.",
    taglineEn: "Clear-headed, structured leaders who coordinate people and projects efficiently.",
  },
  ESFJ: {
    archetypeKa: "კონსული",
    archetypeEn: "The Consul",
    taglineKa: "გულისხმიერი, სოციალური და ყურადღებიანი ადამიანი, რომელიც გუნდში ჰარმონიას ქმნის.",
    taglineEn: "Caring, community-minded connectors who notice needs and build belonging.",
  },
  ISTP: {
    archetypeKa: "ვირტუოზი",
    archetypeEn: "The Virtuoso",
    taglineKa: "გაბედული და პრაქტიკული ექსპერიმენტატორი, რომელიც რთულ მექანიზმებსა და სიტუაციებს მარტივად უღებს ალღოს.",
    taglineEn: "Hands-on, adaptable problem-solvers who stay calm when action is needed.",
  },
  ISFP: {
    archetypeKa: "ავანტიურისტი",
    archetypeEn: "The Adventurer",
    taglineKa: "მოქნილი და მგრძნობიარე ხელოვანი, რომელიც აწმყოთი და სილამაზით ცხოვრობს.",
    taglineEn: "Flexible, expressive explorers who value freedom, aesthetics, and lived experience.",
  },
  ESTP: {
    archetypeKa: "მეწარმე",
    archetypeEn: "The Entrepreneur",
    taglineKa: "ენერგიული, გამჭრიახი და მოქმედებაზე ორიენტირებული ადამიანი, რომელსაც უყვარს დინამიკა.",
    taglineEn: "Energetic, perceptive doers who read the room quickly and thrive in motion.",
  },
  ESFP: {
    archetypeKa: "გამრთობი",
    archetypeEn: "The Entertainer",
    taglineKa: "სპონტანური, ხალისიანი და გადამდები ენერგიის მქონე ადამიანი.",
    taglineEn: "Spontaneous, warm-hearted performers who bring joy and immediacy to life.",
  },
};

export const ALL_MBTI_SLUGS: string[] = (MBTI_TYPES as readonly string[]).map((t) =>
  t.toLowerCase(),
);

export function mbtiCodeFromSlug(slug: string): MbtiType | null {
  const upper = slug.trim().toUpperCase();
  if ((MBTI_TYPES as readonly string[]).includes(upper)) {
    return upper as MbtiType;
  }
  return null;
}

export function buildMbtiSeo(code: string) {
  const upper = code.toUpperCase();
  const slug = upper.toLowerCase();
  const meta = ARCHETYPE_META[upper] ?? ARCHETYPE_META.INFJ;
  const group = MBTI_GROUP[upper] ?? MBTI_GROUP.INFJ;
  return {
    code: upper,
    slug,
    archetypeKa: meta.archetypeKa,
    taglineKa: meta.taglineKa,
    group,
    pageTitle: `${upper} (${meta.archetypeKa}) — პიროვნების ტიპი ქართულად`,
    metaDescription: `${upper} პიროვნების ტიპი (${meta.archetypeKa}): ხასიათი, ძლიერი და სუსტი მხარეები, სიყვარული, მეგობრობა და კარიერა. ${meta.taglineKa}`,
    queries: [
      upper,
      `${upper} ქართულად`,
      `${upper} პიროვნების ტიპი`,
      meta.archetypeKa,
      "16 პიროვნების ტიპი",
      "MBTI ქართულად",
    ],
    faq: [
      {
        q: `რას ნიშნავს ${upper} პიროვნების ტიპი?`,
        a: `${upper} (${meta.archetypeKa}) მიეკუთვნება „${group.labelKa}“ ჯგუფს. ${meta.taglineKa}`,
      },
      {
        q: `როგორ გავიგო, ვარ თუ არა ${upper}?`,
        a: "გაიარე Vivida-ს უფასო 60-კითხვიანი პიროვნების ტესტი, რომელიც ზომავს ოთხივე განზომილებას და გაჩვენებს ზუსტ პროცენტულ თანაფარდობას.",
      },
    ],
  };
}

export function buildMbtiSeoEn(code: string) {
  const upper = code.toUpperCase();
  const slug = upper.toLowerCase();
  const meta = ARCHETYPE_META[upper] ?? ARCHETYPE_META.INFJ;
  const group = MBTI_GROUP[upper] ?? MBTI_GROUP.INFJ;
  return {
    code: upper,
    slug,
    archetype: meta.archetypeEn,
    tagline: meta.taglineEn,
    group,
    pageTitle: `${upper} Personality Type (${meta.archetypeEn}): Traits, Relationships & Career`,
    metaDescription: `${upper} (${meta.archetypeEn}) personality profile: core preferences, strengths, blind spots, relationships, and career paths. ${meta.taglineEn}`,
    queries: [
      `${upper} personality`,
      `${upper} type`,
      meta.archetypeEn.toLowerCase(),
      `${upper} relationships`,
      `${upper} career`,
    ],
    faq: [
      {
        q: `What does the ${upper} personality type mean?`,
        a: `${upper} (${meta.archetypeEn}) is part of the ${group.labelEn} group. ${meta.taglineEn}`,
      },
      {
        q: `How do I know if I am an ${upper}?`,
        a: "Take Vivida's free 60-question personality test to see your preferences across all four dimensions.",
      },
    ],
  };
}
