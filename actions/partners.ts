"use server";

import { and, count, desc, eq, gte, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  partners,
  users,
  type Partner,
  type SynastryInterpretationJson,
} from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { ensureChartFor } from "@/actions/chart";
import { getCurrentPlan } from "@/lib/plan";
import { computeChart, type NatalInput } from "@/lib/astrology";
import { computeSynastry } from "@/lib/synastry";
import {
  generateSynastryInterpretation,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
} from "@/lib/openrouter";
import { PARTNER_CAP_PER_MONTH } from "@/lib/partners-config";
import type { PlanId } from "@/lib/pricing";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const NAME_MAX = 60;

export type CreatePartnerInput = {
  name: string;
  dateOfBirth: string;
  /** HH:MM 24h, or null for unknown (chart computes against 12:00). */
  timeOfBirth: string | null;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type CreatePartnerResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Start of the current calendar month in UTC. */
function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * How many partners the user has *created* this month — counts soft-deleted
 * too so the cap is non-gameable.
 */
export async function partnerCreationsThisMonth(userId: string): Promise<number> {
  const since = startOfCurrentMonth();
  const [row] = await db
    .select({ n: count() })
    .from(partners)
    .where(and(eq(partners.userId, userId), gte(partners.createdAt, since)));
  return row?.n ?? 0;
}

export async function listPartners(userId: string): Promise<Partner[]> {
  return await db
    .select()
    .from(partners)
    .where(and(eq(partners.userId, userId), isNull(partners.deletedAt)))
    .orderBy(desc(partners.createdAt));
}

export async function getPartnerForViewer(
  partnerId: string,
  userId: string
): Promise<Partner | null> {
  const [row] = await db
    .select()
    .from(partners)
    .where(
      and(
        eq(partners.id, partnerId),
        eq(partners.userId, userId),
        isNull(partners.deletedAt)
      )
    )
    .limit(1);
  return row ?? null;
}

/**
 * Validate input, compute the partner's natal chart, enforce the monthly
 * cap, and insert. Doesn't trigger AI generation here — that happens
 * lazily on first /synastry/[id] view (so a user adding 10 partners in a
 * row doesn't fire 10 Gemini calls before they ever look at the result).
 */
export async function createPartner(
  input: CreatePartnerInput
): Promise<CreatePartnerResult> {
  const user = await requireUser();
  const plan = await getCurrentPlan(user.id);

  // Validation
  const name = input.name.trim();
  if (!name) return { ok: false, error: "ჩაწერე პარტნიორის სახელი" };
  if (name.length > NAME_MAX) {
    return { ok: false, error: `სახელი მაქს. ${NAME_MAX} სიმბოლო` };
  }
  if (!DATE_RE.test(input.dateOfBirth)) {
    return { ok: false, error: "დაბადების თარიღი არასწორია" };
  }
  if (input.timeOfBirth !== null && !TIME_RE.test(input.timeOfBirth)) {
    return { ok: false, error: "დაბადების დრო არასწორია" };
  }
  if (!input.cityName.trim()) {
    return { ok: false, error: "აირჩიე ქალაქი" };
  }
  if (
    Number.isNaN(input.latitude) ||
    Number.isNaN(input.longitude) ||
    Math.abs(input.latitude) > 90 ||
    Math.abs(input.longitude) > 180
  ) {
    return { ok: false, error: "კოორდინატები არასწორია" };
  }
  if (!input.timezone.trim()) {
    return { ok: false, error: "მიუთითე დროის სარტყელი" };
  }
  const year = Number(input.dateOfBirth.slice(0, 4));
  const currentYear = new Date().getUTCFullYear();
  if (year < 1900 || year > currentYear) {
    return { ok: false, error: "დაბადების წელი უნდა იყოს 1900-დან დღემდე" };
  }

  // Cap enforcement — atomic-enough for a single user; collisions on the
  // exact same millisecond are acceptable since this is per-user not global.
  const used = await partnerCreationsThisMonth(user.id);
  const cap = PARTNER_CAP_PER_MONTH[plan];
  if (used >= cap) {
    if (plan === "free") {
      return {
        ok: false,
        error: `უფასო ვერსიაში 1 პარტნიორი ამ თვეში გამოიყენე. Pro ვერსიაში თვეში ${PARTNER_CAP_PER_MONTH.pro} პარტნიორია.`,
      };
    }
    return {
      ok: false,
      error: `ამ თვეში ${cap} პარტნიორი უკვე დაამატე. შემდეგი თვიდან ისევ შეგიძლია.`,
    };
  }

  // Compute the partner's chart (same pipeline as the user's own).
  const natalInput: NatalInput = {
    date: input.dateOfBirth,
    time: input.timeOfBirth,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
  };
  const chartResult = await computeChart(natalInput);

  const timeForDb = input.timeOfBirth ? `${input.timeOfBirth}:00` : null;

  const [inserted] = await db
    .insert(partners)
    .values({
      userId: user.id,
      name,
      dateOfBirth: input.dateOfBirth,
      timeOfBirth: timeForDb,
      latitude: input.latitude,
      longitude: input.longitude,
      cityName: input.cityName,
      timezone: input.timezone,
      chart: chartResult.data,
      inputHash: chartResult.inputHash,
    })
    .returning({ id: partners.id });

  if (!inserted) return { ok: false, error: "შენახვა ვერ მოხერხდა" };

  revalidatePath("/synastry");
  return { ok: true, id: inserted.id };
}

/**
 * Soft delete — sets deletedAt. The row stays in the table so monthly
 * creation counts remain accurate. Idempotent.
 */
export async function softDeletePartner(partnerId: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  await db
    .update(partners)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(partners.id, partnerId),
        eq(partners.userId, user.id),
        isNull(partners.deletedAt)
      )
    );
  revalidatePath("/synastry");
  return { ok: true };
}

/**
 * Lazily generates + caches the AI synastry interpretation for a partner.
 * Cache invalidates when the viewer's natal chart changes (we re-detect
 * via inputHash) or when SYNASTRY_PROMPT_VERSION is bumped.
 *
 * Errors fail-soft — we return the existing cached row (if any) or null,
 * never throw, since synastry view should still work without AI.
 */
export async function ensureSynastryInterpretation(
  partner: Partner,
  plan: PlanId
): Promise<Partner> {
  if (!isOpenRouterConfigured()) return partner;

  const viewerChart = await ensureChartFor(partner.userId, plan);
  if (!viewerChart) return partner;

  // Cache hit?
  if (
    partner.aiInterpretation &&
    partner.aiViewerHash === viewerChart.inputHash
  ) {
    return partner;
  }

  // Run the deterministic synastry first so we can feed scores + top
  // aspects into the prompt.
  const synastry = computeSynastry(viewerChart.data, partner.chart);

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, partner.userId))
    .limit(1);
  const viewerFirstName = user?.name?.split(" ")[0] ?? null;

  let interp: SynastryInterpretationJson | null = null;
  try {
    interp = await generateSynastryInterpretation({
      partnerName: partner.name,
      viewerFirstName,
      viewerChart: viewerChart.data,
      partnerChart: partner.chart,
      scores: synastry.scores as unknown as Record<string, number>,
      overall: synastry.overall,
      topAspects: synastry.topAspects.slice(0, 8).map((a) => ({
        a: a.a,
        b: a.b,
        kind: a.kind,
        orb: a.orb,
      })),
    });
  } catch (err) {
    console.warn(
      "[partners] AI synastry generation failed:",
      (err as Error).message
    );
    return partner;
  }

  if (!interp) return partner;

  const [updated] = await db
    .update(partners)
    .set({
      aiInterpretation: interp,
      aiViewerHash: viewerChart.inputHash,
      aiModel: OPENROUTER_MODEL,
      aiGeneratedAt: new Date(),
    })
    .where(eq(partners.id, partner.id))
    .returning();

  return updated ?? partner;
}
