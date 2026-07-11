// One-off campaign: announce the new IQ test to marketing-opted-in users.
// Usage:
//   node scripts/announce-iq-email.mjs test          → sends only to FOUNDER
//   node scripts/announce-iq-email.mjs all --dry     → prints recipients, sends nothing
//   node scripts/announce-iq-email.mjs all           → sends to all marketing-opted-in users
// Reads RESEND_API_KEY / RESEND_FROM / DATABASE_URL from .env.local or env.
//
// Audience: email_marketing = true (no birth-data gate — the IQ test needs
// none), excluding the brand account. One send per run — do NOT re-run "all".

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
  subject: "🧠 ახალი: IQ ტესტი Vivida-ზე",
  intro:
    "Vivida-ზე ახალი ტესტი გამოვიდა — IQ ტესტი. ის ადაპტიურია და კულტურულად ნეიტრალური: შენს დონეს ერგება, რაც უფრო სწორად პასუხობ, მით უფრო რთულდება — ისე, როგორც პროფესიულ ტესტებში.",
  points: [
    { e: "🎯", t: "შენი IQ ქულა და პროცენტილი", d: "ზუსტი შედეგი დიაპაზონით და გრაფიკით — სად ხარ მოსახლეობასთან შედარებით." },
    { e: "🧩", t: "აზროვნების პროფილი", d: "ლოგიკა, რიცხვები, სივრცე და პატერნები — ცალ-ცალკე, რომ დაინახო შენი ძლიერი მხარეები." },
    { e: "⏱️", t: "25 დავალება, ~25 წუთი", d: "დროზე გათვლილი, კულტურულად ნეიტრალური — უფასოდ, რეგისტრაციის გარეშე." },
  ],
  profileNote:
    "შედეგი, თუ გინდა, შენს საჯარო პროფილზეც გამოაჩინე — ან დაიტოვე მხოლოდ შენთვის.",
  button: "გაიარე IQ ტესტი",
  closing: "სითბოთი და ვარსკვლავური ენერგიით,<br/>Vivida-ს გუნდი",
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function html(name) {
  const greeting = name ? `გამარჯობა, ${esc(name)}` : "გამარჯობა";
  const points = C.points
    .map(
      (p) => `
      <tr><td style="padding:10px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;font-size:22px;padding-right:12px;">${p.e}</td>
          <td>
            <div style="color:#f2eefc;font-size:15px;font-weight:700;">${esc(p.t)}</div>
            <div style="color:#c2bcdd;font-size:14px;line-height:1.6;margin-top:2px;">${esc(p.d)}</div>
          </td>
        </tr></table>
      </td></tr>`
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#0b0814;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0814;padding:28px 12px;"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#140f24;border:1px solid #2a2247;border-radius:18px;overflow:hidden;">
    <tr><td style="padding:30px 34px 8px;">
      <div style="font-size:13px;letter-spacing:2px;color:#a78bfa;text-transform:uppercase;">Vivida</div>
      <h1 style="color:#ffffff;font-size:24px;margin:10px 0 0;">${greeting} ✨</h1>
    </td></tr>
    <tr><td style="padding:14px 34px 0;">
      <p style="color:#c2bcdd;font-size:15px;line-height:1.7;margin:0;">${esc(C.intro)}</p>
    </td></tr>
    <tr><td style="padding:14px 34px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${points}</table>
    </td></tr>
    <tr><td style="padding:18px 34px 0;">
      <p style="color:#c2bcdd;font-size:14px;line-height:1.6;margin:0;">${esc(C.profileNote)}</p>
    </td></tr>
    <tr><td style="padding:22px 34px 0;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
        <td style="border-radius:12px;background:linear-gradient(120deg,#a78bfa,#5fd2de);">
          <a href="${SITE}/iq-testi" style="display:inline-block;padding:13px 30px;color:#0b0814;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">${esc(C.button)}</a>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:24px 34px 30px;">
      <p style="color:#c2bcdd;font-size:14px;line-height:1.6;margin:0;">${C.closing}</p>
    </td></tr>
    <tr><td style="padding:16px 34px;border-top:1px solid #2a2247;text-align:center;">
      <div style="color:#7a7196;font-size:12px;">Vivida · ასტროლოგია და ტესტები ქართულად</div>
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
  const sql = neon(process.env.DATABASE_URL);

  let recipients;
  if (mode === "test") {
    const r = await sql`SELECT email, name FROM "user" WHERE email=${FOUNDER}`;
    recipients = r.length ? r : [{ email: FOUNDER, name: "Givi" }];
  } else if (mode === "all") {
    recipients = await sql`SELECT email, name FROM "user"
      WHERE email_marketing = true AND email IS NOT NULL
        AND email <> 'team@vivida.ge'`;
  } else {
    throw new Error(`unknown mode: ${mode}`);
  }

  console.log(`mode=${mode} recipients=${recipients.length}${dry ? " (DRY RUN — nothing sent)" : ""}`);
  if (dry) {
    console.log("subject:", C.subject);
    console.log(`(showing first 5 of ${recipients.length})`);
    recipients.slice(0, 5).forEach((r) => console.log(" -", r.email));
    return;
  }
  if (!KEY) throw new Error("RESEND_API_KEY missing");

  let ok = 0;
  for (const r of recipients) {
    try {
      const id = await send(r.email, r.name?.split(" ")[0] ?? null);
      ok++;
      console.log("sent", r.email, id);
    } catch (e) {
      console.log("FAIL", r.email, e.message);
    }
    await new Promise((res) => setTimeout(res, 600)); // stay under Resend rate limit
  }
  console.log(`done: ${ok}/${recipients.length} sent`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
