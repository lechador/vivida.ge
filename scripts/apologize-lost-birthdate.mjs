// One-off: apologise to the users whose birth date was silently dropped by the
// onboarding upsert bug (2026-08-17 → 2026-08-19, fixed in da1f7ed) and ask
// them to re-enter just the date.
//
// Cohort: profile rows with city_name set (they DID finish the wizard) but
// date_of_birth NULL. All Georgian-locale, all verified, all opted in.
//
// Usage:
//   node scripts/apologize-lost-birthdate.mjs test      → sends only to FOUNDER
//   node scripts/apologize-lost-birthdate.mjs all --dry → lists recipients, sends nothing
//   node scripts/apologize-lost-birthdate.mjs all       → sends for real
//
// Logs two email_send_log rows per recipient: 'birthdate_lost' for the audit
// trail, and 'profile_incomplete' so the automated renudge (max 2) counts this
// as one of its sends and doesn't follow up tomorrow with the generic
// "you never finished onboarding" nudge, which would be wrong for these users.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const FOUNDER = "endeladzegivi@gmail.com";
const SITE = "https://www.vivida.ge";
const rawFrom = process.env.RESEND_FROM || "hello@vivida.ge";
const FROM = rawFrom.includes("<") ? rawFrom : `Vivida <${rawFrom}>`;
const KEY = process.env.RESEND_API_KEY;

const mode = process.argv[2] || "test";
const dry = process.argv.includes("--dry");

const C = {
  subject: "შენი დაბადების თარიღი ვერ შევინახეთ, ბოდიშს გიხდით",
  heading: "ტექნიკური ხარვეზი ჩვენი მხრიდან",
  p1: "17-19 აგვისტოს Vivida-ზე ტექნიკური ხარვეზი იყო: შენ შეავსე დაბადების მონაცემები, მაგრამ დაბადების თარიღი ჩვენს ბაზაში ვერ შეინახა. სწორედ ამიტომ ვერ გამოგითვალეთ ნატალური რუკა და ვერ მიიღე ყოველდღიური ჰოროსკოპი.",
  p2: "ხარვეზი უკვე გამოსწორებულია. დაბადების ქალაქი და დრო შენახულია, ხელახლა მხოლოდ თარიღია შესაყვანი, რასაც რამდენიმე წამი დასჭირდება.",
  boxTitle: "რა მოხდება შემდეგ",
  boxBody: "თარიღის შევსებისთანავე ავტომატურად გამოითვლება შენი ნატალური რუკა, მზე, მთვარე და ასცენდენტი, სრული ინტერპრეტაცია, ყოველდღიური ჰოროსკოპი და თავსებადობა.",
  button: "შეავსე დაბადების თარიღი",
  closing: "ბოდიშს გიხდით შეფერხებისთვის.<br/>Vivida-ს გუნდი",
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function html(name) {
  const greeting = name ? `სალამი, ${esc(name)}` : "სალამი";
  return `<!doctype html><html lang="ka"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(C.subject)}</title></head>
<body style="margin:0;padding:0;background:#0b0814;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0814;">
<tr><td align="center" style="padding:28px 14px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#14102a;border:1px solid #2a2247;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <tr><td style="height:6px;background:#8b5cf6;background:linear-gradient(120deg,#a78bfa,#f472b6,#22d3ee);"></td></tr>
    <tr><td style="padding:30px 34px 8px;text-align:center;">
      <div style="font-size:26px;font-weight:800;letter-spacing:-.5px;color:#b884f2;">vivida</div>
    </td></tr>
    <tr><td style="padding:14px 34px 0;">
      <div style="color:#f1eef8;font-size:20px;font-weight:700;">${esc(C.heading)}</div>
      <p style="color:#c2bcdd;font-size:15px;line-height:1.6;margin:14px 0 0;">${greeting},</p>
      <p style="color:#c2bcdd;font-size:15px;line-height:1.6;margin:12px 0 0;">${esc(C.p1)}</p>
      <p style="color:#c2bcdd;font-size:15px;line-height:1.6;margin:12px 0 0;">${esc(C.p2)}</p>
    </td></tr>
    <tr><td style="padding:18px 34px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1533;border:1px solid #3b2f66;border-radius:12px;">
        <tr><td style="padding:18px;">
          <div style="color:#f1eef8;font-weight:700;font-size:16px;">${esc(C.boxTitle)}</div>
          <p style="color:#cfc7df;font-size:14px;line-height:1.6;margin:8px 0 0;">${esc(C.boxBody)}</p>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:22px 34px 0;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
        <td style="border-radius:12px;background:#8b5cf6;background:linear-gradient(120deg,#a78bfa,#f472b6);">
          <a href="${SITE}/onboarding" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;">${esc(C.button)}</a>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:26px 34px 30px;">
      <p style="color:#c2bcdd;font-size:14px;line-height:1.6;margin:0;">${C.closing}</p>
    </td></tr>
    <tr><td style="padding:16px 34px;border-top:1px solid #2a2247;text-align:center;">
      <div style="color:#7a7196;font-size:12px;">Vivida · ასტროლოგია ქართულად</div>
      <div style="color:#5f5880;font-size:11px;margin-top:6px;">
        <a href="${SITE}/account" style="color:#7a7196;">იმეილის პარამეტრები</a>
      </div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

async function send(to, name) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject: C.subject, html: html(name) }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${res.status}: ${JSON.stringify(body)}`);
  return body.id;
}

async function main() {
  if (!KEY) throw new Error("RESEND_API_KEY missing");
  const sql = neon(process.env.DATABASE_URL);

  const cohort = await sql`
    SELECT u.id, u.email, u.name, p.username
    FROM profile p JOIN "user" u ON u.id = p.user_id
    WHERE p.date_of_birth IS NULL AND p.city_name IS NOT NULL AND u.email IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM email_send_log e
        WHERE e.user_id = u.id AND e.kind = 'birthdate_lost'
      )
    ORDER BY u.created_at DESC`;

  const recipients =
    mode === "test"
      ? [{ id: null, email: FOUNDER, name: "Givi", username: "preview" }]
      : mode === "all"
        ? cohort
        : (() => { throw new Error(`unknown mode: ${mode}`); })();

  console.log(`mode=${mode} recipients=${recipients.length}${dry ? " (DRY RUN, nothing sent)" : ""}`);
  if (dry) {
    recipients.forEach((r) => console.log(" -", r.email, r.username ?? ""));
    return;
  }

  let ok = 0;
  for (const r of recipients) {
    try {
      const id = await send(r.email, r.name?.split(" ")[0] ?? null);
      ok++;
      console.log("sent", r.email, id);
      if (r.id) {
        // Audit row + one consumed slot of the automated profile_incomplete
        // cadence, so tomorrow's cron doesn't send the generic nudge too.
        await sql`INSERT INTO email_send_log (user_id, kind, email, subject, status)
                  VALUES (${r.id}, 'birthdate_lost', ${r.email}, ${C.subject}, 'sent'),
                         (${r.id}, 'profile_incomplete', ${r.email}, ${C.subject}, 'sent')`;
      }
    } catch (e) {
      console.log("FAIL", r.email, e.message);
    }
    await new Promise((res) => setTimeout(res, 600));
  }
  console.log(`done: ${ok}/${recipients.length} sent`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
