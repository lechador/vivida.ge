import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creditGuardrail,
  freeCreditRatio,
  type CreditGuardrail,
} from "@/lib/credit-economy-metrics";

export type ExperimentMetricRow = {
  experiment: string;
  variant: string;
  assigned: number;
  exposed: number;
  checkoutStarted: number;
  purchaseCompleted: number;
};

export type ReminderFunnelRow = {
  topic: string;
  optedIn: number;
  delivered: number;
  valueCompleted: number;
  optedOut: number;
};

export type CreditWeekRow = {
  weekStart: string;
  freeIssued: number;
  purchased: number;
  spent: number;
  ratio: number | null;
  guardrail: CreditGuardrail;
};

export type RelationshipMetrics = {
  invitesCreated: number;
  invitesAccepted: number;
  weeklySubscribers: number;
  transitSubscribers: number;
  answers: number;
  answerUsers: number;
  weeklyUpdates: number;
};

export type FirstPurchaseMetrics = {
  total: number;
  credits: number;
  premium: number;
  newRegistrations: number;
  returningUsers: number;
  valueDelivered24h: number;
};

function numberValue(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export async function getGrowthMetrics(days: 28 | 84): Promise<{
  experiments: ExperimentMetricRow[];
  reminders: ReminderFunnelRow[];
  creditWeeks: CreditWeekRow[];
  creditSummary: { freeIssued: number; purchased: number; spent: number };
  relationships: RelationshipMetrics;
  firstPurchases: FirstPurchaseMetrics;
}> {
  const interval = `${days} days`;
  const [experimentResult, preferenceResult, deliveryResult, creditResult, creditSummaryResult, relationshipResult, firstPurchaseResult] = await Promise.all([
    db.execute(sql`
      SELECT
        a.experiment,
        a.variant,
        count(DISTINCT a.user_id) FILTER (
          WHERE a.assigned_at >= now() - ${interval}::interval
        )::int AS assigned,
        count(DISTINCT e.user_id) FILTER (
          WHERE e.event_type = 'exposure'
        )::int AS exposed,
        count(DISTINCT e.event_key) FILTER (
          WHERE e.event_type = 'outcome' AND e.event_name = 'checkout_started'
        )::int AS checkout_started,
        count(DISTINCT e.event_key) FILTER (
          WHERE e.event_type = 'outcome' AND e.event_name = 'purchase_completed'
        )::int AS purchase_completed
      FROM experiment_assignment a
      LEFT JOIN experiment_event e
        ON e.user_id = a.user_id
       AND e.experiment = a.experiment
       AND e.created_at >= now() - ${interval}::interval
      WHERE a.experiment IN (
        'pricing_presentation_v1',
        'contextual_paywall_v1',
        'reminder_prompt_v1'
      )
      GROUP BY a.experiment, a.variant
      ORDER BY a.experiment, a.variant
    `),
    db.execute(sql`
      SELECT
        topic,
        count(DISTINCT user_id) FILTER (WHERE event_type = 'opt_in')::int AS opted_in,
        count(DISTINCT user_id) FILTER (WHERE event_type = 'opt_out')::int AS opted_out
      FROM reminder_preference_event
      WHERE created_at >= now() - ${interval}::interval
      GROUP BY topic
    `),
    db.execute(sql`
      SELECT
        topic,
        count(DISTINCT (user_id, delivery_key)) FILTER (WHERE status = 'sent')::int AS delivered,
        count(DISTINCT (user_id, delivery_key)) FILTER (
          WHERE status = 'sent' AND value_completed_at IS NOT NULL
        )::int AS value_completed
      FROM reminder_delivery
      WHERE created_at >= now() - ${interval}::interval
      GROUP BY topic
    `),
    db.execute(sql`
      WITH weeks AS (
        SELECT generate_series(
          date_trunc('week', timezone('Asia/Tbilisi', now())) - interval '3 weeks',
          date_trunc('week', timezone('Asia/Tbilisi', now())),
          interval '1 week'
        ) AS week_start
      )
      SELECT
        to_char(w.week_start, 'YYYY-MM-DD') AS week_start,
        coalesce(sum(CASE WHEN t.amount > 0 AND t.reason <> 'purchase' THEN t.amount ELSE 0 END), 0)::int AS free_issued,
        coalesce(sum(CASE WHEN t.amount > 0 AND t.reason = 'purchase' THEN t.amount ELSE 0 END), 0)::int AS purchased,
        coalesce(sum(CASE WHEN t.amount < 0 THEN -t.amount ELSE 0 END), 0)::int AS spent
      FROM weeks w
      LEFT JOIN credit_transaction t
        ON timezone('Asia/Tbilisi', t.created_at) >= w.week_start
       AND timezone('Asia/Tbilisi', t.created_at) < w.week_start + interval '1 week'
      GROUP BY w.week_start
      ORDER BY w.week_start
    `),
    db.execute(sql`
      SELECT
        coalesce(sum(CASE WHEN amount > 0 AND reason <> 'purchase' THEN amount ELSE 0 END), 0)::int AS free_issued,
        coalesce(sum(CASE WHEN amount > 0 AND reason = 'purchase' THEN amount ELSE 0 END), 0)::int AS purchased,
        coalesce(sum(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0)::int AS spent
      FROM credit_transaction
      WHERE created_at >= now() - interval '28 days'
    `),
    db.execute(sql`
      WITH invites AS (
        SELECT
          count(*) FILTER (
            WHERE p.invite_accepted_at >= now() - ${interval}::interval
               OR p.invite_expires_at >= now() - ${interval}::interval
          )::int AS created,
          count(*) FILTER (
            WHERE p.invite_accepted_at >= now() - ${interval}::interval
          )::int AS accepted
        FROM partner p
        WHERE p.deleted_at IS NULL
      ),
      subscribers AS (
        SELECT
          count(*) FILTER (WHERE s.weekly_enabled)::int AS weekly,
          count(*) FILTER (WHERE s.transit_enabled)::int AS transit
        FROM relationship_subscription s
        JOIN partner p ON p.id = s.partner_id AND p.deleted_at IS NULL
      )
      SELECT
        (SELECT created FROM invites) AS invites_created,
        (SELECT accepted FROM invites) AS invites_accepted,
        (SELECT weekly FROM subscribers) AS weekly_subscribers,
        (SELECT transit FROM subscribers) AS transit_subscribers,
        (SELECT count(*)::int FROM relationship_checkin_answer
          WHERE updated_at >= now() - ${interval}::interval) AS answers,
        (SELECT count(DISTINCT user_id)::int FROM relationship_checkin_answer
          WHERE updated_at >= now() - ${interval}::interval) AS answer_users,
        (SELECT count(*)::int FROM relationship_weekly_update
          WHERE created_at >= now() - ${interval}::interval) AS weekly_updates
    `),
    db.execute(sql`
      WITH purchase_events AS (
        SELECT user_id, created_at AS purchased_at, 'credits'::text AS product
        FROM credit_transaction
        WHERE reason = 'purchase'
          AND left(ref, 3) = 'cs_'
        UNION ALL
        SELECT user_id, created_at AS purchased_at, 'premium'::text AS product
        FROM premium_subscription
        WHERE source = 'stripe'
      ), first_purchase AS (
        SELECT DISTINCT ON (user_id)
          user_id,
          purchased_at,
          product
        FROM purchase_events
        ORDER BY user_id, purchased_at, product
      ), scoped AS (
        SELECT
          f.user_id,
          f.purchased_at,
          f.product,
          u.created_at AS registered_at
        FROM first_purchase f
        JOIN "user" u ON u.id = f.user_id
        WHERE f.purchased_at >= now() - ${interval}::interval
      )
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE product = 'credits')::int AS credits,
        count(*) FILTER (WHERE product = 'premium')::int AS premium,
        count(*) FILTER (
          WHERE purchased_at < registered_at + interval '7 days'
        )::int AS new_registrations,
        count(*) FILTER (
          WHERE purchased_at >= registered_at + interval '7 days'
        )::int AS returning_users,
        count(*) FILTER (
          WHERE EXISTS (
            SELECT 1
            FROM library_entry l
            WHERE l.user_id = scoped.user_id
              AND l.created_at >= scoped.purchased_at
              AND l.created_at < scoped.purchased_at + interval '24 hours'
          )
        )::int AS value_delivered_24h
      FROM scoped
    `),
  ]);

  const experiments = experimentResult.rows.map((row) => ({
    experiment: String(row.experiment),
    variant: String(row.variant),
    assigned: numberValue(row.assigned),
    exposed: numberValue(row.exposed),
    checkoutStarted: numberValue(row.checkout_started),
    purchaseCompleted: numberValue(row.purchase_completed),
  }));

  const reminderMap = new Map<string, ReminderFunnelRow>();
  for (const row of preferenceResult.rows) {
    const topic = String(row.topic);
    reminderMap.set(topic, {
      topic,
      optedIn: numberValue(row.opted_in),
      delivered: 0,
      valueCompleted: 0,
      optedOut: numberValue(row.opted_out),
    });
  }
  for (const row of deliveryResult.rows) {
    const topic = String(row.topic);
    const key = topic;
    const current = reminderMap.get(key) ?? {
      topic,
      optedIn: 0,
      delivered: 0,
      valueCompleted: 0,
      optedOut: 0,
    };
    current.delivered = numberValue(row.delivered);
    current.valueCompleted = numberValue(row.value_completed);
    reminderMap.set(key, current);
  }

  const creditWeeks = creditResult.rows.map((row) => {
    const freeIssued = numberValue(row.free_issued);
    const spent = numberValue(row.spent);
    const ratio = freeCreditRatio(freeIssued, spent);
    return {
      weekStart: String(row.week_start),
      freeIssued,
      purchased: numberValue(row.purchased),
      spent,
      ratio,
      guardrail: creditGuardrail(ratio),
    };
  });

  const relationshipRow = relationshipResult.rows[0] ?? {};
  const relationships: RelationshipMetrics = {
    invitesCreated: numberValue(relationshipRow.invites_created),
    invitesAccepted: numberValue(relationshipRow.invites_accepted),
    weeklySubscribers: numberValue(relationshipRow.weekly_subscribers),
    transitSubscribers: numberValue(relationshipRow.transit_subscribers),
    answers: numberValue(relationshipRow.answers),
    answerUsers: numberValue(relationshipRow.answer_users),
    weeklyUpdates: numberValue(relationshipRow.weekly_updates),
  };
  const firstPurchaseRow = firstPurchaseResult.rows[0] ?? {};
  const firstPurchases: FirstPurchaseMetrics = {
    total: numberValue(firstPurchaseRow.total),
    credits: numberValue(firstPurchaseRow.credits),
    premium: numberValue(firstPurchaseRow.premium),
    newRegistrations: numberValue(firstPurchaseRow.new_registrations),
    returningUsers: numberValue(firstPurchaseRow.returning_users),
    valueDelivered24h: numberValue(firstPurchaseRow.value_delivered_24h),
  };

  return {
    experiments,
    reminders: [...reminderMap.values()].sort((a, b) => a.topic.localeCompare(b.topic)),
    creditWeeks,
    creditSummary: {
      freeIssued: numberValue(creditSummaryResult.rows[0]?.free_issued),
      purchased: numberValue(creditSummaryResult.rows[0]?.purchased),
      spent: numberValue(creditSummaryResult.rows[0]?.spent),
    },
    relationships,
    firstPurchases,
  };
}
