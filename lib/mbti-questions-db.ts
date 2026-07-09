import "server-only";

import { asc, eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { mbtiQuestions } from "@/db/schema";
import {
  MBTI_QUESTIONS,
  AXIS_POLES,
  type MbtiAxis,
  type MbtiQuestion,
} from "@/lib/mbti-questions";

/**
 * The live quiz questions, read from the admin-editable `mbti_question` table
 * and ordered for presentation. Falls back to the canonical static list when
 * the table is empty (not yet seeded) or on any DB error, so the test never
 * breaks. `cache()` dedupes the read within a single request (the test and
 * claim pages both need it).
 *
 * Only the WORDING is DB-driven; axis/pole are validated against the static
 * structure so a stray value can never corrupt scoring — an unknown axis falls
 * back to the static question with that id.
 */
export const getMbtiQuestions = cache(async (): Promise<MbtiQuestion[]> => {
  try {
    const rows = await db
      .select()
      .from(mbtiQuestions)
      .where(eq(mbtiQuestions.active, true))
      .orderBy(asc(mbtiQuestions.orderIndex));

    if (rows.length === 0) return MBTI_QUESTIONS;

    const staticById = new Map(MBTI_QUESTIONS.map((q) => [q.id, q]));
    return rows.map((r) => {
      const axis = (r.axis as MbtiAxis) in AXIS_POLES ? (r.axis as MbtiAxis) : null;
      const base = staticById.get(r.id);
      // Trust the static structure for axis/pole; take only the wording from DB.
      if (!axis || !base) {
        return base ?? { id: r.id, axis: "EI", pole: "E", textKa: r.textKa };
      }
      return { id: r.id, axis: base.axis, pole: base.pole, textKa: r.textKa };
    });
  } catch (err) {
    console.warn("[mbti-questions-db] read failed, using static:", (err as Error).message);
    return MBTI_QUESTIONS;
  }
});
