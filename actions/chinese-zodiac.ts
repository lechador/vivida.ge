"use server";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import { chineseZodiac, type ChineseZodiac } from "@/db/schema";
import {
  generateChineseZodiac,
  generateChineseZodiacHub,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
  CHINESE_ZODIAC_PROMPT_VERSION,
} from "@/lib/openrouter";
import {
  CHINESE_ANIMALS,
  chineseAnimalBySlug,
  yearsForAnimal,
} from "@/lib/seo/chinese-zodiac";
import { claimGeneration, releaseGeneration } from "@/lib/generation-lock";

const ANIMALS_FOR_PROMPT = CHINESE_ANIMALS.map((a) => ({
  slug: a.slug,
  nameKa: a.nameKa,
}));

async function cached(animal: string): Promise<ChineseZodiac | undefined> {
  const [row] = await db
    .select()
    .from(chineseZodiac)
    .where(eq(chineseZodiac.animal, animal))
    .limit(1);
  return row;
}

/** Per-animal Chinese-zodiac content, generated on miss + cached. */
async function ensureChineseZodiacUncached(
  slug: string
): Promise<ChineseZodiac | null> {
  const animal = chineseAnimalBySlug(slug);
  if (!animal) return null;

  const existing = await cached(slug);
  if (existing && existing.promptVersion === CHINESE_ZODIAC_PROMPT_VERSION) {
    return existing;
  }
  if (!isOpenRouterConfigured()) return existing ?? null;

  const lockKey = `chinese-zodiac:${slug}:v${CHINESE_ZODIAC_PROMPT_VERSION}`;
  if (!(await claimGeneration(lockKey))) return existing ?? null;

  try {
  const result = await generateChineseZodiac({
    nameKa: animal.nameKa,
    slug: animal.slug,
    element: animal.element,
    polarity: animal.polarity,
    yearsText: yearsForAnimal(slug).join(", "),
    animals: ANIMALS_FOR_PROMPT,
  }).catch((err) => {
    console.error(`[chinese-zodiac] ${slug} generation failed:`, err);
    return null;
  });
  if (!result) return existing ?? null;

  await db
    .insert(chineseZodiac)
    .values({
      animal: slug,
      pageTitle: result.pageTitle,
      metaDescription: result.metaDescription,
      headline: result.headline,
      intro: result.intro,
      personality: result.personality,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      love: result.love,
      career: result.career,
      compatibility: result.compatibility,
      faq: result.faq,
      promptVersion: CHINESE_ZODIAC_PROMPT_VERSION,
      model: OPENROUTER_MODEL,
    })
    .onConflictDoUpdate({
      target: chineseZodiac.animal,
      set: {
        pageTitle: result.pageTitle,
        metaDescription: result.metaDescription,
        headline: result.headline,
        intro: result.intro,
        personality: result.personality,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        love: result.love,
        career: result.career,
        compatibility: result.compatibility,
        faq: result.faq,
        promptVersion: CHINESE_ZODIAC_PROMPT_VERSION,
        model: OPENROUTER_MODEL,
      },
    });

  return (await cached(slug)) ?? null;
  } finally {
    await releaseGeneration(lockKey).catch(() => {});
  }
}

const cachedChineseZodiac = unstable_cache(
  ensureChineseZodiacUncached,
  ["chinese-zodiac", String(CHINESE_ZODIAC_PROMPT_VERSION)],
  { revalidate: 24 * 60 * 60 },
);

export async function ensureChineseZodiac(
  slug: string,
): Promise<ChineseZodiac | null> {
  return cachedChineseZodiac(slug);
}

/** Hub intro/FAQ, stored in the reserved "_hub" row. */
async function ensureChineseZodiacHubUncached(): Promise<ChineseZodiac | null> {
  const existing = await cached("_hub");
  if (existing && existing.promptVersion === CHINESE_ZODIAC_PROMPT_VERSION) {
    return existing;
  }
  if (!isOpenRouterConfigured()) return existing ?? null;

  const lockKey = `chinese-zodiac:_hub:v${CHINESE_ZODIAC_PROMPT_VERSION}`;
  if (!(await claimGeneration(lockKey))) return existing ?? null;

  try {
  const result = await generateChineseZodiacHub({
    animals: ANIMALS_FOR_PROMPT,
  }).catch((err) => {
    console.error("[chinese-zodiac] hub generation failed:", err);
    return null;
  });
  if (!result) return existing ?? null;

  await db
    .insert(chineseZodiac)
    .values({
      animal: "_hub",
      pageTitle: result.title,
      metaDescription: result.metaDescription,
      intro: result.intro,
      faq: result.faq,
      promptVersion: CHINESE_ZODIAC_PROMPT_VERSION,
      model: OPENROUTER_MODEL,
    })
    .onConflictDoUpdate({
      target: chineseZodiac.animal,
      set: {
        pageTitle: result.title,
        metaDescription: result.metaDescription,
        intro: result.intro,
        faq: result.faq,
        promptVersion: CHINESE_ZODIAC_PROMPT_VERSION,
        model: OPENROUTER_MODEL,
      },
    });

  return (await cached("_hub")) ?? null;
  } finally {
    await releaseGeneration(lockKey).catch(() => {});
  }
}

const cachedChineseZodiacHub = unstable_cache(
  ensureChineseZodiacHubUncached,
  ["chinese-zodiac-hub", String(CHINESE_ZODIAC_PROMPT_VERSION)],
  { revalidate: 24 * 60 * 60 },
);

export async function ensureChineseZodiacHub(): Promise<ChineseZodiac | null> {
  return cachedChineseZodiacHub();
}
