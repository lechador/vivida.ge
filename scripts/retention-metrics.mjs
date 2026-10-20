// Read-only retention + monetization scoreboard.
//
// Why this exists: the plan (docs/product-growth-priorities.md and
// analysis/vivida-retention-monetization-plan-2026-10-16.md) defines a set of
// targets and guardrails, but there was no single command to read them, and no
// committed query at all. The 2026-10 audit that found the nine-week email
// outage was done by hand-written throwaway SQL. This replaces that.
//
// It is read-only by construction: every query runs inside a READ ONLY
// transaction. It writes nothing and decides nothing.
//
// Usage:
//   node scripts/retention-metrics.mjs           # human-readable report
//   node scripts/retention-metrics.mjs --json    # machine-readable, for a cron or CI
//
// Exit code is 1 when a hard guardrail is breached (see GUARDRAILS), 0 otherwise,
// so it can gate a release or page an operator.
//
// Definitions deliberately mirror the plan:
//   - D1 / W1 / D30 are "any activity in the window after the signup date", the
//     existing user_activity_day basis. They are NOT exact-day retention, and a
//     cohort too young for a window is reported as immature, never as not-retained.
//   - payer conversion counts Stripe credit purchases or a PRO subscription.
//   - the credit guardrail is free-issued / spent over a rolling 28 days; the plan
//     says stop above 2.5x.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// ── env ───────────────────────────────────────────────────────────────────────
try {
  for (const line of readFileSync(
    new URL("../.env.local", import.meta.url),
    "utf8",
  ).split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // No .env.local: fall back to the process environment.
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is not set (checked process env and .env.local).",
  );
  process.exit(2);
}

const asJson = process.argv.includes("--json");
// Admin grants are operator noise, not part of the economy. Excluded by default
// so the ratio reflects what users actually accrue.
const INCLUDE_ADMIN_GRANTS = process.argv.includes("--include-admin-grants");

const sql = neon(url);

/**
 * Run the given statements inside ONE READ ONLY transaction.
 *
 * neon's `transaction()` resolves to an array of per-statement result arrays
 * (the leading `SET` yields `[]`), so the SET is dropped. Returns the raw row
 * arrays; the caller takes `[0]` where a statement returns a single row.
 */
async function q(statements) {
  const results = await sql.transaction(
    (txn) => [txn`SET TRANSACTION READ ONLY`, ...statements(txn)],
    { isolationLevel: "ReadCommitted" },
  );
  return results.slice(1);
}

const pct = (num, den) =>
  den > 0 ? Number(((100 * num) / den).toFixed(2)) : null;
const days = (a, b) => Math.floor((a - b) / 86_400_000);

// ── the report ────────────────────────────────────────────────────────────────
async function main() {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const rows = await q((txn) => [
    // Daily / weekly / monthly actives.
    txn`
      select
        count(distinct user_id) filter (where date_local > to_char(current_date - 28, 'YYYY-MM-DD'))::int as mau28,
        count(distinct user_id) filter (where date_local > to_char(current_date - 7, 'YYYY-MM-DD'))::int as wau7,
        count(distinct user_id) filter (where date_local = to_char(current_date - 1, 'YYYY-MM-DD'))::int as dau_prev
      from user_activity_day`,
    // Activation: did they ever supply the birth data the product needs?
    txn`
      select
        count(*)::int as users,
        count(*) filter (where date_of_birth is not null)::int as with_dob,
        count(*) filter (where time_of_birth is not null)::int as with_time
      from "user" u left join profile p on p.user_id = u.id`,
    // Push is the cheapest re-engagement channel; adoption gates everything.
    txn`select count(*)::int as subs from push_subscription`,
    // Cohort return. Immature windows are excluded from the percentage rather
    // than counted as failures.
    txn`
      with u as (select id, to_char(created_at, 'YYYY-MM-DD') cd from "user"),
      a as (select distinct user_id, date_local d from user_activity_day),
      j as (
        select u.id, u.cd,
          exists(select 1 from a where a.user_id = u.id and a.d > u.cd
            and a.d <= to_char(u.cd::date + 1, 'YYYY-MM-DD')) as d1,
          exists(select 1 from a where a.user_id = u.id and a.d > u.cd
            and a.d <= to_char(u.cd::date + 7, 'YYYY-MM-DD')) as w1,
          exists(select 1 from a where a.user_id = u.id and a.d > u.cd
            and a.d <= to_char(u.cd::date + 30, 'YYYY-MM-DD')) as d30
        from u)
      select left(cd, 7) as cohort, count(*)::int as n,
        count(*) filter (where d1)::int as d1, count(*) filter (where w1)::int as w1,
        count(*) filter (where d30)::int as d30,
        -- A cohort is mature for a window only once every member has had the
        -- chance to return within it.
        bool_and(cd::date <= current_date - 1) as m_d1,
        bool_and(cd::date <= current_date - 7) as m_w1,
        bool_and(cd::date <= current_date - 30) as m_d30
      from j group by 1 order by 1`,
    // Habit depth: how many distinct days in the last 28.
    txn`
      with d as (
        select user_id, count(distinct date_local) as days
        from user_activity_day
        where date_local > to_char(current_date - 28, 'YYYY-MM-DD')
        group by 1)
      select
        count(*)::int as active,
        count(*) filter (where days = 1)::int as one_day,
        count(*) filter (where days >= 8)::int as eight_plus,
        count(*) filter (where days >= 15)::int as fifteen_plus
      from d`,
    // Credit economy: supply vs spend over 28 days.
    txn`
      select
        coalesce(sum(amount) filter (where amount > 0
          and reason not in ('purchase')
          ${INCLUDE_ADMIN_GRANTS ? txn`` : txn`and reason <> 'admin_grant'`}), 0)::int as free_issued,
        coalesce(sum(amount) filter (where amount > 0 and reason = 'purchase'), 0)::int as purchased,
        coalesce(-sum(amount) filter (where amount < 0), 0)::int as spent,
        count(distinct user_id) filter (where amount < 0)::int as spenders
      from credit_transaction
      where created_at > now() - interval '28 days'`,
    // Payer counts, lifetime and trailing 30 days.
    txn`
      select
        (select count(distinct user_id) from credit_transaction where reason = 'purchase')::int as credit_buyers,
        (select count(distinct user_id) from premium_subscription where status = 'active')::int as active_subs,
        (select count(*) from "user")::int as total_users,
        (select count(*) from "user" where created_at > now() - interval '30 days')::int as signups_30d,
        (select count(distinct u.id) from "user" u
          where u.created_at > now() - interval '30 days'
            and (u.id in (select user_id from credit_transaction where reason = 'purchase')
                 or u.id in (select user_id from premium_subscription)))::int as converted_30d`,
    // Paywall funnel, from recorded experiment outcomes. Purchases are written
    // server-side from the Stripe webhook, so this is not a browser proxy.
    txn`
      with e as (
        select user_id, event_name from experiment_event
        where experiment in ('contextual_paywall_v1', 'pricing_presentation_v1'))
      select
        (select count(distinct user_id) from e where event_name = 'viewed')::int as exposed,
        (select count(distinct user_id) from e where event_name = 'checkout_started')::int as started,
        (select count(distinct user_id) from e where event_name = 'purchase_completed')::int as purchased`,
    // Lifecycle email silence. These are the sequences that went silent for
    // nine weeks in Aug-Oct 2026; win-back v1 replaced the single `winback`
    // kind with three steps.
    txn`
      select kind, max(sent_at) as last_sent
      from email_send_log
      where kind in ('profile_incomplete', 'winback_v1_s1', 'winback_v1_s2',
                     'winback_v1_s3', 'verify_reminder')
      group by 1 order by 1`,
    // Daily blast delivery for today, and the orphaned backlog.
    txn`
      select
        (select count(*) from daily_email_log where send_date = ${todayKey})::int as enqueued_today,
        (select count(*) from daily_email_log where send_date = ${todayKey} and status = 'sent')::int as sent_today,
        -- Split deliberately: 'pending' is the orphaned backlog the drain never
        -- revisits, 'failed' is a smaller set of older hard failures. Summing
        -- them hides which one is growing.
        (select count(*) from daily_email_log where status = 'pending')::int as outstanding_pending,
        (select count(*) from daily_email_log where status = 'failed')::int as outstanding_failed`,
  ]);

  const [
    [activity],
    [profiles],
    [push],
    cohorts,
    [activeDays],
    [credits],
    [payers],
    [funnel],
    lifecycle,
    [dailyBlast],
  ] = rows;

  // ── derive ─────────────────────────────────────────────────────────────────
  const dauMau = pct(activity.dau_prev, activity.mau28);
  const dobPct = pct(profiles.with_dob, profiles.users);
  const pushPct = pct(push.subs, activity.mau28);
  const eightPlusPct = pct(activeDays.eight_plus, activeDays.active);
  const creditRatio =
    credits.spent > 0
      ? Number((credits.free_issued / credits.spent).toFixed(2))
      : null;
  const payerPct = pct(payers.converted_30d, payers.signups_30d);
  const deliveryPct = pct(dailyBlast.sent_today, dailyBlast.enqueued_today);
  const funnelToCheckout = pct(funnel.started, funnel.exposed);
  const funnelToPurchase = pct(funnel.purchased, funnel.exposed);
  const funnelAbandon = pct(funnel.started - funnel.purchased, funnel.started);

  const lifecycleRows = lifecycle.map((r) => ({
    kind: r.kind,
    lastSent: r.last_sent
      ? new Date(r.last_sent).toISOString().slice(0, 10)
      : null,
    silentDays: r.last_sent
      ? days(now.getTime(), new Date(r.last_sent).getTime())
      : null,
  }));

  // ── guardrails ─────────────────────────────────────────────────────────────
  const alerts = [];
  if (deliveryPct !== null && deliveryPct < 90) {
    alerts.push(
      `daily email delivery ${deliveryPct}% (<90%) — ${dailyBlast.sent_today}/${dailyBlast.enqueued_today}`,
    );
  }
  for (const row of lifecycleRows) {
    if (row.silentDays === null) alerts.push(`${row.kind}: never sent`);
    else if (row.silentDays > 14)
      alerts.push(`${row.kind}: silent ${row.silentDays}d`);
  }
  if (creditRatio !== null && creditRatio > 2.5) {
    alerts.push(`free-credit ratio ${creditRatio}x (>2.5x stop threshold)`);
  }
  if (dobPct !== null && dobPct < 70) {
    alerts.push(`birth-profile completion ${dobPct}% (<70%)`);
  }

  const report = {
    capturedAt: now.toISOString(),
    activity: { ...activity, dauMauPct: dauMau },
    activation: { ...profiles, dobPct },
    push: { subs: push.subs, amongMauPct: pushPct },
    cohorts: cohorts.map((c) => ({
      cohort: c.cohort,
      n: c.n,
      d1Pct: c.m_d1 ? pct(c.d1, c.n) : null,
      w1Pct: c.m_w1 ? pct(c.w1, c.n) : null,
      d30Pct: c.m_d30 ? pct(c.d30, c.n) : null,
    })),
    habit: { ...activeDays, eightPlusPct },
    credits: { ...credits, freeToSpendRatio: creditRatio },
    payers: { ...payers, payerPct30d: payerPct },
    paywallFunnel: {
      ...funnel,
      exposedToCheckoutPct: funnelToCheckout,
      exposedToPurchasePct: funnelToPurchase,
      checkoutAbandonPct: funnelAbandon,
    },
    dailyBlast: {
      ...dailyBlast,
      outstandingTotal:
        dailyBlast.outstanding_pending + dailyBlast.outstanding_failed,
      deliveryPct,
    },
    lifecycle: lifecycleRows,
    alerts,
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    print(report);
  }
  return alerts.length > 0 ? 1 : 0;
}

function print(r) {
  const line = (label, value) => console.log(`  ${label.padEnd(34)} ${value}`);
  const head = (t) => console.log(`\n${t}`);

  head("ACTIVITY");
  line("MAU (28d)", r.activity.mau28);
  line("WAU (7d)", r.activity.wau7);
  line("DAU (yesterday)", r.activity.dau_prev);
  line("DAU / MAU", `${r.activity.dauMauPct ?? "—"}%   (target 8-10%)`);

  head("ACTIVATION");
  line(
    "users with a birth date",
    `${r.activation.with_dob} / ${r.activation.users}  (${r.activation.dobPct ?? "—"}%)`,
  );
  line("users with a birth time", r.activation.with_time);
  line(
    "push subscriptions",
    `${r.push.subs}  (${r.push.amongMauPct ?? "—"}% of MAU, target 20%)`,
  );

  head("COHORT RETURN  (any activity in window; immature cohorts show —)");
  console.log("  cohort    users     D1      W1     D30");
  for (const c of r.cohorts) {
    console.log(
      `  ${c.cohort}  ${String(c.n).padStart(5)}  ${fmt(c.d1Pct).padStart(6)}  ${fmt(c.w1Pct).padStart(6)}  ${fmt(c.d30Pct).padStart(6)}`,
    );
  }

  head("HABIT DEPTH (last 28 days)");
  line("active users", r.habit.active);
  line(
    "active exactly 1 day",
    `${r.habit.one_day}  (${pct(r.habit.one_day, r.habit.active)}%)`,
  );
  line(
    "active 8+ days",
    `${r.habit.eight_plus}  (${r.habit.eightPlusPct ?? "—"}%, target 12%)`,
  );

  head("CREDIT ECONOMY (rolling 28 days)");
  line("free credits issued", r.credits.free_issued);
  line("credits purchased", r.credits.purchased);
  line("credits spent", r.credits.spent);
  line(
    "free / spent ratio",
    `${r.credits.freeToSpendRatio ?? "—"}x   (stop above 2.5x)`,
  );
  line("distinct spenders", r.credits.spenders);

  head("PAYERS");
  line("credit buyers (lifetime)", r.payers.credit_buyers);
  line("active PRO subscriptions", r.payers.active_subs);
  line(
    "30-day payer conversion",
    `${r.payers.converted_30d} / ${r.payers.signups_30d}  (${r.payers.payerPct30d ?? "—"}%)`,
  );

  head("PAYWALL FUNNEL");
  line("exposed", r.paywallFunnel.exposed);
  line(
    "reached checkout",
    `${r.paywallFunnel.started}  (${r.paywallFunnel.exposedToCheckoutPct ?? "—"}% of exposed)`,
  );
  line(
    "purchased",
    `${r.paywallFunnel.purchased}  (${r.paywallFunnel.exposedToPurchasePct ?? "—"}% of exposed)`,
  );
  line("checkout abandonment", `${r.paywallFunnel.checkoutAbandonPct ?? "—"}%`);

  head("DAILY EMAIL BLAST (today)");
  line(
    "enqueued / sent",
    `${r.dailyBlast.enqueued_today} / ${r.dailyBlast.sent_today}  (${r.dailyBlast.deliveryPct ?? "—"}%, target 90%+)`,
  );
  line("orphaned pending rows", r.dailyBlast.outstanding_pending);
  line("failed rows", r.dailyBlast.outstanding_failed);

  head("LIFECYCLE SEQUENCES");
  for (const row of r.lifecycle) {
    line(
      row.kind,
      row.lastSent ? `${row.lastSent}  (${row.silentDays}d ago)` : "never sent",
    );
  }

  if (r.alerts.length > 0) {
    console.log("\n\x1b[31mGUARDRAIL BREACHES\x1b[0m");
    for (const a of r.alerts) console.log(`  - ${a}`);
  } else {
    console.log("\n\x1b[32mAll guardrails within range.\x1b[0m");
  }
}

const fmt = (v) => (v === null ? "—" : `${v}%`);

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error("retention-metrics failed:", err.message);
    process.exit(2);
  });
