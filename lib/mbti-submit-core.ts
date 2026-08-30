import { after } from "next/server";
import { eq } from "drizzle-orm";

import { ensureChartFor } from "@/actions/chart";
import { db } from "@/db";
import { mbtiTestResults, users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import { sendMbtiResultEmail } from "@/lib/email";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  calculateMbti,
  mbtiArchetypeEn,
  mbtiArchetypeKa,
  type MbtiScores,
} from "@/lib/mbti-questions";
import { getMbtiQuestions } from "@/lib/mbti-questions-db";
import { generateMbtiSynthesis } from "@/lib/mbti-synthesis";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { ENGLISH_SITE_URL, GEORGIAN_SITE_URL } from "@/lib/seo/locales";

/**
 * Claim + generate an Astro-MBTI result for an already-authenticated user.
 *
 * Framework-agnostic per the `lib/<feature>-core.ts` convention: the website
 * Server Action (`actions/submit-mbti.ts`) and the mobile API route both call
 * this, so a phone submission runs the same authoritative re-scoring, the same
 * per-account rate limit, the same Gemini synthesis and the same result email
 * as a browser one. Nothing about the flow is duplicated per client.
 */
export type MbtiSubmission = {
  id: string;
  type: string;
  archetypeNameGe: string;
  scores: MbtiScores;
  aiSynthesisText: string;
};

export async function submitMbtiFor(input: {
  userId: string;
  answers: Record<number, number>;
  locale: UserLocale;
  /** Caller's IP, when it has one — the web action reads it from headers. */
  ip?: string;
}): Promise<MbtiSubmission> {
  const { userId, answers, locale } = input;
  // Matches the website action: only the English locale swaps the deterministic
  // fallback copy; Armenian keeps the Georgian floor text.
  const en = locale === "en";

  // ≤6 generations/hour per account, so an anonymous-turned-signed-in taker
  // can retake but can't burn the AI budget in a loop.
  await enforceAuthRateLimit({
    action: "mbti_submit",
    ip: input.ip ?? "unknown",
    email: userId,
    ipLimit: 20,
    emailLimit: 6,
    windowMs: 60 * 60 * 1000,
  });

  // Server-side scoring is authoritative — never trust a client-sent type.
  // Score against the live question set (axis/pole come from the invariant
  // static structure inside getMbtiQuestions, so wording edits can't skew it).
  const { type, scores } = calculateMbti(answers, await getMbtiQuestions());

  // Positions only; never wait on / trigger chart AI here.
  const chart = await ensureChartFor(userId, { aiUpgrade: "skip" }).catch(
    () => null
  );

  const [u] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const firstName = u?.name?.split(" ")[0] ?? null;

  const synthesis = await generateMbtiSynthesis({
    firstName,
    type,
    scores,
    chart: chart?.data ?? null,
    locale,
  });

  // Graceful floor: if every AI path fails, still save a result using the
  // static archetype + a short deterministic note, so the user isn't blocked.
  const archetypeNameGe =
    synthesis?.archetypeNameGe?.trim() ||
    (en ? mbtiArchetypeEn(type) : mbtiArchetypeKa(type));
  const aiSynthesisText =
    synthesis?.analysisText ??
    (en
      ? `Your personality type is ${type} — ${mbtiArchetypeEn(type)}. A detailed analysis will be added soon.`
      : `შენი ფსიქოლოგიური ტიპია ${type} — ${mbtiArchetypeKa(type)}. დეტალური ანალიზი მალე დაემატება.`);
  const model = `${locale}:${synthesis?.model ?? "fallback"}`;

  const [inserted] = await db
    .insert(mbtiTestResults)
    .values({
      userId,
      mbtiType: type,
      archetypeNameGe,
      scores,
      aiSynthesisText,
      model,
    })
    .returning({ id: mbtiTestResults.id });

  if (!inserted) {
    throw new ApiError(500, "save_failed", "Could not save the MBTI result");
  }

  // Email the result in the background — the "sent to email" requirement.
  const resultId = inserted.id;
  after(async () => {
    try {
      const [target] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (target?.email) {
        await sendMbtiResultEmail({
          userId,
          to: target.email,
          name: firstName,
          resultId,
          mbtiType: type,
          archetypeNameGe: en ? mbtiArchetypeEn(type) : archetypeNameGe,
          locale,
          origin: en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL,
        });
      }
    } catch (err) {
      console.warn("[submitMbtiFor] result email failed:", (err as Error).message);
    }
  });

  return { id: resultId, type, archetypeNameGe, scores, aiSynthesisText };
}
