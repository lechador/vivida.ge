import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { partners } from "@/db/schema";
import { ensureChartFor } from "@/actions/chart";
import { CREDIT_COST, getBalance, isUnlocked } from "@/lib/credits";
import { unlockForUser } from "@/lib/credits-unlock-core";
import { searchPlaces } from "@/lib/geocoding";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { isPremiumUser } from "@/lib/premium";
import {
  createPartnerCore,
  ensureSynastryInterpretation,
  getPartnerForViewer,
  type CreatePartnerInput,
} from "@/lib/partners-core";
import {
  encodeMarker,
  synastryKey,
  type SynastryChatResult,
  type SynastryDirective,
  type SynastryProposal,
  type SynastryProposalStatus,
} from "@/lib/ask-synastry-pure";
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  computeSynastry,
  overallVerdict,
} from "@/lib/synastry";
import { CATEGORY_LABEL_EN, overallVerdictEn } from "@/lib/synastry-en";
import { aspectGlyph, bodyLabel } from "@/lib/synastry-interpretation";

/**
 * Server side of "create a synastry from the AI chat". The model only
 * proposes; credits move exclusively in `confirmSynastry`, which the user
 * triggers with an explicit tap and which charges exactly like the website
 * (same ledger reason, same price, PRO free, idempotent per partner).
 */

type ExistingPartner = { id: string };

async function findExistingPartner(
  userId: string,
  input: Pick<CreatePartnerInput, "name" | "dateOfBirth" | "timeOfBirth">,
): Promise<ExistingPartner | null> {
  const [row] = await db
    .select({ id: partners.id })
    .from(partners)
    .where(
      and(
        eq(partners.userId, userId),
        eq(partners.name, input.name.trim()),
        eq(partners.dateOfBirth, input.dateOfBirth),
        input.timeOfBirth
          ? eq(partners.timeOfBirth, `${input.timeOfBirth}:00`)
          : isNull(partners.timeOfBirth),
        isNull(partners.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function entitlement(
  userId: string,
  existing: ExistingPartner | null,
): Promise<{ status: SynastryProposalStatus; balance: number }> {
  const [premium, balance] = await Promise.all([
    isPremiumUser(userId),
    getBalance(userId),
  ]);
  if (premium) return { status: "pro", balance };
  if (existing && (await isUnlocked(userId, existing.id, "spend_synastry"))) {
    return { status: "already", balance };
  }
  return {
    status: balance >= CREDIT_COST.synastry ? "pay" : "insufficient",
    balance,
  };
}

/**
 * Resolve the directive's city and the user's current entitlement into the
 * card the chat shows. Returns null when the place cannot be resolved.
 */
export async function buildSynastryProposal(
  userId: string,
  d: SynastryDirective,
): Promise<SynastryProposal | null> {
  let place;
  try {
    [place] = await searchPlaces(d.city, { count: 1 });
  } catch {
    return null;
  }
  if (!place) return null;
  const existing = await findExistingPartner(userId, {
    name: d.name,
    dateOfBirth: d.date,
    timeOfBirth: d.time,
  });
  const { status, balance } = await entitlement(userId, existing);
  return {
    key: synastryKey(d.name, d.date, d.time),
    name: d.name,
    date: d.date,
    time: d.time,
    cityName: place.displayName,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
    status,
    cost: CREDIT_COST.synastry,
    balance,
  };
}

export type ConfirmSynastryResult =
  | { ok: true; content: string; result: SynastryChatResult }
  | {
      ok: false;
      error: "needs_credits" | "no_chart" | "invalid" | "unavailable";
      message?: string;
      cost?: number;
      balance?: number;
    };

export async function confirmSynastry(
  userId: string,
  input: CreatePartnerInput,
  locale: UserLocale,
): Promise<ConfirmSynastryResult> {
  const en = locale === "en";
  const viewerChart = await ensureChartFor(userId);
  if (!viewerChart) return { ok: false, error: "no_chart" };

  // Check entitlement BEFORE creating anything, so a user who cannot pay
  // never accumulates partner rows against the monthly cap.
  let existing = await findExistingPartner(userId, input);
  const gate = await entitlement(userId, existing);
  if (gate.status === "insufficient") {
    return {
      ok: false,
      error: "needs_credits",
      cost: CREDIT_COST.synastry,
      balance: gate.balance,
    };
  }

  if (!existing) {
    const created = await createPartnerCore(userId, input, locale);
    if (!created.ok) {
      return { ok: false, error: "invalid", message: created.error };
    }
    existing = { id: created.id };
  }

  const unlock = await unlockForUser(userId, "synastry", existing.id);
  if (!unlock.ok) {
    if (unlock.error === "insufficient") {
      return {
        ok: false,
        error: "needs_credits",
        cost: CREDIT_COST.synastry,
        balance: gate.balance,
      };
    }
    return { ok: false, error: "unavailable" };
  }

  const partner = await getPartnerForViewer(existing.id, userId);
  if (!partner) return { ok: false, error: "unavailable" };

  const synastry = computeSynastry(viewerChart.data, partner.chart);
  // Narrative is best-effort: the scores alone are already a full answer.
  const withAi = await ensureSynastryInterpretation(partner, locale).catch(
    () => partner,
  );
  const ai = withAi.aiInterpretation;

  const result: SynastryChatResult = {
    key: synastryKey(input.name, input.dateOfBirth, input.timeOfBirth),
    partnerId: partner.id,
    name: partner.name,
    url: `/synastry/${partner.id}`,
    overall: synastry.overall,
    verdict: en
      ? overallVerdictEn(synastry.overall)
      : overallVerdict(synastry.overall),
    scores: CATEGORIES.map((c) => ({
      id: c,
      label: en ? CATEGORY_LABEL_EN[c] : CATEGORY_LABEL_KA[c],
      emoji: CATEGORY_EMOJI[c],
      value: synastry.scores[c],
    })),
    aspects: synastry.topAspects.slice(0, 4).map((a) => {
      const mine = bodyLabel(a.a, locale);
      const theirs = bodyLabel(a.b, locale);
      return `${mine} ${aspectGlyph(a.kind)} ${theirs}`;
    }),
    summary: ai?.summary ?? null,
    strengths: ai?.strengths ?? [],
    growth: ai?.growth ?? [],
  };

  const intro = en
    ? `✨ Your compatibility with ${partner.name} is ready.`
    : `✨ ${partner.name}-თან თქვენი თავსებადობა მზადაა.`;
  return {
    ok: true,
    content: `${intro}${encodeMarker("synastry-result", result)}`,
    result,
  };
}
