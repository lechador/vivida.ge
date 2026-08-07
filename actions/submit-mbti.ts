"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { mbtiTestResults, users, profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { ensureChartFor } from "@/actions/chart";
import { calculateMbti, mbtiArchetypeKa } from "@/lib/mbti-questions";
import { getMbtiQuestions } from "@/lib/mbti-questions-db";
import { generateMbtiSynthesis } from "@/lib/mbti-synthesis";
import { sendMbtiResultEmail } from "@/lib/email";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/api/errors";

export type SubmitMbtiResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Best-effort client IP from request headers (for rate limiting). */
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Claim + generate an Astro-MBTI result. Auth-gated on purpose: the quiz is
 * public and the 4-letter type is computed client-side for the free teaser,
 * but the expensive Gemini synthesis only runs for a signed-in user (so an
 * anonymous visitor can't burn AI budget), and it's rate-limited on top.
 *
 * Steps: recompute the type server-side (authoritative) → fetch the natal
 * chart (may be null pre-onboarding) → synthesize (Google in dev, OpenRouter
 * in prod) → persist → email the result in the background → return the id.
 */
export async function submitMbti(
  answers: Record<number, number>
): Promise<SubmitMbtiResult> {
  const user = await requireUser();

  try {
    await enforceAuthRateLimit({
      action: "mbti_submit",
      ip: await clientIp(),
      email: user.id, // per-user cap keyed on the stable id
      ipLimit: 20,
      emailLimit: 6, // ≤6 generations/hour per account
      windowMs: 60 * 60 * 1000,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return { ok: false, error: "ბევრი მცდელობა იყო. სცადე ცოტა ხანში." };
    }
    throw err;
  }

  // Server-side scoring is authoritative — never trust a client-sent type.
  // Score against the live question set (axis/pole come from the invariant
  // static structure inside getMbtiQuestions, so wording edits can't skew it).
  const { type, scores } = calculateMbti(answers, await getMbtiQuestions());

  // Positions only; never wait on / trigger chart AI here.
  const chart = await ensureChartFor(user.id, { aiUpgrade: "skip" }).catch(
    () => null
  );

  const [u] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const firstName = u?.name?.split(" ")[0] ?? null;

  const synthesis = await generateMbtiSynthesis({
    firstName,
    type,
    scores,
    chart: chart?.data ?? null,
  });

  // Graceful floor: if every AI path fails, still save a result using the
  // static archetype + a short deterministic note, so the user isn't blocked.
  const archetypeNameGe =
    synthesis?.archetypeNameGe?.trim() || mbtiArchetypeKa(type);
  const aiSynthesisText =
    synthesis?.analysisText ??
    `შენი ფსიქოლოგიური ტიპია ${type} — ${mbtiArchetypeKa(type)}. ` +
      "დეტალური ანალიზი მალე დაემატება.";
  const model = synthesis?.model ?? "fallback";

  const [inserted] = await db
    .insert(mbtiTestResults)
    .values({
      userId: user.id,
      mbtiType: type,
      archetypeNameGe,
      scores,
      aiSynthesisText,
      model,
    })
    .returning({ id: mbtiTestResults.id });

  if (!inserted) return { ok: false, error: "შენახვა ვერ მოხერხდა. სცადე თავიდან." };

  // Email the result in the background — the "sent to email" requirement.
  const resultId = inserted.id;
  after(async () => {
    try {
      const [target] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
      if (target?.email) {
        await sendMbtiResultEmail({
          userId: user.id,
          to: target.email,
          name: firstName,
          resultId,
          mbtiType: type,
          archetypeNameGe,
        });
      }
    } catch (err) {
      console.warn("[submitMbti] result email failed:", (err as Error).message);
    }
  });

  return { ok: true, id: resultId };
}

/** Whether the current user has completed onboarding (needed for the astro
 *  layer). Used by the claim UI to nudge no-chart users toward onboarding. */
export async function viewerHasBirthData(): Promise<boolean> {
  const user = await requireUser();
  const [p] = await db
    .select({ dob: profiles.dateOfBirth })
    .from(profiles)
    .where(and(eq(profiles.userId, user.id)))
    .limit(1);
  return !!p?.dob;
}
