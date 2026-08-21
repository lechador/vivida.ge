"use server";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import { signRankings, type SignRanking } from "@/db/schema";
import {
  generateSignRanking,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
  RANKING_PROMPT_VERSION,
} from "@/lib/openrouter";
import { ALL_SLUGS, signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { rankingTopicBySlug } from "@/lib/seo/rankings";
import { claimGeneration, releaseGeneration } from "@/lib/generation-lock";

/**
 * Resolve a cached sign-ranking listicle, generating + upserting on miss.
 * Keyed by topic slug; `promptVersion` invalidates after a prompt change.
 * Returns null when the topic is unknown or OpenRouter isn't configured
 * (callers render a graceful fallback instead of erroring the page).
 */
async function ensureSignRankingUncached(
  topicSlug: string
): Promise<SignRanking | null> {
  const topic = rankingTopicBySlug(topicSlug);
  if (!topic) return null;

  const [existing] = await db
    .select()
    .from(signRankings)
    .where(eq(signRankings.topic, topicSlug))
    .limit(1);
  if (existing && existing.promptVersion === RANKING_PROMPT_VERSION) {
    return existing;
  }

  if (!isOpenRouterConfigured()) return existing ?? null;

  const lockKey = `sign-ranking:${topicSlug}:v${RANKING_PROMPT_VERSION}`;
  if (!(await claimGeneration(lockKey))) return existing ?? null;

  try {
  const signs = ALL_SLUGS.map((slug) => ({
    slug,
    labelKa: signMetaBySlug(slug)?.labelKa ?? slug,
  }));

  const result = await generateSignRanking({
    titleKa: topic.titleKa,
    traitKa: topic.traitKa,
    signs,
  }).catch((err) => {
    console.error(`[sign-ranking] ${topicSlug} generation failed:`, err);
    return null;
  });
  if (!result) return existing ?? null;

  await db
    .insert(signRankings)
    .values({
      topic: topicSlug,
      headline: result.headline,
      intro: result.intro,
      items: result.items,
      faq: result.faq,
      promptVersion: RANKING_PROMPT_VERSION,
      model: OPENROUTER_MODEL,
      language: "ka",
    })
    .onConflictDoUpdate({
      target: signRankings.topic,
      set: {
        headline: result.headline,
        intro: result.intro,
        items: result.items,
        faq: result.faq,
        promptVersion: RANKING_PROMPT_VERSION,
        model: OPENROUTER_MODEL,
      },
    });

  const [refreshed] = await db
    .select()
    .from(signRankings)
    .where(eq(signRankings.topic, topicSlug))
    .limit(1);
  return refreshed ?? null;
  } finally {
    await releaseGeneration(lockKey).catch(() => {});
  }
}

const cachedSignRanking = unstable_cache(
  ensureSignRankingUncached,
  ["sign-ranking", String(RANKING_PROMPT_VERSION)],
  { revalidate: 7 * 24 * 60 * 60 },
);

export async function ensureSignRanking(
  topicSlug: string,
): Promise<SignRanking | null> {
  return cachedSignRanking(topicSlug);
}
