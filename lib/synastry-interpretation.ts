import type { SynastryAspect, SynastryCategory } from "@/lib/synastry";
import {
  ASPECT_GLYPH,
  ASPECT_LABEL_EN,
  BODY_LABEL_EN,
  categoryNarrativeEn,
  describeAspectEn,
  overallNarrativeEn,
} from "@/lib/synastry-en";
import { BODIES } from "@/lib/zodiac";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ASPECT_LABEL_KA: Record<string, string> = {
  conjunction: "კონიუნქცია",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრინი",
  opposition: "ოპოზიცია",
};

export function aspectGlyph(kind: string): string {
  return ASPECT_GLYPH[kind] ?? "·";
}

export function aspectLabel(kind: string): string {
  return ASPECT_LABEL_KA[kind] ?? kind;
}

export function bodyLabel(body: string): string {
  return BODIES[body]?.labelKa ?? body;
}

export function aspectValence(
  kind: string,
): "harmonious" | "tense" | "neutral" {
  if (kind === "trine" || kind === "sextile") return "harmonious";
  if (kind === "square" || kind === "opposition") return "tense";
  return "neutral";
}

export function splitByValence(aspects: SynastryAspect[]): {
  strengths: SynastryAspect[];
  growth: SynastryAspect[];
} {
  return {
    strengths: aspects.filter((a) => aspectValence(a.kind) !== "tense"),
    growth: aspects.filter((a) => aspectValence(a.kind) === "tense"),
  };
}

export function synastryAspectKey(a: string, b: string, kind: string): string {
  return `aspect:${a}:${b}:${kind}`;
}

export function synastryOverlayKey(body: string, house: number): string {
  return `overlay:${body}:${house}`;
}

export function overallNarrative(
  score: number,
  locale: UserLocale = "ka",
): string {
  if (locale !== "ka") return overallNarrativeEn(score);
  return `თქვენი რუკების საერთო თავსებადობა ${score}%-ია — ეს ქმნის ბუნებრივ მიზიდულობასა და საინტერესო ემოციურ დიალოგს.`;
}

export function narrateCategory(
  category: SynastryCategory,
  score: number,
  locale: UserLocale = "ka",
): string {
  if (locale !== "ka") return categoryNarrativeEn(category, score);
  return `ამ სფეროში თავსებადობა ${score}%-ია, რაც მიუთითებს ცოცხალ ენერგიასა და ურთიერთგაგების კარგ პოტენციალზე.`;
}

export function describeAspect(
  aspect: SynastryAspect,
  locale: UserLocale = "ka",
): string {
  if (locale !== "ka") return describeAspectEn(aspect);
  return `${bodyLabel(aspect.a)}-ის და ${bodyLabel(aspect.b)}-ის ${aspectLabel(aspect.kind)} ქმნის მნიშვნელოვან ემოციურ და პიროვნულ რეზონანსს თქვენს შორის.`;
}

export function aspectBreakdown(
  aspect: SynastryAspect,
  locale: UserLocale = "ka",
): {
  title: string;
  aspectMeaning: string;
  bodyADescription: string;
  bodyBDescription: string;
  positive: string;
  negative: string;
  takeaway: string;
  tightnessNote: string;
} {
  const en = locale !== "ka";
  const aLabel = en ? (BODY_LABEL_EN[aspect.a] ?? aspect.a) : bodyLabel(aspect.a);
  const bLabel = en ? (BODY_LABEL_EN[aspect.b] ?? aspect.b) : bodyLabel(aspect.b);
  const kLabel = en ? (ASPECT_LABEL_EN[aspect.kind] ?? aspect.kind) : aspectLabel(aspect.kind);
  return {
    title: `${aLabel} ${aspectGlyph(aspect.kind)} ${bLabel}`,
    aspectMeaning: en
      ? `${kLabel} connects ${aLabel} and ${bLabel} with an orb of ${aspect.orb.toFixed(1)}°.`
      : `${kLabel} აკავშირებს ${aLabel}-სა და ${bLabel}-ს (${aspect.orb.toFixed(1)}° ორბით).`,
    bodyADescription: en
      ? (BODIES[aspect.a]?.meaningEn ?? "Core personal energy")
      : (BODIES[aspect.a]?.meaningKa ?? "პიროვნული ენერგია"),
    bodyBDescription: en
      ? (BODIES[aspect.b]?.meaningEn ?? "Partner's planetary theme")
      : (BODIES[aspect.b]?.meaningKa ?? "პარტნიორის პლანეტარული თემა"),
    positive: en
      ? "Encourages honest recognition, mutual curiosity, and emotional responsiveness."
      : "ხელს უწყობს გულწრფელ ინტერესს, ემოციურ გამოხმაურებასა და სიახლოვეს.",
    negative: en
      ? "Can feel intense if expectations go unspoken; clear pacing helps."
      : "შეიძლება გამოიწვიოს გადაჭარბებული მოლოდინი, თუ სურვილები ღიად არ ითქმება.",
    takeaway: en
      ? "Give each other room to express this energy openly and listen without rushing."
      : "მიეცით ერთმანეთს სივრცე ამ ენერგიის ბუნებრივად გამოსახატად.",
    tightnessNote: en
      ? `Tightness: ${aspect.orb.toFixed(2)}° orb.`
      : `სიზუსტე: ${aspect.orb.toFixed(2)}° ორბი.`,
  };
}
